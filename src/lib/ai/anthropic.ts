import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'

let anthropicInstance: Anthropic | null = null

function getAnthropicClient() {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    anthropicInstance = new Anthropic({ apiKey })
  }
  return anthropicInstance
}

// AI 모델 설정
export const MODELS = {
  // 최고 품질 (첫 챕터, 복잡한 작업)
  PREMIUM: 'claude-sonnet-4-5-20250929',
  // 빠른 속도 (목차, 일반 챕터) - TTFT 0.36s
  FAST: 'claude-3-5-haiku-20241022',
} as const

const DEFAULT_MODEL = MODELS.PREMIUM

export async function generateWithClaude(prompt: string, model: string = DEFAULT_MODEL) {
  const startTime = Date.now()

  try {
    logger.aiRequest('Claude API call', {
      model,
      promptLength: prompt.length
    })

    const anthropic = getAnthropicClient()

    // 모델별 max_tokens 설정
    const maxTokens = model === MODELS.PREMIUM ? 16000 : 8000

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    })

    const duration = Date.now() - startTime
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

    logger.aiResponse('Claude API call', duration, tokensUsed)
    logger.debug('Claude response details', {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason
    })

    return response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Claude API call failed', error, {
      model,
      duration: `${duration}ms`
    })
    throw error
  }
}

/**
 * 스트리밍 지원 Claude 생성
 * - 실시간 토큰 전송으로 체감 속도 향상
 * - TTFT (Time To First Token) 최적화
 */
export async function generateWithClaudeStream(
  prompt: string,
  model: string = DEFAULT_MODEL,
  systemPrompt?: string,
  onChunk?: (text: string) => void
) {
  const startTime = Date.now()
  let ttft: number | null = null

  try {
    logger.aiRequest('Claude API call (streaming)', {
      model,
      promptLength: prompt.length,
      hasSystemPrompt: !!systemPrompt
    })

    // 모델별 max_tokens 설정
    const maxTokens = model === MODELS.PREMIUM ? 16000 : 8000

    // Anthropic SDK의 .stream() 메서드 사용 (공식 방법)
    const anthropic = getAnthropicClient()
    const stream = anthropic.messages
      .stream({
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        ...(systemPrompt && { system: systemPrompt }),
        messages: [{ role: 'user', content: prompt }],
      })
      .on('text', (text) => {
        // 첫 토큰 시간 측정
        if (ttft === null) {
          ttft = Date.now() - startTime
          logger.debug('First token received', { ttft: `${ttft}ms` })
        }

        // 콜백으로 실시간 전송
        if (onChunk) {
          onChunk(text)
        }
      })

    // 최종 메시지 대기
    const finalMessage = await stream.finalMessage()
    const duration = Date.now() - startTime
    const tokensUsed = finalMessage.usage.input_tokens + finalMessage.usage.output_tokens

    logger.aiResponse('Claude API call (streaming)', duration, tokensUsed)
    logger.debug('Claude streaming details', {
      ttft: ttft ? `${ttft}ms` : 'N/A',
      totalDuration: `${duration}ms`,
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
      stopReason: finalMessage.stop_reason
    })

    // 최종 텍스트 반환
    return finalMessage.content[0].type === 'text' ? finalMessage.content[0].text : ''
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Claude streaming API call failed', error, {
      model,
      duration: `${duration}ms`,
      ttft: ttft ? `${ttft}ms` : 'N/A'
    })
    throw error
  }
}

/**
 * 독자를 사로잡는 eBook 아웃라인 생성
 * - 명확한 핵심 메시지
 * - 호기심을 자극하는 인사이트
 * - 구체적이고 실용적인 내용
 * - 감정적 연결과 공감
 */
export async function generateOutlineWithStickiness(
  topic: string,
  description: string
) {
  logger.info('Starting outline generation (Haiku 3.5)', { topic })

  const systemPrompt = `You are an expert ebook author and educator who specializes in creating compelling, memorable content that hooks readers immediately.

Your goal is to create an outline that will create an "Aha moment" for readers - that instant of understanding and excitement that makes them realize the value of this content.`

  const prompt = `Create a compelling ebook outline for the following topic:

<topic>${topic}</topic>
<description>${description}</description>

Create an outline that is:

1. **Clear and focused**: Find the core message and strip away complexity
2. **Surprising**: Include unexpected insights that break conventional thinking
3. **Concrete**: Use specific, tangible examples
4. **Trustworthy**: Build credibility with evidence
5. **Emotionally engaging**: Connect with readers' aspirations and pain points
6. **Story-driven**: Frame concepts as compelling narratives

<book_specifications>
- Total chapters: **10 chapters** (표준)
- Total length: **100 pages** (A4 기준)
- Per chapter: approximately **6,000 characters** (약 10페이지)
- Total book: approximately **60,000 characters**
</book_specifications>

Create an outline with exactly 10 chapters that will hook readers in the first chapter - making them immediately see the value and want to continue.

The book title should be catchy and promise a clear transformation or benefit.

Return the outline in the following JSON format:
{
  "title": "A compelling, benefit-driven title that hooks readers",
  "subtitle": "A subtitle that adds context and intrigue",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title (First chapter should deliver an Aha moment)",
      "keyPoints": ["Specific, concrete point 1", "Surprising insight 2", "Emotional connection 3"],
      "estimatedWords": 6000,
      "ahaMoment": "The key insight readers will have (only for chapter 1)"
    }
  ]
}

IMPORTANT: Create exactly 10 chapters, each with estimatedWords: 6000 to reach the target 100-page book (60,000 characters total).

Make the first chapter title especially compelling - it should promise and deliver a paradigm-shifting insight that makes readers immediately want to continue.`

  // Haiku 3.5 사용 (빠른 속도)
  const response = await generateWithClaude(prompt, MODELS.FAST)

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const outline = JSON.parse(jsonMatch[0])
    logger.info('Outline generation completed', {
      model: 'Haiku 3.5',
      chaptersCount: outline.chapters?.length,
      hasSubtitle: !!outline.subtitle
    })
    return outline
  }

  logger.error('Failed to parse outline JSON', new Error('No JSON found in response'))
  throw new Error('Failed to parse outline JSON')
}

