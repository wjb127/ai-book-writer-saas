import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 최신 고급 AI 모델
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929'

export async function generateWithClaude(prompt: string, model: string = DEFAULT_MODEL) {
  const startTime = Date.now()

  try {
    logger.aiRequest('Claude API call', {
      model,
      promptLength: prompt.length
    })

    const response = await anthropic.messages.create({
      model,
      max_tokens: 8000,
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
  logger.info('Starting outline generation', { topic })

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

Create an outline with 6-8 chapters that will hook readers in the first chapter - making them immediately see the value and want to continue.

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
      "estimatedWords": 2500,
      "ahaMoment": "The key insight readers will have (only for chapter 1)"
    }
  ]
}

Make the first chapter title especially compelling - it should promise and deliver a paradigm-shifting insight that makes readers immediately want to continue.`

  const response = await generateWithClaude(prompt, DEFAULT_MODEL)

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const outline = JSON.parse(jsonMatch[0])
    logger.info('Outline generation completed', {
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
  targetWords: number = 2500
) {
  logger.info('Starting first chapter generation', {
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

  const content = await generateWithClaude(prompt, DEFAULT_MODEL)
  logger.info('First chapter generation completed', {
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
  targetWords: number = 2500
) {
  logger.info('Starting chapter generation', {
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
- Write approximately ${targetWords} words in Korean
- Use clear, engaging language
- Include practical examples
- Structure with proper sections and subsections
- Maintain an educational yet conversational tone
- Add introduction and conclusion
- Use markdown formatting effectively
</requirements>

Write the complete chapter content in markdown format.`

  const content = await generateWithClaude(prompt, DEFAULT_MODEL)
  logger.info('Chapter generation completed', {
    chapterNumber,
    contentLength: content.length
  })

  return content
}