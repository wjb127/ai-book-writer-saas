import { NextRequest, NextResponse } from 'next/server'
import { generateOutlineWithStickiness } from '@/lib/ai/anthropic'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.apiRequest('POST', '/api/generate-outline')

    const { topic, description, settings } = await request.json()

    logger.debug('Request payload', {
      topicLength: topic?.length,
      descriptionLength: description?.length,
      isDemo: settings?.isDemo
    })

    if (!topic || !description) {
      logger.warn('Missing required fields', { topic: !!topic, description: !!description })
      return NextResponse.json(
        { error: '주제와 설명을 입력해주세요' },
        { status: 400 }
      )
    }

    // AI API 키 확인
    const hasAnthropic = process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here'

    if (!hasAnthropic) {
      logger.info('Using sample data (no API key)')

      // API 키가 없는 경우 샘플 데이터 반환
      const sampleOutline = {
        title: `${topic}: 완벽 가이드`,
        subtitle: '당신의 성공을 위한 실전 로드맵',
        chapters: Array.from({ length: 6 }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}: ${['왜 지금 시작해야 하는가', '핵심 원리 이해하기', '실전 단계별 가이드', '고급 전략과 기법', '실제 성공 사례', '다음 단계로'][i]}`,
          keyPoints: [
            `핵심 포인트 1`,
            `핵심 포인트 2`,
            `핵심 포인트 3`
          ],
          estimatedWords: 2500,
          ahaMoment: i === 0 ? '이 개념을 이해하는 순간, 모든 것이 달라집니다' : undefined
        }))
      }

      const duration = Date.now() - startTime
      logger.apiResponse('POST', '/api/generate-outline', 200, duration)

      return NextResponse.json(sampleOutline)
    }

    logger.info('Generating outline with AI', { topic })

    // 고급 AI로 독자를 사로잡는 아웃라인 생성
    const outline = await generateOutlineWithStickiness(topic, description)

    const duration = Date.now() - startTime
    logger.apiResponse('POST', '/api/generate-outline', 200, duration)
    logger.info('Outline generated successfully', {
      chaptersCount: outline.chapters?.length,
      hasSubtitle: !!outline.subtitle
    })

    return NextResponse.json(outline)
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Outline generation failed', error, { duration: `${duration}ms` })
    logger.apiResponse('POST', '/api/generate-outline', 500, duration)

    return NextResponse.json(
      { error: '목차 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}