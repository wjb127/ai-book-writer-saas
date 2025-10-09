import { NextRequest, NextResponse } from 'next/server'
import { getGenerationProgress } from '@/app/api/generate-book/route'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  const { bookId } = params
  const url = new URL(request.url)
  const isSSE = url.searchParams.get('stream') !== 'false'

  // SSE 스트리밍 요청
  if (isSSE) {
    logger.info('SSE progress stream started', { bookId })

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false
        let interval: NodeJS.Timeout | null = null
        let timeout: NodeJS.Timeout | null = null
        let waitAttempts = 0
        const MAX_WAIT_ATTEMPTS = 15 // 15초 대기

        const cleanup = () => {
          if (!isClosed) {
            isClosed = true
            if (interval) clearInterval(interval)
            if (timeout) clearTimeout(timeout)
            try {
              controller.close()
            } catch (e) {
              // Controller already closed, ignore
            }
          }
        }

        const sendProgress = () => {
          // Controller가 이미 닫혔으면 실행하지 않음
          if (isClosed) return true

          const progress = getGenerationProgress(bookId)

          // progress가 아직 없으면 대기 (최대 15초)
          if (!progress) {
            waitAttempts++

            if (waitAttempts <= MAX_WAIT_ATTEMPTS) {
              // 아직 대기 중 - 초기화 메시지 전송
              try {
                const waitingData = {
                  bookId,
                  waiting: true,
                  message: '책 생성을 준비하고 있습니다...',
                  attempts: waitAttempts
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(waitingData)}\n\n`))
              } catch (e) {
                // Controller already closed, ignore
              }
              return false
            } else {
              // 15초 넘게 기다렸는데도 없으면 에러
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ error: 'Not found' })}\n\n`)
                )
              } catch (e) {
                // Controller already closed, ignore
              }
              cleanup()
              logger.error('Progress not found after waiting', { bookId, waitAttempts })
              return true
            }
          }

          // progress 발견 - 대기 카운터 리셋
          waitAttempts = 0

          const chapters = Array.from(progress.chapters.entries()).map(([idx, chapter]) => ({
            index: idx,
            title: chapter.title,
            status: chapter.status,
            contentLength: chapter.content.length
          }))

          const elapsedTime = Date.now() - progress.startedAt
          const completionRate = progress.completedChapters / progress.totalChapters
          const estimatedTotalTime = completionRate > 0 ? elapsedTime / completionRate : 0
          const estimatedRemainingTime = Math.max(0, estimatedTotalTime - elapsedTime)

          const data = {
            bookId: progress.bookId,
            totalChapters: progress.totalChapters,
            completedChapters: progress.completedChapters,
            progress: Math.round(completionRate * 100),
            elapsedTime: Math.round(elapsedTime / 1000),
            estimatedRemainingTime: Math.round(estimatedRemainingTime / 1000),
            chapters,
            isComplete: progress.completedChapters === progress.totalChapters
          }

          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          } catch (e) {
            // Controller already closed, stop interval
            cleanup()
            return true
          }

          const isComplete = progress.completedChapters === progress.totalChapters
          if (isComplete) {
            cleanup()
            logger.info('SSE progress stream completed', { bookId })
          }

          return isComplete
        }

        // 초기 데이터 즉시 전송
        sendProgress()

        // 1초마다 진행상황 전송
        interval = setInterval(() => {
          sendProgress()
        }, 1000)

        // 타임아웃 (10분)
        timeout = setTimeout(() => {
          cleanup()
          logger.warn('SSE progress stream timeout', { bookId })
        }, 10 * 60 * 1000)
      },
      cancel() {
        // 클라이언트가 연결을 끊었을 때 정리
        logger.info('SSE connection cancelled by client', { bookId })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  }

  // JSON 응답 (폴링용)
  try {
    logger.debug('Progress request', { bookId })

    const progress = getGenerationProgress(bookId)

    if (!progress) {
      return NextResponse.json(
        { error: '생성 중인 책을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 챕터별 상태 변환
    const chapters = Array.from(progress.chapters.entries()).map(([idx, chapter]) => ({
      index: idx,
      title: chapter.title,
      status: chapter.status,
      contentLength: chapter.content.length,
      preview: chapter.content.slice(0, 100) + (chapter.content.length > 100 ? '...' : '')
    }))

    const elapsedTime = Date.now() - progress.startedAt
    const completionRate = progress.completedChapters / progress.totalChapters
    const estimatedTotalTime = completionRate > 0
      ? elapsedTime / completionRate
      : 0
    const estimatedRemainingTime = Math.max(0, estimatedTotalTime - elapsedTime)

    return NextResponse.json({
      bookId: progress.bookId,
      totalChapters: progress.totalChapters,
      completedChapters: progress.completedChapters,
      progress: Math.round(completionRate * 100),
      elapsedTime: Math.round(elapsedTime / 1000), // 초 단위
      estimatedRemainingTime: Math.round(estimatedRemainingTime / 1000), // 초 단위
      chapters,
      isComplete: progress.completedChapters === progress.totalChapters
    })

  } catch (error) {
    logger.error('Progress fetch failed', error)
    return NextResponse.json(
      { error: '진행상황 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

