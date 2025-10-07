import { NextRequest, NextResponse } from 'next/server'
import { generateFirstChapterWithAha, generateChapterContent } from '@/lib/ai/anthropic'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.apiRequest('POST', '/api/generate-chapter')

    const { bookTitle, chapter, settings } = await request.json()

    logger.debug('Request payload', {
      chapterNumber: chapter?.number,
      hasAhaMoment: !!chapter?.ahaMoment,
      estimatedWords: chapter?.estimatedWords
    })

    if (!bookTitle || !chapter) {
      logger.warn('Missing required fields', { bookTitle: !!bookTitle, chapter: !!chapter })
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // AI API 키 확인
    const hasAnthropic = process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here'

    // API 키가 없는 경우 샘플 콘텐츠 반환
    if (!hasAnthropic) {
      logger.info('Using sample content (no API key)', { chapterNumber: chapter.number })

      const sampleContent = `# ${chapter.title}

## 서론

${chapter.title}에 오신 것을 환영합니다. 이 장에서는 ${chapter.keyPoints.join(', ')} 등의 중요한 주제를 다룹니다.

## ${chapter.keyPoints[0]}

### 개요
${chapter.keyPoints[0]}는 이 장의 핵심 개념 중 하나입니다. 이를 이해하는 것은 전체 내용을 파악하는 데 매우 중요합니다.

### 상세 설명
여기서는 더 깊이 있는 내용을 다룹니다. 실제 적용 사례와 함께 개념을 설명하겠습니다.

**핵심 포인트:**
- 첫 번째 중요 사항
- 두 번째 중요 사항
- 세 번째 중요 사항

### 실습 예제
\`\`\`
예제 코드 또는 실습 내용
단계별 설명
결과 확인
\`\`\`

## ${chapter.keyPoints[1]}

### 기본 개념
${chapter.keyPoints[1]}에 대한 기본적인 이해를 돕기 위한 섹션입니다.

### 응용 방법
실제로 어떻게 활용할 수 있는지 알아보겠습니다:

1. **방법 1**: 구체적인 설명
2. **방법 2**: 추가 설명
3. **방법 3**: 마무리 설명

> 💡 **팁**: 이 부분을 실습할 때는 충분한 시간을 가지고 천천히 진행하세요.

## ${chapter.keyPoints[2]}

### 심화 내용
${chapter.keyPoints[2]}는 이 장의 마지막 핵심 주제입니다.

### 실전 적용
실제 프로젝트나 상황에서 어떻게 적용할 수 있는지 살펴보겠습니다.

**체크리스트:**
- [ ] 개념 이해 완료
- [ ] 실습 진행
- [ ] 응용 과제 수행
- [ ] 복습 및 정리

## 요약

이 장에서 우리는 다음과 같은 내용을 학습했습니다:

1. ${chapter.keyPoints[0]}의 기본 개념과 응용
2. ${chapter.keyPoints[1]}의 실제 적용 방법
3. ${chapter.keyPoints[2]}를 통한 심화 학습

이제 다음 장으로 넘어갈 준비가 되었습니다. 학습한 내용을 충분히 복습하고 이해했는지 확인하세요.

---

*이 콘텐츠는 AI에 의해 생성되었습니다. 실제 서비스에서는 선택한 AI 모델(GPT-4, Claude 등)을 사용하여 더욱 풍부하고 전문적인 콘텐츠가 생성됩니다.*`

      const duration = Date.now() - startTime
      logger.apiResponse('POST', '/api/generate-chapter', 200, duration)

      return NextResponse.json({ content: sampleContent })
    }

    let content: string

    // 고급 AI 사용 (첫 챕터는 특별 최적화)
    if (chapter.number === 1 && chapter.ahaMoment) {
      logger.info('Generating first chapter with AI', {
        chapterNumber: chapter.number,
        bookTitle,
        hasAhaMoment: true
      })

      // 첫 챕터: 독자를 사로잡는 특별 생성
      content = await generateFirstChapterWithAha(
        bookTitle,
        chapter.title,
        chapter.keyPoints,
        chapter.ahaMoment,
        chapter.estimatedWords
      )
    } else {
      logger.info('Generating chapter with AI', {
        chapterNumber: chapter.number,
        bookTitle
      })

      // 일반 챕터
      content = await generateChapterContent(
        bookTitle,
        chapter.title,
        chapter.number,
        chapter.keyPoints,
        chapter.estimatedWords
      )
    }

    const duration = Date.now() - startTime
    logger.apiResponse('POST', '/api/generate-chapter', 200, duration)
    logger.info('Chapter generated successfully', {
      chapterNumber: chapter.number,
      contentLength: content.length
    })

    return NextResponse.json({ content })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Chapter generation failed', error, { duration: `${duration}ms` })
    logger.apiResponse('POST', '/api/generate-chapter', 500, duration)

    return NextResponse.json(
      { error: '챕터 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}