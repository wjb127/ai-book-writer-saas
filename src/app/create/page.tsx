'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText,
  Download,
  Save,
  Edit3,
  CheckCircle,
  Settings,
  Wand2,
  Copy,
  FileDown
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

interface Chapter {
  number: number
  title: string
  keyPoints: string[]
  estimatedWords: number
  content?: string
  isEditing?: boolean
  ahaMoment?: string
}

interface Outline {
  title: string
  subtitle?: string
  chapters: Chapter[]
}

interface BookSettings {
  aiModel: 'gpt-4.1-nano' | 'gpt-4o-mini' | 'gpt-4.1-mini' | 'gpt-4.1' | 'claude-sonnet' | 'claude-opus'
  language: 'ko' | 'en' | 'ja' | 'zh'
  tone: 'professional' | 'casual' | 'academic' | 'creative'
  targetAudience: string
}

export default function CreatePage() {
  const [step, setStep] = useState(1)
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [outline, setOutline] = useState<Outline | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedChapters, setGeneratedChapters] = useState<Set<number>>(new Set())
  const [editingContent, setEditingContent] = useState('')
  const [editingKeyPoints, setEditingKeyPoints] = useState(false)
  const [editingAhaMoment, setEditingAhaMoment] = useState(false)
  const [tempKeyPoints, setTempKeyPoints] = useState<string>('')
  const [tempAhaMoment, setTempAhaMoment] = useState<string>('')
  const [settings, setSettings] = useState<BookSettings>({
    aiModel: 'gpt-4.1-nano',
    language: 'ko',
    tone: 'professional',
    targetAudience: '일반 독자'
  })

  // 챕터 변경 시 편집 모드 종료
  useEffect(() => {
    setEditingKeyPoints(false)
    setEditingAhaMoment(false)
  }, [selectedChapter])

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

  const handleSaveKeyPoints = () => {
    if (!outline) return
    const points = tempKeyPoints.split('\n').filter(p => p.trim())
    const updatedChapters = [...outline.chapters]
    updatedChapters[selectedChapter].keyPoints = points
    setOutline({ ...outline, chapters: updatedChapters })
    setEditingKeyPoints(false)
    toast.success('핵심 포인트가 저장되었습니다')
  }

  const handleSaveAhaMoment = () => {
    if (!outline) return
    const updatedChapters = [...outline.chapters]
    updatedChapters[selectedChapter].ahaMoment = tempAhaMoment
    setOutline({ ...outline, chapters: updatedChapters })
    setEditingAhaMoment(false)
    toast.success('핵심 인사이트가 저장되었습니다')
  }

  const handleStartEditKeyPoints = () => {
    setTempKeyPoints(outline?.chapters[selectedChapter].keyPoints.join('\n') || '')
    setEditingKeyPoints(true)
  }

  const handleStartEditAhaMoment = () => {
    setTempAhaMoment(outline?.chapters[selectedChapter].ahaMoment || '')
    setEditingAhaMoment(true)
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
      setOutline(data)
      setStep(2)
      toast.success('목차가 성공적으로 생성되었습니다')
    } catch (error) {
      toast.error('목차 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateChapter = async (chapterIndex: number) => {
    if (!outline) return

    setIsGenerating(true)

    try {
      const chapter = outline.chapters[chapterIndex]

      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: outline.title,
          chapter,
          settings
        })
      })

      if (!response.ok) throw new Error('챕터 생성 실패')

      // 스트리밍 응답 처리
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk

        // 실시간으로 UI 업데이트
        const updatedChapters = [...outline.chapters]
        updatedChapters[chapterIndex].content = fullContent
        setOutline({ ...outline, chapters: updatedChapters })
      }

      setGeneratedChapters(prev => new Set(prev).add(chapterIndex))
      toast.success(`Chapter ${chapterIndex + 1} 생성 완료`)
    } catch (error) {
      toast.error('챕터 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAllChapters = async () => {
    if (!outline) return

    for (let i = 0; i < outline.chapters.length; i++) {
      if (!generatedChapters.has(i)) {
        await handleGenerateChapter(i)
      }
    }
  }

  const handleSaveChapter = (chapterIndex: number) => {
    if (!outline) return

    const updatedChapters = [...outline.chapters]
    updatedChapters[chapterIndex].content = editingContent
    updatedChapters[chapterIndex].isEditing = false

    setOutline({ ...outline, chapters: updatedChapters })
    toast.success('챕터가 저장되었습니다')
  }

  // 클립보드에 복사
  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success('클립보드에 복사되었습니다'))
      .catch(() => toast.error('복사에 실패했습니다'))
  }

  // TXT 파일 다운로드
  const handleDownloadTxt = (content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('TXT 파일이 다운로드되었습니다')
  }

  // PDF 파일 다운로드 (개별 챕터)
  const handleDownloadChapterPdf = async (chapterIndex: number) => {
    if (!outline) return

    const chapter = outline.chapters[chapterIndex]
    if (!chapter.content) {
      toast.error('생성된 내용이 없습니다')
      return
    }

    toast.info('PDF 생성 중...')

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outline: {
            title: outline.title,
            chapters: [chapter]
          },
          format: 'pdf'
        })
      })

      if (!response.ok) throw new Error('PDF 생성 실패')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${chapter.title}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('PDF 파일이 다운로드되었습니다')
    } catch (error) {
      toast.error('PDF 생성 중 오류가 발생했습니다')
    }
  }

  const handleExport = async (format: 'pdf' | 'epub' | 'docx') => {
    if (!outline || generatedChapters.size === 0) {
      toast.error('최소 하나 이상의 챕터를 생성해주세요')
      return
    }

    toast.info(`${format.toUpperCase()} 형식으로 내보내기 준비 중...`)

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outline,
          format
        })
      })

      if (!response.ok) throw new Error('내보내기 실패')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${outline.title}.${format}`
      a.click()

      toast.success('파일이 다운로드되었습니다')
    } catch (error) {
      toast.error('내보내기 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">AI Book Writer</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">새 전자책 만들기</CardTitle>
                <CardDescription>
                  AI가 전문적인 전자책을 생성합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 빠른 시작 예시 */}
                <div className="space-y-2">
                  <Label>빠른 시작 예시</Label>
                  <div className="grid gap-2">
                    {quickStartExamples.map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2"
                        onClick={() => loadExample(example)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{example.topic}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {example.description.substring(0, 60)}...
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 설정 섹션 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>AI 모델</Label>
                    <Select
                      value={settings.aiModel}
                      onValueChange={(value: any) => setSettings({...settings, aiModel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4.1-nano">GPT-4.1 Nano (최저가 💰)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (빠름 ⚡)</SelectItem>
                        <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini (균형)</SelectItem>
                        <SelectItem value="gpt-4.1">GPT-4.1 (고품질)</SelectItem>
                        <SelectItem value="claude-sonnet">Claude Sonnet 4.5 (최고품질 🏆)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>언어</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value: any) => setSettings({...settings, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>문체</Label>
                    <Select
                      value={settings.tone}
                      onValueChange={(value: any) => setSettings({...settings, tone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">전문적</SelectItem>
                        <SelectItem value="casual">캐주얼</SelectItem>
                        <SelectItem value="academic">학술적</SelectItem>
                        <SelectItem value="creative">창의적</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">대상 독자</Label>
                    <Input
                      id="audience"
                      placeholder="예: 초보자, 전문가, 학생"
                      value={settings.targetAudience}
                      onChange={(e) => setSettings({...settings, targetAudience: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="topic">전자책 주제</Label>
                  <Input
                    id="topic"
                    placeholder="예: Python 프로그래밍, 디지털 마케팅, 건강한 식습관"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">상세 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="전자책에서 다루고 싶은 내용, 목표, 특별히 포함하고 싶은 주제 등을 자세히 설명해주세요."
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-6"
          >
            {/* 목차 사이드바 */}
            <Card className="h-fit max-h-[calc(100vh-8rem)] sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">목차</CardTitle>
                <CardDescription className="text-sm line-clamp-2">{outline?.title}</CardDescription>
                {outline?.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{outline.subtitle}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleGenerateAllChapters}
                    disabled={isGenerating || generatedChapters.size === outline?.chapters.length}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    모든 챕터 생성
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        내보내기
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>전자책 내보내기</DialogTitle>
                        <DialogDescription>
                          원하는 형식을 선택하세요
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Button onClick={() => handleExport('pdf')}>
                          PDF 형식으로 다운로드
                        </Button>
                        <Button onClick={() => handleExport('epub')}>
                          EPUB 형식으로 다운로드
                        </Button>
                        <Button onClick={() => handleExport('docx')}>
                          DOCX 형식으로 다운로드
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="h-[calc(100vh-28rem)] pr-4">
                  <div className="space-y-3">
                    {outline?.chapters.map((chapter, index) => (
                      <Button
                        key={index}
                        variant={selectedChapter === index ? 'default' : 'ghost'}
                        className="w-full justify-start text-left py-3 px-4 h-auto"
                        onClick={() => setSelectedChapter(index)}
                      >
                        <div className="flex items-start w-full gap-2">
                          <span className="text-xs font-bold mt-0.5 flex-shrink-0">{chapter.number}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium line-clamp-2">
                              {chapter.title}
                            </div>
                          </div>
                          {generatedChapters.has(index) && (
                            <CheckCircle className="w-4 h-4 ml-1 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    진행률: {generatedChapters.size}/{outline?.chapters.length}
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(generatedChapters.size / (outline?.chapters.length || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 콘텐츠 영역 */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-xl mb-3">
                    Chapter {outline?.chapters[selectedChapter].number}: {outline?.chapters[selectedChapter].title}
                  </CardTitle>
                  <div className="flex gap-2">
                    {outline?.chapters[selectedChapter].content && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (outline.chapters[selectedChapter].isEditing) {
                            handleSaveChapter(selectedChapter)
                          } else {
                            const updatedChapters = [...outline.chapters]
                            updatedChapters[selectedChapter].isEditing = true
                            setEditingContent(outline.chapters[selectedChapter].content || '')
                            setOutline({ ...outline, chapters: updatedChapters })
                          }
                        }}
                      >
                        {outline.chapters[selectedChapter].isEditing ? (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            저장
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-1" />
                            편집
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleGenerateChapter(selectedChapter)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          {generatedChapters.has(selectedChapter) ? '재생성' : '내용 생성'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 편집 가능한 핵심 포인트 & 아하모먼트 */}
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border space-y-4">
                  {/* 핵심 포인트 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-foreground">📌 핵심 포인트</div>
                      {!editingKeyPoints && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleStartEditKeyPoints}>
                          수정
                        </Button>
                      )}
                    </div>
                    {editingKeyPoints ? (
                      <div className="space-y-2">
                        <Textarea
                          value={tempKeyPoints}
                          onChange={(e) => setTempKeyPoints(e.target.value)}
                          placeholder="각 줄에 하나씩 입력하세요"
                          rows={4}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveKeyPoints}>저장</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingKeyPoints(false)}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {outline?.chapters[selectedChapter].keyPoints.join(' • ')}
                      </div>
                    )}
                  </div>

                  {/* 아하모먼트 (첫 챕터만) */}
                  {outline?.chapters[selectedChapter].number === 1 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-primary flex items-center gap-1">
                          💡 핵심 인사이트
                        </div>
                        {!editingAhaMoment && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleStartEditAhaMoment}>
                            수정
                          </Button>
                        )}
                      </div>
                      {editingAhaMoment ? (
                        <div className="space-y-2">
                          <Textarea
                            value={tempAhaMoment}
                            onChange={(e) => setTempAhaMoment(e.target.value)}
                            placeholder="독자가 경험할 핵심 깨달음을 입력하세요"
                            rows={3}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveAhaMoment}>저장</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingAhaMoment(false)}>취소</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-foreground">
                          {outline?.chapters[selectedChapter].ahaMoment || '아하모먼트를 추가하세요'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {outline?.chapters[selectedChapter].isEditing ? (
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="min-h-[600px] font-mono text-sm"
                  />
                ) : (
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="preview" className="flex-1">미리보기</TabsTrigger>
                      <TabsTrigger value="markdown" className="flex-1">마크다운</TabsTrigger>
                      <TabsTrigger value="stats" className="flex-1">통계</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview">
                      <div className="space-y-3">
                        {outline?.chapters[selectedChapter].content && (
                          <div className="flex gap-2 border-b pb-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyToClipboard(outline.chapters[selectedChapter].content!)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              복사
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadTxt(
                                outline.chapters[selectedChapter].content!,
                                outline.chapters[selectedChapter].title
                              )}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              TXT
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadChapterPdf(selectedChapter)}
                            >
                              <FileDown className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        )}
                        <ScrollArea className="h-[550px] w-full rounded-md border p-6">
                          {outline?.chapters[selectedChapter].content ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {outline.chapters[selectedChapter].content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                              <FileText className="w-12 h-12 mb-4" />
                              <p className="text-center">
                                아직 생성된 내용이 없습니다
                                <br />상단의 '내용 생성' 버튼을 클릭해주세요
                              </p>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    <TabsContent value="markdown">
                      <ScrollArea className="h-[600px] w-full rounded-md border">
                        <pre className="p-6 text-sm">
                          <code>
                            {outline?.chapters[selectedChapter].content || '// 내용이 없습니다'}
                          </code>
                        </pre>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="stats">
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">예상 단어 수</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {outline?.chapters[selectedChapter].estimatedWords.toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">실제 단어 수</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-2xl font-bold">
                                {outline?.chapters[selectedChapter].content?.split(/\s+/).length.toLocaleString() || 0}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">핵심 포인트</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-1">
                              {outline?.chapters[selectedChapter].keyPoints.map((point, i) => (
                                <li key={i} className="flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                  <span className="text-sm">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