/**
 * 첫 챕터 생성 - 아하모먼트 전달에 최적화
 */
export async function generateFirstChapterWithAha(
  bookTitle: string,
  chapterTitle: string,
  keyPoints: string[],
  ahaMoment: string,
  targetWords: number = 6000
) {
  logger.info('Starting first chapter generation (Sonnet 4.5)', {
    bookTitle,
    targetWords,
    hasAhaMoment: !!ahaMoment
  })

  const systemPrompt = `You are a master storyteller and educator. Your specialty is creating "Aha moments" - those powerful instances when readers suddenly understand something in a new way.

Your writing style is:
- Clear and conversational
- Rich with concrete examples
- Emotionally engaging
- Story-driven
- Transformational

You write in Korean with natural, engaging language.`

  const prompt = `Write the first chapter of an ebook that will create an immediate "Aha moment" for readers.

<book_title>${bookTitle}</book_title>
<chapter_title>${chapterTitle}</chapter_title>
<target_words>${targetWords}</target_words>

<aha_moment>
The key insight readers must experience: ${ahaMoment}
</aha_moment>

<key_points>
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}
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
이 챕터는 **A4 용지 10페이지 분량 (약 6,000자)**을 목표로 합니다.

- **강렬한 도입** (600-800자): 독자의 기존 생각을 뒤흔드는 시작
- **문제 제기** (800-1,000자): 독자가 공감할 수 있는 현실적 문제
- **핵심 인사이트** (1,500-2,000자): 깨달음을 전달하는 메인 섹션
- **구체적 예시/스토리** (1,200-1,500자): 개념을 생생하게 만드는 실제 사례
- **실천 가능한 통찰** (800-1,000자): 독자가 바로 적용할 수 있는 것
- **다음 단계 예고** (600-800자): 2장에 대한 기대감 형성

IMPORTANT: 각 섹션의 분량을 충실히 지켜 총 6,000자 이상을 작성하세요. 짧은 내용보다는 구체적이고 상세한 설명을 제공하세요.
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

  // Sonnet 4.5 사용 (최고 품질)
  const content = await generateWithClaude(prompt, MODELS.PREMIUM)
  logger.info('First chapter generation completed', {
    model: 'Sonnet 4.5',
    contentLength: content.length
  })

  return content
}

/**
 * 일반 챕터 생성
 */
export async function generateChapterContent(
  bookTitle: string,
  chapterTitle: string,
  chapterNumber: number,
  keyPoints: string[],
  targetWords: number = 6000
) {
  logger.info('Starting chapter generation (Haiku 3.5)', {
    bookTitle,
    chapterNumber,
    targetWords
  })

  const systemPrompt = `You are an expert ebook author who writes engaging, practical content in Korean.

Your writing is:
- Clear and well-structured
- Rich with examples
- Actionable and practical
- Engaging and readable`

  const prompt = `Write Chapter ${chapterNumber} for the ebook "${bookTitle}".

<chapter_title>${chapterTitle}</chapter_title>
<target_words>${targetWords}</target_words>

<key_points>
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}
</key_points>

<requirements>
- Write approximately ${targetWords} characters (about 10 A4 pages) in Korean
- Use clear, engaging language
- Include practical examples and real-world scenarios
- Structure with proper sections and subsections
- Maintain an educational yet conversational tone
- Add introduction and conclusion
- Use markdown formatting effectively

<structure_guide>
For a full chapter (6,000 characters ≈ 10 A4 pages), follow this structure:

1. **서론/도입** (600-800자)
   - 챕터의 핵심 질문이나 문제 제기
   - 독자의 호기심 자극

2. **핵심 개념 설명** (1,500-2,000자)
   - ${keyPoints[0] || '첫 번째 키포인트'} 상세 설명
   - 구체적인 예시와 데이터
   - 실용적인 접근법

3. **심화 내용** (1,500-2,000자)
   - ${keyPoints[1] || '두 번째 키포인트'} 및 ${keyPoints[2] || '세 번째 키포인트'} 설명
   - 실제 사례 연구
   - 단계별 가이드

4. **실전 적용** (1,000-1,200자)
   - 실습 예제
   - 체크리스트
   - 흔한 실수와 해결법

5. **요약 및 정리** (600-800자)
   - 핵심 내용 복습
   - 다음 챕터 예고
   - 액션 아이템

IMPORTANT: Each section should be detailed and comprehensive. Aim for 6,000+ characters total. Don't write superficially - provide deep, valuable content.
</structure_guide>
</requirements>

Write the complete chapter content in markdown format.`

  // Haiku 3.5 사용 (빠른 속도)
  const content = await generateWithClaude(prompt, MODELS.FAST)
  logger.info('Chapter generation completed', {
    model: 'Haiku 3.5',
    chapterNumber,
    contentLength: content.length
  })

  return content
}