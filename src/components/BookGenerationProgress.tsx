'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react'

interface Chapter {
  index: number
  title: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  contentLength: number
  preview?: string
}

interface GenerationProgress {
  bookId: string
  totalChapters: number
  completedChapters: number
  progress: number
  elapsedTime: number
  estimatedRemainingTime: number
  chapters: Chapter[]
  isComplete: boolean
  waiting?: boolean
  message?: string
  error?: string
}

interface BookGenerationProgressProps {
  bookId: string
  onComplete?: (chapters: Chapter[]) => void
  onError?: (error: string) => void
}

export function BookGenerationProgress({
  bookId,
  onComplete,
  onError
}: BookGenerationProgressProps) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)
  const [isWaiting, setIsWaiting] = useState(true)

  useEffect(() => {
    if (!bookId) return

    // SSE로 실시간 진행상황 받기
    const eventSource = new EventSource(`/api/generation-progress/${bookId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as GenerationProgress

        if (data.error) {
          onError?.(data.error)
          eventSource.close()
          return
        }

        // 대기 중 메시지
        if (data.waiting) {
          setIsWaiting(true)
          // 대기 중에도 메시지를 보여주기 위해 progress 업데이트
          setProgress(data)
          return
        }

        // 실제 진행 시작
        setIsWaiting(false)
        setProgress(data)

        // 완료 시
        if (data.isComplete) {
          onComplete?.(data.chapters)
          eventSource.close()
        }
      } catch (error) {
        console.error('Failed to parse progress data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()

      // Fallback: 폴링으로 전환
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/generation-progress/${bookId}?stream=false`)
          if (res.ok) {
            const data = await res.json()
            setProgress(data)

            if (data.isComplete) {
              clearInterval(interval)
              onComplete?.(data.chapters)
            }
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 2000)

      return () => clearInterval(interval)
    }

    return () => {
      eventSource.close()
    }
  }, [bookId, onComplete, onError])

  if (!progress || isWaiting) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{progress?.message || '초기화 중...'}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: Chapter['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'generating':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  const getStatusBadge = (status: Chapter['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">완료</Badge>
      case 'generating':
        return <Badge variant="default" className="bg-blue-600">생성 중</Badge>
      case 'error':
        return <Badge variant="destructive">오류</Badge>
      default:
        return <Badge variant="outline">대기 중</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📖 책 생성 중...</span>
          {progress.isComplete && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              완료!
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI가 책을 작성하고 있습니다. 잠시만 기다려주세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 전체 진행률 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              전체 진행률: {progress.completedChapters} / {progress.totalChapters} 챕터
            </span>
            <span className="text-muted-foreground">
              {progress.progress}%
            </span>
          </div>
          <Progress value={progress.progress} className="h-3" />
        </div>

        {/* 시간 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">경과 시간</div>
              <div className="text-muted-foreground">{formatTime(progress.elapsedTime)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">남은 시간 (예상)</div>
              <div className="text-muted-foreground">
                {progress.estimatedRemainingTime > 0
                  ? formatTime(progress.estimatedRemainingTime)
                  : '계산 중...'}
              </div>
            </div>
          </div>
        </div>

        {/* 챕터별 상태 */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm">챕터별 진행 상황</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {progress.chapters.map((chapter) => (
              <div
                key={chapter.index}
                className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setExpandedChapter(
                  expandedChapter === chapter.index ? null : chapter.index
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(chapter.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {chapter.index + 1}. {chapter.title}
                      </div>
                      {chapter.status === 'generating' && chapter.contentLength > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {chapter.contentLength.toLocaleString()}자 생성됨...
                        </div>
                      )}
                      {chapter.status === 'completed' && (
                        <div className="text-xs text-muted-foreground">
                          {chapter.contentLength.toLocaleString()}자
                        </div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(chapter.status)}
                </div>

                {/* 미리보기 (확장 시) */}
                {expandedChapter === chapter.index && chapter.preview && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {chapter.preview}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 상태 메시지 */}
        {!progress.isComplete && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {progress.completedChapters === 0
                ? '생성을 시작합니다...'
                : progress.completedChapters < 5
                ? '1차 배치 생성 중... (5개 챕터 동시 생성)'
                : '2차 배치 생성 중... (5개 챕터 동시 생성)'}
            </span>
          </div>
        )}

        {progress.isComplete && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>모든 챕터 생성이 완료되었습니다!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
