'use client'

import { useState } from 'react'
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
  Wand2
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
}

interface Outline {
  title: string
  chapters: Chapter[]
}

interface BookSettings {
  aiModel: 'gpt-3.5' | 'gpt-4' | 'claude-sonnet' | 'claude-opus'
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
  const [settings, setSettings] = useState<BookSettings>({
    aiModel: 'gpt-4',
    language: 'ko',
    tone: 'professional',
    targetAudience: '일반 독자'
  })

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
      // 데모용 샘플 데이터
      const sampleOutline: Outline = {
        title: `${topic}: 완벽 마스터 가이드`,
        chapters: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          title: `Chapter ${i + 1}: ${topic} 핵심 개념 ${i + 1}`,
          keyPoints: [
            `핵심 포인트 ${i + 1}-1`,
            `핵심 포인트 ${i + 1}-2`,
            `핵심 포인트 ${i + 1}-3`
          ],
          estimatedWords: 2500 + Math.floor(Math.random() * 1000)
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
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: outline.title,
          chapter: outline.chapters[chapterIndex],
          settings
        })
      })
      
      if (!response.ok) throw new Error('챕터 생성 실패')
      
      const data = await response.json()
      const updatedChapters = [...outline.chapters]
      updatedChapters[chapterIndex].content = data.content
      
      setOutline({ ...outline, chapters: updatedChapters })
      setGeneratedChapters(prev => new Set(prev).add(chapterIndex))
      toast.success(`Chapter ${chapterIndex + 1} 생성 완료`)
    } catch (error) {
      toast.error('챕터 생성 중 오류가 발생했습니다')
      // 데모용 샘플 콘텐츠
      const chapter = outline.chapters[chapterIndex]
      const sampleContent = `# ${chapter.title}\n\n## 개요\n\n이 챕터에서는 ${chapter.keyPoints.join(', ')}에 대해 다룹니다.\n\n[AI가 생성할 상세 내용]`
      
      const updatedChapters = [...outline.chapters]
      updatedChapters[chapterIndex].content = sampleContent
      
      setOutline({ ...outline, chapters: updatedChapters })
      setGeneratedChapters(prev => new Set(prev).add(chapterIndex))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAllChapters = async () => {
    if (!outline) return
    
    for (let i = 0; i < outline.chapters.length; i++) {
      if (!generatedChapters.has(i)) {
        await handleGenerateChapter(i)
        // 각 챕터 생성 사이에 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 1000))
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
            {step === 2 && (
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                프로젝트 저장
              </Button>
            )}
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
                        <SelectItem value="gpt-3.5">GPT-3.5 (빠름)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4 (고품질)</SelectItem>
                        <SelectItem value="claude-sonnet">Claude Sonnet (균형)</SelectItem>
                        <SelectItem value="claude-opus">Claude Opus (최고품질)</SelectItem>
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
            className="grid lg:grid-cols-4 gap-6"
          >
            {/* 목차 사이드바 */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">목차</CardTitle>
                <CardDescription className="text-sm">{outline?.title}</CardDescription>
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
                
                <ScrollArea className="h-[500px]">
                  <div className="space-y-1">
                    {outline?.chapters.map((chapter, index) => (
                      <Button
                        key={index}
                        variant={selectedChapter === index ? 'default' : 'ghost'}
                        className="w-full justify-start text-left p-2"
                        onClick={() => setSelectedChapter(index)}
                      >
                        <div className="flex items-center w-full">
                          <span className="mr-2 text-xs font-bold">{chapter.number}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{chapter.title}</div>
                          </div>
                          {generatedChapters.has(index) && (
                            <CheckCircle className="w-4 h-4 ml-1 text-green-500 flex-shrink-0" />
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
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      Chapter {outline?.chapters[selectedChapter].number}: {outline?.chapters[selectedChapter].title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {outline?.chapters[selectedChapter].keyPoints.map((point, i) => (
                        <Badge key={i} variant="secondary" className="mr-2 mt-1">
                          {point}
                        </Badge>
                      ))}
                    </CardDescription>
                  </div>
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
                          {generatedChapters.has(selectedChapter) ? '재생성' : '생성'}
                        </>
                      )}
                    </Button>
                  </div>
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
                      <ScrollArea className="h-[600px] w-full rounded-md border p-6">
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
                              <br />상단의 '생성' 버튼을 클릭해주세요
                            </p>
                          </div>
                        )}
                      </ScrollArea>
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