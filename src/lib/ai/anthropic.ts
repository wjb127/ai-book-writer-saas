import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateWithClaude(prompt: string, model: string = 'claude-3-opus-20240229') {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })
    
    return response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (error) {
    console.error('Anthropic API error:', error)
    throw error
  }
}

export async function generateChapterContent(
  bookTitle: string,
  chapterTitle: string,
  chapterNumber: number,
  keyPoints: string[],
  targetWords: number = 2500
) {
  const prompt = `Write Chapter ${chapterNumber} for the ebook "${bookTitle}".

Chapter Title: ${chapterTitle}

Key Points to Cover:
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

Requirements:
- Write approximately ${targetWords} words
- Use clear, engaging language
- Include practical examples where relevant
- Structure with proper sections and subsections
- Maintain consistency with an educational/informative tone
- Add a brief introduction and conclusion for the chapter

Please write the full chapter content in markdown format.`

  return generateWithClaude(prompt, 'claude-3-sonnet-20240229')
}