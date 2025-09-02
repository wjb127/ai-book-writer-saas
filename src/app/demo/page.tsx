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
  Download
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
}

interface Outline {
  title: string
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

  const handleGenerateOutline = async () => {
    if (!topic || !description) return
    
    setIsGenerating(true)
    
    // Demo용 샘플 목차 생성 (실제로는 API 호출)
    setTimeout(() => {
      const sampleOutline: Outline = {
        title: `${topic}: 완벽 가이드`,
        chapters: [
          {
            number: 1,
            title: '서론: 왜 지금 시작해야 하는가',
            keyPoints: [
              '현재 트렌드와 중요성',
              '이 책에서 배울 내용',
              '독자를 위한 로드맵'
            ],
            estimatedWords: 2500
          },
          {
            number: 2,
            title: '기초 개념 이해하기',
            keyPoints: [
              '핵심 용어와 정의',
              '기본 원리 설명',
              '실생활 예시'
            ],
            estimatedWords: 3000
          },
          {
            number: 3,
            title: '첫 단계 시작하기',
            keyPoints: [
              '준비물과 환경 설정',
              '단계별 가이드',
              '흔한 실수 피하기'
            ],
            estimatedWords: 2800
          },
          {
            number: 4,
            title: '심화 학습',
            keyPoints: [
              '고급 기술과 방법론',
              '전문가 팁',
              '케이스 스터디'
            ],
            estimatedWords: 3200
          },
          {
            number: 5,
            title: '실전 적용하기',
            keyPoints: [
              '프로젝트 계획',
              '실행 전략',
              '성과 측정 방법'
            ],
            estimatedWords: 2700
          },
          {
            number: 6,
            title: '문제 해결과 최적화',
            keyPoints: [
              '일반적인 문제와 해결책',
              '성능 개선 방법',
              '지속적인 개선'
            ],
            estimatedWords: 2900
          },
          {
            number: 7,
            title: '미래 전망',
            keyPoints: [
              '업계 동향',
              '새로운 기회',
              '준비해야 할 변화'
            ],
            estimatedWords: 2400
          },
          {
            number: 8,
            title: '결론: 다음 단계로',
            keyPoints: [
              '핵심 내용 정리',
              '실행 계획 수립',
              '추가 학습 자료'
            ],
            estimatedWords: 2000
          }
        ]
      }
      setOutline(sampleOutline)
      setStep(2)
      setIsGenerating(false)
    }, 2000)
  }

  const handleGenerateChapter = async (chapterIndex: number) => {
    if (!outline) return
    
    setIsGenerating(true)
    
    // Demo용 샘플 챕터 내용 생성 (실제로는 API 호출)
    setTimeout(() => {
      const chapter = outline.chapters[chapterIndex]
      const sampleContent = `# ${chapter.title}

## 소개

${chapter.title}에 대해 깊이 있게 알아보겠습니다. 이 장에서는 ${chapter.keyPoints.join(', ')} 등의 주제를 다룹니다.

## ${chapter.keyPoints[0]}

여기서는 ${chapter.keyPoints[0]}에 대한 상세한 설명을 제공합니다. 이는 매우 중요한 개념으로, 실제 적용에 있어 핵심적인 역할을 합니다.

### 핵심 포인트

- **첫 번째 포인트**: 구체적인 설명과 예시
- **두 번째 포인트**: 실용적인 적용 방법
- **세 번째 포인트**: 주의해야 할 사항

실제로 이를 적용할 때는 다음과 같은 순서를 따르는 것이 좋습니다:

1. 기초 개념 이해
2. 실습을 통한 체득
3. 실전 적용
4. 피드백과 개선

## ${chapter.keyPoints[1]}

${chapter.keyPoints[1]}는 다음 단계로 나아가기 위한 필수 요소입니다.

### 상세 설명

이 부분에서는 보다 구체적인 내용을 다룹니다. 예를 들어:

\`\`\`
예시 코드 또는 구체적인 단계
1단계: 준비
2단계: 실행
3단계: 검증
\`\`\`

> 💡 **Pro Tip**: 이 과정에서 가장 중요한 것은 꾸준한 실습입니다.

## ${chapter.keyPoints[2]}

마지막으로 ${chapter.keyPoints[2]}에 대해 알아보겠습니다.

### 실전 예시

실제 사례를 통해 이해를 돕겠습니다:

**사례 1**: 성공적인 적용 사례
- 배경 설명
- 적용 과정
- 결과와 교훈

**사례 2**: 실패에서 배운 교훈
- 문제 상황
- 시도한 해결책
- 개선된 접근법

## 요약

이 장에서 다룬 핵심 내용을 정리하면:

1. ${chapter.keyPoints[0]}의 중요성과 적용 방법
2. ${chapter.keyPoints[1]}를 통한 실력 향상
3. ${chapter.keyPoints[2]}로 완성도 높이기

다음 장에서는 더욱 심화된 내용을 다루게 됩니다. 지금까지 배운 내용을 충분히 이해하고 넘어가시기 바랍니다.

---

*이 내용은 AI에 의해 생성된 데모 콘텐츠입니다.*`

      const updatedChapters = [...outline.chapters]
      updatedChapters[chapterIndex].content = sampleContent
      
      setOutline({ ...outline, chapters: updatedChapters })
      setGeneratedChapters(prev => new Set(prev).add(chapterIndex))
      setIsGenerating(false)
    }, 3000)
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
            <Badge variant="secondary">
              <Sparkles className="w-3 h-3 mr-1" />
              데모 모드
            </Badge>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로
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
                <CardTitle className="text-2xl">전자책 주제 설정</CardTitle>
                <CardDescription>
                  AI가 전자책을 생성할 주제와 설명을 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">전자책 주제</Label>
                  <Input
                    id="topic"
                    placeholder="예: React 완벽 가이드, 창업 성공 전략, 건강한 라이프스타일"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">상세 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="전자책에서 다루고 싶은 내용을 자세히 설명해주세요. AI가 이를 바탕으로 목차와 내용을 생성합니다."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI가 생성할 내용
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 8-12개의 체계적인 챕터 구성</li>
                    <li>• 각 챕터별 핵심 포인트 정리</li>
                    <li>• 챕터당 2,000-3,000 단어 분량</li>
                    <li>• 전문적이고 읽기 쉬운 문체</li>
                  </ul>
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
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* 목차 사이드바 */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">목차</CardTitle>
                <CardDescription>{outline?.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {outline?.chapters.map((chapter, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant={selectedChapter === index ? 'default' : 'ghost'}
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedChapter(index)}
                        >
                          <div className="flex items-start w-full">
                            <span className="mr-3 font-bold">{chapter.number}.</span>
                            <div className="flex-1">
                              <div className="font-medium">{chapter.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                약 {chapter.estimatedWords.toLocaleString()}자
                              </div>
                            </div>
                            {generatedChapters.has(index) && (
                              <Badge variant="secondary" className="ml-2">
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
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      Chapter {outline?.chapters[selectedChapter].number}: {outline?.chapters[selectedChapter].title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      핵심 포인트: {outline?.chapters[selectedChapter].keyPoints.join(' • ')}
                    </CardDescription>
                  </div>
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
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        내용 생성
                      </>
                    )}
                  </Button>
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
                            '내용 생성' 버튼을 클릭하여
                            <br />AI가 챕터 내용을 작성하도록 하세요
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