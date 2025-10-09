import OpenAI from 'openai'
import { logger } from '@/lib/logger'

let openaiInstance: OpenAI | null = null

function getOpenAIClient() {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

// GPT 모델 상수
export const GPT_MODELS = {
  NANO: 'gpt-4.1-nano',
  O_MINI: 'gpt-4o-mini',
  MINI: 'gpt-4.1-mini',
  STANDARD: 'gpt-4.1',
} as const

export async function generateWithOpenAI(prompt: string, model: string = GPT_MODELS.NANO, systemPrompt?: string) {
  const startTime = Date.now()

  try {
    logger.aiRequest('OpenAI API call', {
      model,
      promptLength: prompt.length,
      hasSystemPrompt: !!systemPrompt
    })

    const messages: any[] = []
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 8000,
    })

    const duration = Date.now() - startTime
    const tokensUsed = (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0)

    logger.aiResponse('OpenAI API call', duration, tokensUsed)
    logger.debug('OpenAI response details', {
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      finishReason: response.choices[0]?.finish_reason
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('OpenAI API call failed', error, {
      model,
      duration: `${duration}ms`
    })
    throw error
  }
}

/**
 * GPT로 독자를 사로잡는 eBook 아웃라인 생성
 */
export async function generateOutlineWithGPT(
  topic: string,
  description: string,
  model: string = GPT_MODELS.NANO
) {
  logger.info('Starting outline generation with GPT', { topic, model })

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

  const response = await generateWithOpenAI(prompt, model, systemPrompt)

  // JSON 추출
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    const outline = JSON.parse(jsonMatch[0])
    logger.info('Outline generation completed', {
      model,
      chaptersCount: outline.chapters?.length,
      hasSubtitle: !!outline.subtitle
    })
    return outline
  }

  logger.error('Failed to parse outline JSON', new Error('No JSON found in response'))
  throw new Error('Failed to parse outline JSON')
}