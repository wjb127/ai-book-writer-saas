import { NextRequest } from 'next/server'
import { generateWithClaudeStream, MODELS } from '@/lib/ai/anthropic'
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

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ error: '필수 정보가 누락되었습니다' })))
          controller.close()
        }
      })

      return new Response(stream, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // AI API 키 확인
    const hasAnthropic = process.env.ANTHROPIC_API_KEY &&
      process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here'

    // API 키가 없는 경우 샘플 콘텐츠 반환 (스트리밍 형태로)
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

      // 스트리밍 형태로 샘플 콘텐츠 전송
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // 청크로 나눠서 전송 (타이핑 효과)
          const chunkSize = 50
          for (let i = 0; i < sampleContent.length; i += chunkSize) {
            const chunk = sampleContent.slice(i, i + chunkSize)
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        }
      })

      const duration = Date.now() - startTime
      logger.apiResponse('POST', '/api/generate-chapter', 200, duration)

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        }
      })
    }

    // 프롬프트 생성
    let prompt: string
    let model: string
    let systemPrompt: string | undefined

    // 첫 챕터: 특별 프롬프트 + Sonnet 4.5
    if (chapter.number === 1 && chapter.ahaMoment) {
      logger.info('Generating first chapter with AI (streaming)', {
        chapterNumber: chapter.number,
        bookTitle,
        hasAhaMoment: true
      })

      model = MODELS.PREMIUM

      systemPrompt = `You are a master storyteller and educator. Your specialty is creating "Aha moments" - those powerful instances when readers suddenly understand something in a new way.

Your writing style is:
- Clear and conversational
- Rich with concrete examples
- Emotionally engaging
- Story-driven
- Transformational

You write in Korean with natural, engaging language.`

      prompt = `Write the first chapter of an ebook that will create an immediate "Aha moment" for readers.

<book_title>${bookTitle}</book_title>
<chapter_title>${chapter.title}</chapter_title>
<target_words>${chapter.estimatedWords}</target_words>

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

7. **Use proven principles**: Make every section clear, unexpected, concrete, credible, emotional, and story-driven
</writing_instructions>

<structure>
- **강렬한 도입** (200-300 words): 독자의 기존 생각을 뒤흔드는 시작
- **문제 제기** (300-400 words): 독자가 공감할 수 있는 현실적 문제
- **핵심 인사이트** (500-700 words): 깨달음을 전달하는 메인 섹션
- **구체적 예시/스토리** (400-500 words): 개념을 생생하게 만드는 실제 사례
- **실천 가능한 통찰** (300-400 words): 독자가 바로 적용할 수 있는 것
- **다음 단계 예고** (200-300 words): 2장에 대한 기대감 형성
</structure>

Write the complete chapter in markdown format. Make it so compelling that readers can't wait to continue to the next chapter.

Use these formatting guidelines:
- Start with # for chapter title
- Use ## for major sections
- Use ### for subsections
- Include **bold** for key concepts
- Use > blockquotes for important insights
- Include bullet points and numbered lists
- Add 💡 emoji for key insights
- Add ⚡ emoji for actionable tips

Write in natural, conversational Korean that feels like a friend sharing an exciting discovery.`
    } else {
      // 일반 챕터: 표준 프롬프트 + Haiku 3.5
      logger.info('Generating chapter with AI (streaming)', {
        chapterNumber: chapter.number,
        bookTitle
      })

      model = MODELS.FAST

      systemPrompt = `You are an expert ebook author who writes engaging, practical content in Korean.

Your writing is:
- Clear and well-structured
- Rich with examples
- Actionable and practical
- Engaging and readable`

      prompt = `Write Chapter ${chapter.number} for the ebook "${bookTitle}".

<chapter_title>${chapter.title}</chapter_title>
<target_words>${chapter.estimatedWords}</target_words>

<key_points>
${chapter.keyPoints.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}
</key_points>

<requirements>
- Write approximately ${chapter.estimatedWords} words in Korean
- Use clear, engaging language
- Include practical examples
- Structure with proper sections and subsections
- Maintain an educational yet conversational tone
- Add introduction and conclusion
- Use markdown formatting effectively
</requirements>

Write the complete chapter content in markdown format.`
    }

    // 스트리밍 응답 생성
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await generateWithClaudeStream(
            prompt,
            model,
            systemPrompt,
            (chunk) => {
              // 각 청크를 즉시 전송
              controller.enqueue(encoder.encode(chunk))
            }
          )

          controller.close()

          const duration = Date.now() - startTime
          logger.apiResponse('POST', '/api/generate-chapter', 200, duration)
          logger.info('Chapter generated successfully (streaming)', {
            chapterNumber: chapter.number,
            model: model === MODELS.PREMIUM ? 'Sonnet 4.5' : 'Haiku 3.5'
          })
        } catch (error) {
          logger.error('Streaming generation failed', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Chapter generation failed', error, { duration: `${duration}ms` })
    logger.apiResponse('POST', '/api/generate-chapter', 500, duration)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: '챕터 생성 중 오류가 발생했습니다' })))
        controller.close()
      }
    })

    return new Response(stream, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
