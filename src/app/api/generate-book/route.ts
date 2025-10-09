import { NextRequest, NextResponse } from 'next/server'
import { generateWithClaudeStream, MODELS } from '@/lib/ai/anthropic'
import { logger } from '@/lib/logger'

// 임시 저장소 (실제로는 Redis나 DB 사용)
const generationProgress = new Map<string, {
  bookId: string
  totalChapters: number
  completedChapters: number
  chapters: Map<number, { title: string, content: string, status: 'pending' | 'generating' | 'completed' | 'error' }>
  startedAt: number
}>()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.apiRequest('POST', '/api/generate-book')

    const { bookId, bookTitle, chapters, settings } = await request.json()

    logger.debug('Request payload', {
      bookId,
      chapterCount: chapters?.length,
      aiModel: settings?.aiModel
    })

    if (!bookId || !bookTitle || !chapters || chapters.length === 0) {
      logger.warn('Missing required fields')
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 진행상황 초기화
    generationProgress.set(bookId, {
      bookId,
      totalChapters: chapters.length,
      completedChapters: 0,
      chapters: new Map(
        chapters.map((ch: any, idx: number) => [
          idx,
          { title: ch.title, content: '', status: 'pending' as const }
        ])
      ),
      startedAt: Date.now()
    })

    // 배치 크기 (5개씩)
    const BATCH_SIZE = 5
    const batches: any[][] = []
    for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
      batches.push(chapters.slice(i, i + BATCH_SIZE))
    }

    logger.info('Starting parallel generation', {
      bookId,
      totalChapters: chapters.length,
      batches: batches.length,
      batchSize: BATCH_SIZE
    })

    // 배치별로 순차 실행, 배치 내에서는 병렬 실행
    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx]

      logger.info(`Processing batch ${batchIdx + 1}/${batches.length}`, {
        chaptersInBatch: batch.length
      })

      // 배치 내 병렬 생성
      await Promise.all(
        batch.map(async (chapter: any, localIdx: number) => {
          const globalIdx = batchIdx * BATCH_SIZE + localIdx

          try {
            const bookProgress = generationProgress.get(bookId)
            if (bookProgress) {
              const chapterProgress = bookProgress.chapters.get(globalIdx)
              if (chapterProgress) {
                chapterProgress.status = 'generating'
              }
            }

            logger.info(`Generating chapter ${globalIdx + 1}`, {
              bookId,
              chapterNumber: chapter.number,
              title: chapter.title
            })

            // 모든 챕터에 Sonnet 4.5 사용 (6000자 목표 달성을 위해)
            const model = MODELS.PREMIUM

            const systemPrompt = chapter.number === 1 && chapter.ahaMoment
              ? `You are a master storyteller and educator. Your specialty is creating "Aha moments" - those powerful instances when readers suddenly understand something in a new way.

Your writing style is:
- Clear and conversational
- Rich with concrete examples
- Emotionally engaging
- Story-driven
- Transformational

You write in Korean with natural, engaging language.`
              : `You are an expert ebook author who writes engaging, practical content in Korean.

Your writing is:
- Clear and well-structured
- Rich with examples
- Actionable and practical
- Engaging and readable`

            const prompt = chapter.number === 1 && chapter.ahaMoment
              ? `Write the first chapter of an ebook that will create an immediate "Aha moment" for readers.

<book_title>${bookTitle}</book_title>
<chapter_title>${chapter.title}</chapter_title>
<target_words>${chapter.estimatedWords || 6000}</target_words>

<aha_moment>
The key insight readers must experience: ${chapter.ahaMoment}
</aha_moment>

<key_points>
${chapter.keyPoints.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}
</key_points>

<writing_instructions>
1. **Hook immediately**: Start with a surprising fact, question, or scenario that challenges assumptions
2. **Build towards the Aha moment**: Structure the chapter to naturally lead readers to the key insight
3. **Use concrete examples**: Include real scenarios, specific numbers, vivid descriptions
4. **Create emotional connection**: Address reader pain points and aspirations
5. **Include a story**: Weave in a narrative that illustrates the concept
6. **End with transformation**: Show readers how their understanding has changed
</writing_instructions>

<structure>
이 챕터는 **A4 용지 10페이지 분량 (약 6,000자)**을 목표로 합니다.

- **강렬한 도입** (600-800자): 독자의 기존 생각을 뒤흔드는 시작
- **문제 제기** (800-1,000자): 독자가 공감할 수 있는 현실적 문제
- **핵심 인사이트** (1,500-2,000자): 깨달음을 전달하는 메인 섹션
- **구체적 예시/스토리** (1,200-1,500자): 개념을 생생하게 만드는 실제 사례
- **실천 가능한 통찰** (800-1,000자): 독자가 바로 적용할 수 있는 것
- **다음 단계 예고** (600-800자): 2장에 대한 기대감 형성

IMPORTANT: 각 섹션의 분량을 충실히 지켜 총 6,000자 이상을 작성하세요.
</structure>

Write the complete chapter in markdown format.`
              : `Write Chapter ${chapter.number} for the ebook "${bookTitle}".

<chapter_title>${chapter.title}</chapter_title>
<target_words>${chapter.estimatedWords || 6000}</target_words>

<key_points>
${chapter.keyPoints.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}
</key_points>

<requirements>
- Write approximately ${chapter.estimatedWords || 6000} characters (about 10 A4 pages) in Korean
- Use clear, engaging language
- Include practical examples and real-world scenarios
- Structure with proper sections and subsections
- Maintain an educational yet conversational tone
- Add introduction and conclusion
- Use markdown formatting effectively

<structure_guide>
For a full chapter (6,000 characters ≈ 10 A4 pages):

1. **서론/도입** (600-800자)
2. **핵심 개념 설명** (1,500-2,000자)
3. **심화 내용** (1,500-2,000자)
4. **실전 적용** (1,000-1,200자)
5. **요약 및 정리** (600-800자)

IMPORTANT: Aim for 6,000+ characters total. Provide deep, valuable content.
</structure_guide>
</requirements>

Write the complete chapter content in markdown format.`

            // 스트리밍으로 생성 (내부에서 모두 수집)
            let fullContent = ''
            await generateWithClaudeStream(
              prompt,
              model,
              systemPrompt,
              (chunk) => {
                fullContent += chunk

                // 진행상황 업데이트 (부분 컨텐츠)
                const streamProgress = generationProgress.get(bookId)
                if (streamProgress) {
                  const chapterProgress = streamProgress.chapters.get(globalIdx)
                  if (chapterProgress) {
                    chapterProgress.content = fullContent
                  }
                }
              }
            )

            // 완료 처리
            const completeProgress = generationProgress.get(bookId)
            if (completeProgress) {
              const chapterProgress = completeProgress.chapters.get(globalIdx)
              if (chapterProgress) {
                chapterProgress.content = fullContent
                chapterProgress.status = 'completed'
              }
              completeProgress.completedChapters++
            }

            logger.info(`Chapter ${globalIdx + 1} completed`, {
              bookId,
              contentLength: fullContent.length,
              model: 'Sonnet 4.5'
            })

          } catch (error) {
            logger.error(`Chapter ${globalIdx + 1} generation failed`, error)

            const errorProgress = generationProgress.get(bookId)
            if (errorProgress) {
              const chapterProgress = errorProgress.chapters.get(globalIdx)
              if (chapterProgress) {
                chapterProgress.status = 'error'
              }
            }
          }
        })
      )

      logger.info(`Batch ${batchIdx + 1} completed`)
    }

    const duration = Date.now() - startTime
    logger.apiResponse('POST', '/api/generate-book', 200, duration)
    logger.info('Book generation completed', {
      bookId,
      totalTime: `${(duration / 1000).toFixed(1)}s`,
      chaptersCompleted: generationProgress.get(bookId)?.completedChapters
    })

    // 최종 결과 반환
    const finalProgress = generationProgress.get(bookId)
    const result = {
      bookId,
      chapters: Array.from(finalProgress?.chapters.entries() || [])
        .map(([idx, chapter]) => ({
          index: idx,
          title: chapter.title,
          content: chapter.content,
          status: chapter.status
        })),
      totalTime: duration,
      completedChapters: finalProgress?.completedChapters || 0,
      totalChapters: finalProgress?.totalChapters || 0
    }

    // 정리 (5분 후)
    setTimeout(() => {
      generationProgress.delete(bookId)
    }, 5 * 60 * 1000)

    return NextResponse.json(result)

  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Book generation failed', error, { duration: `${duration}ms` })
    logger.apiResponse('POST', '/api/generate-book', 500, duration)

    return NextResponse.json(
      { error: '책 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 진행상황 조회를 위한 export
export function getGenerationProgress(bookId: string) {
  return generationProgress.get(bookId)
}
