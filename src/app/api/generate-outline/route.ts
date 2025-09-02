import { NextRequest, NextResponse } from 'next/server'
import { generateOutline } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    const { topic, description, settings } = await request.json()

    if (!topic || !description) {
      return NextResponse.json(
        { error: '주제와 설명을 입력해주세요' },
        { status: 400 }
      )
    }

    // API 키가 설정되지 않은 경우 샘플 데이터 반환
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      const sampleOutline = {
        title: `${topic}: 완벽 가이드`,
        chapters: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}: ${['입문', '기초', '핵심 개념', '실전 활용', '고급 기법', '문제 해결', '최적화', '사례 연구', '미래 전망', '마무리'][i]}`,
          keyPoints: [
            `${['입문', '기초', '핵심 개념', '실전 활용', '고급 기법', '문제 해결', '최적화', '사례 연구', '미래 전망', '마무리'][i]}의 핵심 포인트 1`,
            `${['입문', '기초', '핵심 개념', '실전 활용', '고급 기법', '문제 해결', '최적화', '사례 연구', '미래 전망', '마무리'][i]}의 핵심 포인트 2`,
            `${['입문', '기초', '핵심 개념', '실전 활용', '고급 기법', '문제 해결', '최적화', '사례 연구', '미래 전망', '마무리'][i]}의 핵심 포인트 3`
          ],
          estimatedWords: 2000 + Math.floor(Math.random() * 1500)
        }))
      }
      
      return NextResponse.json(sampleOutline)
    }

    const outline = await generateOutline(topic, description)
    
    return NextResponse.json(outline)
  } catch (error) {
    console.error('Outline generation error:', error)
    return NextResponse.json(
      { error: '목차 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}