'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  ArrowLeft,
  Loader2,
  FileText,
  Download,
  Save,
  Edit3,
  CheckCircle,
  Copy,
  FileDown,
  MoreVertical,
  Plus,
  Trash
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
  aiModel: string
  language: string
  tone: string
  targetAudience: string
}

export default function EditPage() {
  const router = useRouter()
  const [outline, setOutline] = useState<Outline | null>(null)
  const [settings, setSettings] = useState<BookSettings | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number>(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedChapters, setGeneratedChapters] = useState<Set<number>>(new Set())
  const [editingContent, setEditingContent] = useState('')
  const [editingKeyPoints, setEditingKeyPoints] = useState(false)
  const [editingAhaMoment, setEditingAhaMoment] = useState(false)
  const [tempKeyPoints, setTempKeyPoints] = useState<string>('')
  const [tempAhaMoment, setTempAhaMoment] = useState<string>('')
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null)
  const [editingChapterTitle, setEditingChapterTitle] = useState<string>('')

  // localStorage에서 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('currentBook')
    if (!savedData) {
      toast.error('저장된 데이터가 없습니다')
      router.push('/create')
      return
    }

    try {
      const bookData = JSON.parse(savedData)
      setOutline(bookData.outline)
      setSettings(bookData.settings)
    } catch (error) {
      toast.error('데이터를 불러오는데 실패했습니다')
      router.push('/create')
    }
  }, [router])

  // outline 변경 시 localStorage 자동 저장
  useEffect(() => {
    if (outline && settings) {
      const bookData = {
        outline,
        settings,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('currentBook', JSON.stringify(bookData))
    }
  }, [outline, settings])

  // 챕터 변경 시 편집 모드 종료
  useEffect(() => {
    setEditingKeyPoints(false)
    setEditingAhaMoment(false)
  }, [selectedChapter])

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

  const handleAddChapter = (afterIndex?: number) => {
    if (!outline) return

    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : 0
    const newChapter: Chapter = {
      number: insertIndex + 1,
      title: '새 챕터',
      keyPoints: ['핵심 포인트 1', '핵심 포인트 2', '핵심 포인트 3'],
      estimatedWords: 2500
    }

    const updatedChapters = [...outline.chapters]
    updatedChapters.splice(insertIndex, 0, newChapter)

    updatedChapters.forEach((ch, i) => {
      ch.number = i + 1
    })

    setOutline({ ...outline, chapters: updatedChapters })

    const updatedGeneratedSet = new Set<number>()
    generatedChapters.forEach(idx => {
      if (idx >= insertIndex) {
        updatedGeneratedSet.add(idx + 1)
      } else {
        updatedGeneratedSet.add(idx)
      }
    })
    setGeneratedChapters(updatedGeneratedSet)

    setSelectedChapter(insertIndex)
    toast.success('새 챕터가 추가되었습니다')
  }

  const handleDeleteChapter = (index: number) => {
    if (!outline) return

    const chapter = outline.chapters[index]

    if (chapter.content) {
      if (!confirm(`"${chapter.title}" 챕터를 삭제하시겠습니까? 생성된 내용이 모두 삭제됩니다.`)) {
        return
      }
    }

    const updatedChapters = outline.chapters.filter((_, i) => i !== index)

    updatedChapters.forEach((ch, i) => {
      ch.number = i + 1
    })

    setOutline({ ...outline, chapters: updatedChapters })

    const updatedGeneratedSet = new Set<number>()
    generatedChapters.forEach(idx => {
      if (idx < index) {
        updatedGeneratedSet.add(idx)
      } else if (idx > index) {
        updatedGeneratedSet.add(idx - 1)
      }
    })
    setGeneratedChapters(updatedGeneratedSet)

    if (selectedChapter >= updatedChapters.length) {
      setSelectedChapter(Math.max(0, updatedChapters.length - 1))
    } else if (selectedChapter === index && index > 0) {
      setSelectedChapter(index - 1)
    }

    toast.success('챕터가 삭제되었습니다')
  }

  const handleEditChapterTitle = (index: number) => {
    setEditingChapterIndex(index)
    setEditingChapterTitle(outline?.chapters[index].title || '')
  }

  const handleSaveChapterTitle = () => {
    if (!outline || editingChapterIndex === null) return

    const updatedChapters = [...outline.chapters]
    updatedChapters[editingChapterIndex].title = editingChapterTitle
    setOutline({ ...outline, chapters: updatedChapters })
    setEditingChapterIndex(null)
    toast.success('챕터 제목이 저장되었습니다')
  }

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success('클립보드에 복사되었습니다'))
      .catch(() => toast.error('복사에 실패했습니다'))
  }

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

  if (!outline) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">AI Book Writer</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/create">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                처음부터
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                  variant="outline"
                  onClick={() => handleAddChapter()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 챕터 추가
                </Button>
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
                    <div key={index} className="relative group">
                      {editingChapterIndex === index ? (
                        <div className="flex gap-2 p-2 border rounded-lg">
                          <Input
                            value={editingChapterTitle}
                            onChange={(e) => setEditingChapterTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveChapterTitle()
                              } else if (e.key === 'Escape') {
                                setEditingChapterIndex(null)
                              }
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button size="sm" onClick={handleSaveChapterTitle}>
                            저장
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingChapterIndex(null)}>
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant={selectedChapter === index ? 'default' : 'ghost'}
                            className="flex-1 justify-start text-left py-3 px-4 h-auto"
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditChapterTitle(index)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                제목 수정
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddChapter(index - 1)}>
                                <Plus className="w-4 h-4 mr-2" />
                                위에 추가
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddChapter(index)}>
                                <Plus className="w-4 h-4 mr-2" />
                                아래 추가
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteChapter(index)}
                                className="text-red-600"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
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
      </div>
    </div>
  )
}
