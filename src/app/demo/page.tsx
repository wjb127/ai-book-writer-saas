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
  Lock,
  Eye,
  Crown,
  CheckCircle
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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Chapter {
  number: number
  title: string
  keyPoints: string[]
  estimatedWords: number
  content?: string
  isLocked?: boolean
  isPreview?: boolean
  ahaMoment?: string
}

interface Outline {
  title: string
  subtitle?: string
  chapters: Chapter[]
}

export default function DemoPage() {
  const [step, setStep] = useState(1)
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [outline, setOutline] = useState<Outline | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedChapters, setGeneratedChapters] = useState<Set<number>>(new Set())
  const [editingKeyPoints, setEditingKeyPoints] = useState(false)
  const [editingAhaMoment, setEditingAhaMoment] = useState(false)
  const [tempKeyPoints, setTempKeyPoints] = useState<string>('')
  const [tempAhaMoment, setTempAhaMoment] = useState<string>('')

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
  }

  const handleSaveAhaMoment = () => {
    if (!outline) return
    const updatedChapters = [...outline.chapters]
    updatedChapters[selectedChapter].ahaMoment = tempAhaMoment
    setOutline({ ...outline, chapters: updatedChapters })
    setEditingAhaMoment(false)
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
    if (!topic || !description) return

    setIsGenerating(true)

    try {
      // 실제 API 호출로 아웃라인 생성
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          description,
          settings: { isDemo: true }
        })
      })

      if (!response.ok) throw new Error('Failed to generate outline')

      const data = await response.json()

      // 하이브리드 데모 로직: 챕터별 권한 설정
      const chaptersWithPermissions = data.chapters.map((chapter: Chapter, index: number) => ({
        ...chapter,
        isLocked: index >= 3,      // 4번째 챕터부터 완전 잠금
        isPreview: index >= 1 && index < 3  // 2-3번째 챕터는 미리보기만
      }))

      setOutline({ ...data, chapters: chaptersWithPermissions })
      setStep(2)
    } catch (error) {
      console.error('Error generating outline:', error)
      // 에러 발생 시 기본 샘플 데이터
      const sampleOutline: Outline = {
        title: `${topic}: 완벽 가이드`,
        chapters: Array.from({ length: 6 }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}`,
          keyPoints: ['포인트 1', '포인트 2', '포인트 3'],
          estimatedWords: 2500,
          isLocked: i >= 3,
          isPreview: i >= 1 && i < 3
        }))
      }
      setOutline(sampleOutline)
      setStep(2)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateChapter = async (chapterIndex: number) => {
    if (!outline) return

    const chapter = outline.chapters[chapterIndex]

    // 잠금된 챕터는 생성 불가
    if (chapter.isLocked) {
      return
    }

    setIsGenerating(true)

    try {
      // 미리보기 챕터 (2-3번)는 샘플 데이터만
      if (chapter.isPreview) {
        const previewContent = `# ${chapter.title}

## 🔒 미리보기 모드

이 챕터는 미리보기 모드입니다. 실제 내용 중 일부만 확인할 수 있습니다.

## ${chapter.keyPoints[0]}

${chapter.keyPoints[0]}에 대한 내용이 여기에 표시됩니다...

### 핵심 내용
- 중요 포인트 1
- 중요 포인트 2
- 중요 포인트 3

---

## 📌 프리미엄으로 업그레이드하세요!

전체 내용을 보려면 프리미엄 플랜으로 업그레이드하세요.

**프리미엄 플랜 혜택:**
- ✅ 모든 챕터 전체 내용 생성
- ✅ 고급 AI 모델 (GPT-4, Claude Opus) 사용
- ✅ PDF, EPUB, DOCX 내보내기
- ✅ 무제한 eBook 생성

[업그레이드하기 →](/pricing)

*이 내용은 미리보기입니다.*`

        const updatedChapters = [...outline.chapters]
        updatedChapters[chapterIndex].content = previewContent
        setOutline({ ...outline, chapters: updatedChapters })
        setGeneratedChapters(prev => new Set(prev).add(chapterIndex))
        setIsGenerating(false)
        return
      }

      // 첫 번째 챕터만 실제 API 호출 (스트리밍)
      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: outline.title,
          chapter,
          settings: {
            aiModel: 'gpt-3.5-turbo',
            language: 'ko',
            tone: 'professional',
            targetAudience: 'general',
            isDemo: true
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate chapter')

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
    } catch (error) {
      console.error('Error generating chapter:', error)
    } finally {
      setIsGenerating(false)
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
            <Badge variant="secondary" className="hidden sm:flex">
              <Sparkles className="w-3 h-3 mr-1" />
              무료 데모 (1개 챕터 + 미리보기)
            </Badge>
            <Badge variant="secondary" className="sm:hidden">
              <Sparkles className="w-3 h-3 mr-1" />
              데모
            </Badge>
            <Link href="/create">
              <Button variant="outline" size="sm">
                <Crown className="w-4 h-4 mr-2" />
                전체 버전
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    최신 AI 엔진
                  </Badge>
                  <CardTitle className="text-2xl">전자책 주제 설정</CardTitle>
                  <CardDescription>
                    AI가 독자에게 <strong>"아하!"</strong> 모먼트를 선사하는 전자책을 만듭니다
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">전자책 주제</Label>
                  <Input
                    id="topic"
                    placeholder="예: AI 시대 생존 전략, 월급 외 수입 만들기, 효율적인 시간 관리"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 구체적이고 변화를 약속하는 주제일수록 좋습니다
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">상세 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="이 전자책을 읽는 독자가 어떤 문제를 해결하고, 어떤 변화를 경험하게 될까요? 구체적으로 설명해주세요.&#10;&#10;예시: 직장인들이 퇴근 후 2-3시간으로 월 100만원 이상의 부수입을 만드는 실전 전략과 구체적인 방법들을 단계별로 알려주는 책입니다."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 독자의 문제, 목표, 기대하는 변화를 구체적으로 작성하세요
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      빠른 시작 - 예시로 체험하기
                    </h4>
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

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      데모 모드에서 가능한 것
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✅ 고급 AI로 독자를 사로잡는 목차 생성</li>
                      <li>✅ 첫 인상을 강렬하게 만드는 1장 생성</li>
                      <li>👁️ 2-3번째 챕터 미리보기</li>
                      <li>🔒 나머지 챕터는 프리미엄 전용</li>
                    </ul>
                  </div>
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
                      목차 생성하기
                      <ArrowRight className="w-4 h-4 ml-2" />
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
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">목차</CardTitle>
                <CardDescription>
                  <div className="font-semibold text-foreground leading-snug">{outline?.title}</div>
                  {outline?.subtitle && (
                    <div className="text-xs mt-1.5 leading-relaxed">{outline.subtitle}</div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
                  <div className="space-y-3 pb-2">
                    {outline?.chapters.map((chapter, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant={selectedChapter === index ? 'default' : 'ghost'}
                          className="w-full justify-start text-left relative h-auto py-3 px-4"
                          onClick={() => setSelectedChapter(index)}
                          disabled={chapter.isLocked}
                        >
                          <div className="flex items-start w-full gap-3">
                            <span className="font-bold text-base mt-0.5 shrink-0">{chapter.number}.</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium flex items-center gap-2 leading-relaxed">
                                <span className="line-clamp-2">{chapter.title}</span>
                                {chapter.ahaMoment && (
                                  <Badge variant="default" className="text-xs shrink-0 ml-1">
                                    💡 아하!
                                  </Badge>
                                )}
                                {chapter.isLocked && <Lock className="w-3 h-3 shrink-0 ml-1" />}
                                {chapter.isPreview && <Eye className="w-3 h-3 shrink-0 ml-1" />}
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                약 {chapter.estimatedWords.toLocaleString()}자
                              </div>
                            </div>
                            {generatedChapters.has(index) && (
                              <Badge variant="secondary" className="shrink-0">
                                <FileText className="w-3 h-3" />
                              </Badge>
                            )}
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setStep(1)
                      setOutline(null)
                      setGeneratedChapters(new Set())
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    새로운 주제로
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 콘텐츠 영역 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>
                        Chapter {outline?.chapters[selectedChapter].number}: {outline?.chapters[selectedChapter].title}
                      </CardTitle>
                      {outline?.chapters[selectedChapter].ahaMoment && (
                        <Badge variant="default" className="ml-2">
                          💡 아하모먼트
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border space-y-4">
                      {/* 핵심 포인트 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-foreground">📌 핵심 포인트</div>
                          {!editingKeyPoints && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleStartEditKeyPoints}
                            >
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={handleStartEditAhaMoment}
                              >
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
                  </div>
                  {outline?.chapters[selectedChapter].isLocked ? (
                    <Link href="/pricing">
                      <Button variant="default">
                        <Crown className="w-4 h-4 mr-2" />
                        프리미엄으로 업그레이드
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => handleGenerateChapter(selectedChapter)}
                      disabled={isGenerating || generatedChapters.has(selectedChapter)}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          생성 중...
                        </>
                      ) : generatedChapters.has(selectedChapter) ? (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          재생성
                        </>
                      ) : outline?.chapters[selectedChapter].isPreview ? (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          미리보기 보기
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          내용 생성
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="preview" className="flex-1">미리보기</TabsTrigger>
                    <TabsTrigger value="markdown" className="flex-1">마크다운</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview">
                    <ScrollArea className="h-[500px] w-full rounded-md border p-6">
                      {outline?.chapters[selectedChapter].isLocked ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Lock className="w-16 h-16 mb-4 text-muted-foreground" />
                          <h3 className="text-xl font-semibold mb-2">잠긴 챕터</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            이 챕터는 프리미엄 플랜에서만 이용할 수 있습니다.
                            <br />
                            업그레이드하여 모든 챕터를 생성하고 완전한 eBook을 만들어보세요.
                          </p>
                          <Link href="/pricing">
                            <Button size="lg">
                              <Crown className="w-5 h-5 mr-2" />
                              프리미엄으로 업그레이드
                            </Button>
                          </Link>
                          <div className="mt-8 p-4 bg-muted rounded-lg max-w-md">
                            <h4 className="font-semibold mb-2">프리미엄 혜택</h4>
                            <ul className="text-sm text-left space-y-1">
                              <li>✅ 모든 챕터 전체 생성</li>
                              <li>✅ GPT-4, Claude Opus 사용</li>
                              <li>✅ PDF/EPUB/DOCX 내보내기</li>
                              <li>✅ 무제한 eBook 생성</li>
                            </ul>
                          </div>
                        </div>
                      ) : outline?.chapters[selectedChapter].content ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {outline.chapters[selectedChapter].content}
                          </ReactMarkdown>
                          {outline?.chapters[selectedChapter].isPreview && (
                            <div className="mt-6 p-4 border-2 border-primary rounded-lg bg-primary/5">
                              <h4 className="font-semibold mb-2 flex items-center">
                                <Eye className="w-5 h-5 mr-2" />
                                미리보기 모드
                              </h4>
                              <p className="text-sm mb-4">
                                전체 내용을 보려면 프리미엄으로 업그레이드하세요.
                              </p>
                              <Link href="/pricing">
                                <Button size="sm">
                                  <Crown className="w-4 h-4 mr-2" />
                                  업그레이드하기
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <FileText className="w-12 h-12 mb-4" />
                          <p className="text-center">
                            {outline?.chapters[selectedChapter].isPreview ? (
                              <>
                                '미리보기 보기' 버튼을 클릭하여
                                <br />샘플 콘텐츠를 확인하세요
                              </>
                            ) : (
                              <>
                                '내용 생성' 버튼을 클릭하여
                                <br />AI가 챕터 내용을 작성하도록 하세요
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="markdown">
                    <ScrollArea className="h-[500px] w-full rounded-md border">
                      <pre className="p-6 text-sm">
                        <code>
                          {outline?.chapters[selectedChapter].content || '// 아직 생성된 내용이 없습니다'}
                        </code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                {generatedChapters.size === outline?.chapters.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-primary/10 rounded-lg"
                  >
                    <h4 className="font-semibold mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                      모든 챕터 생성 완료!
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      전자책이 완성되었습니다. 실제 서비스에서는 PDF, EPUB 형식으로 다운로드할 수 있습니다.
                    </p>
                    <Button className="w-full" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      다운로드 (프리미엄 기능)
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}