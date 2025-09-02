import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateWithOpenAI(prompt: string, model: string = 'gpt-4-turbo-preview') {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    })
    
    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

export async function generateOutline(topic: string, description: string) {
  const prompt = `Create a detailed outline for an ebook about:
Topic: ${topic}
Description: ${description}

Generate a structured outline with:
- A compelling title
- 8-12 chapters with descriptive titles
- 3-5 key points for each chapter
- Estimated word count for each chapter (aim for 2000-3000 words per chapter)

Format the response as JSON with the following structure:
{
  "title": "Book Title",
  "chapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "keyPoints": ["point1", "point2", "point3"],
      "estimatedWords": 2500
    }
  ]
}`

  const content = await generateWithOpenAI(prompt, 'gpt-4-turbo-preview')
  try {
    return JSON.parse(content)
  } catch {
    return { title: topic, chapters: [] }
  }
}