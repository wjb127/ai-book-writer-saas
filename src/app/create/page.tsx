'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ArrowLeft,
  Loader2,
  Wand2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface BookSettings {
  aiModel: 'gpt-4.1-nano' | 'gpt-4o-mini' | 'gpt-4.1-mini' | 'gpt-4.1' | 'claude-sonnet' | 'claude-opus'
  language: 'ko' | 'en' | 'ja' | 'zh'
  tone: 'professional' | 'casual' | 'academic' | 'creative'
  targetAudience: string
}

export default function CreatePage() {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [settings, setSettings] = useState<BookSettings>({
    aiModel: 'gpt-4.1-nano',
    language: 'ko',
    tone: 'professional',
    targetAudience: '일반 독자'
  })

  // 빠른 시작 예시
  const quickStartExamples = [
    {
      topic: "AI 시대 생존 전략",
      description: "ChatGPT와 AI 도구들이 쏟아지는 시대, 직장인과 프리랜서들이 AI를 활용해 업무 생산성을 10배 높이고 경쟁력을 갖추는 실전 가이드입니다. AI를 두려워하지 않고 나의 무기로 만드는 구체적인 방법을 알려줍니다."
    },
    {
      topic: "월급 외 수입 만들기",
      description: "직장인들이 퇴근 후 2-3시간으로 월 100만원 이상의 부수입을 만드는 실전 전략입니다. 온라인 강의, 디지털 콘텐츠 판매, 컨설팅 등 실제 성공 사례와 단계별 실행 방법을 담았습니다."
    },
    {
      topic: "하루 1시간 영어 공부법",
      description: "바쁜 직장인도 하루 1시간으로 6개월 만에 영어 회화 실력을 획기적으로 향상시키는 방법입니다. 문법 암기가 아닌 실전 회화 중심으로, 검증된 학습법과 구체적인 루틴을 제시합니다."
    }
  ]

  const loadExample = (example: typeof quickStartExamples[0]) => {
    setTopic(example.topic)
    setDescription(example.description)
  }

  const handleGenerateOutline = async () => {
    if (!topic || !description) {
      toast.error('주제와 설명을 모두 입력해주세요')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          description,
          settings
        })
      })

      if (!response.ok) throw new Error('목차 생성 실패')

      const data = await response.json()

      // localStorage에 저장
      const bookData = {
        outline: data,
        settings,
        topic,
        description,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('currentBook', JSON.stringify(bookData))

      toast.success('목차가 성공적으로 생성되었습니다')

      // /create/edit로 이동
      window.location.href = '/create/edit'
    } catch (error) {
      toast.error('목차 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span className="font-bold text-xl text-white">AI Book Writer</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-amber-400 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">새 전자책 만들기</CardTitle>
              <CardDescription className="text-slate-300">
                AI가 전문적인 전자책을 생성합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 빠른 시작 예시 */}
              <div className="space-y-2">
                <Label className="text-white">빠른 시작 예시</Label>
                <div className="grid gap-2">
                  {quickStartExamples.map((example, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 bg-slate-900 border-slate-600 hover:bg-slate-700 text-white"
                      onClick={() => loadExample(example)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{example.topic}</div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {example.description.substring(0, 60)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* 설정 섹션 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">AI 모델</Label>
                  <Select
                    value={settings.aiModel}
                    onValueChange={(value: any) => setSettings({...settings, aiModel: value})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-600">
                      <SelectItem value="gpt-4.1-nano">GPT-4.1 Nano (최저가 💰)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (빠름 ⚡)</SelectItem>
                      <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini (균형)</SelectItem>
                      <SelectItem value="gpt-4.1">GPT-4.1 (고품질)</SelectItem>
                      <SelectItem value="claude-sonnet">Claude Sonnet 4.5 (최고품질 🏆)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">언어</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value: any) => setSettings({...settings, language: value})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-600">
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">문체</Label>
                  <Select
                    value={settings.tone}
                    onValueChange={(value: any) => setSettings({...settings, tone: value})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-600">
                      <SelectItem value="professional">전문적</SelectItem>
                      <SelectItem value="casual">캐주얼</SelectItem>
                      <SelectItem value="academic">학술적</SelectItem>
                      <SelectItem value="creative">창의적</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-white">대상 독자</Label>
                  <Input
                    id="audience"
                    placeholder="예: 초보자, 전문가, 학생"
                    value={settings.targetAudience}
                    onChange={(e) => setSettings({...settings, targetAudience: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white">전자책 주제</Label>
                <Input
                  id="topic"
                  placeholder="예: Python 프로그래밍, 디지털 마케팅, 건강한 식습관"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">상세 설명</Label>
                <Textarea
                  id="description"
                  placeholder="전자책에서 다루고 싶은 내용, 목표, 특별히 포함하고 싶은 주제 등을 자세히 설명해주세요."
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <Button
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold"
                size="lg"
                onClick={handleGenerateOutline}
                disabled={!topic || !description || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    목차 생성 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    AI로 목차 생성하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
