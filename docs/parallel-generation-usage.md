# 병렬 생성 API 사용 가이드

## 개요
5개 배치 병렬 생성 시스템으로 10개 챕터를 약 1분 만에 생성합니다.

## API 엔드포인트

### 1. 책 전체 생성 (POST /api/generate-book)

**Request:**
```typescript
POST /api/generate-book
Content-Type: application/json

{
  "bookId": "unique-book-id-123",  // UUID 권장
  "bookTitle": "AI 시대 생존 전략",
  "chapters": [
    {
      "number": 1,
      "title": "왜 지금 AI를 배워야 하는가",
      "keyPoints": [
        "AI 혁명의 현실",
        "직장인의 위기와 기회",
        "AI 시대의 필수 역량"
      ],
      "estimatedWords": 6000,
      "ahaMoment": "AI는 당신의 경쟁자가 아니라, 당신을 10배 강하게 만들 동료입니다"
    },
    {
      "number": 2,
      "title": "ChatGPT 제대로 활용하기",
      "keyPoints": [
        "프롬프트 엔지니어링 기초",
        "업무별 실전 활용법",
        "자동화 워크플로우 구축"
      ],
      "estimatedWords": 6000
    }
    // ... 10개 챕터
  ],
  "settings": {
    "aiModel": "claude-sonnet",
    "language": "ko",
    "tone": "professional"
  }
}
```

**Response:**
```typescript
{
  "bookId": "unique-book-id-123",
  "chapters": [
    {
      "index": 0,
      "title": "왜 지금 AI를 배워야 하는가",
      "content": "# 1장 왜 지금 AI를 배워야 하는가\n\n## 서론\n...",
      "status": "completed"
    }
    // ... 10개 챕터
  ],
  "totalTime": 58234,  // ms
  "completedChapters": 10,
  "totalChapters": 10
}
```

### 2. 진행상황 조회 (GET /api/generation-progress/[bookId])

**Request:**
```typescript
GET /api/generation-progress/unique-book-id-123
```

**Response:**
```typescript
{
  "bookId": "unique-book-id-123",
  "totalChapters": 10,
  "completedChapters": 3,
  "progress": 30,
  "elapsedTime": 15,  // 초
  "estimatedRemainingTime": 35,  // 초
  "chapters": [
    {
      "index": 0,
      "title": "왜 지금 AI를 배워야 하는가",
      "status": "completed",
      "contentLength": 6234,
      "preview": "# 1장 왜 지금 AI를 배워야 하는가..."
    },
    {
      "index": 1,
      "title": "ChatGPT 제대로 활용하기",
      "status": "generating",
      "contentLength": 1234,
      "preview": "# 2장 ChatGPT 제대로..."
    },
    {
      "index": 2,
      "title": "프롬프트 엔지니어링",
      "status": "generating",
      "contentLength": 567
    },
    {
      "index": 3,
      "title": "업무 자동화",
      "status": "pending",
      "contentLength": 0
    }
    // ...
  ],
  "isComplete": false
}
```

### 3. 실시간 진행상황 (SSE) (POST /api/generation-progress/[bookId])

**사용법:**
```typescript
const eventSource = new EventSource('/api/generation-progress/unique-book-id-123')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(`진행률: ${data.progress}%`)
  console.log(`완료: ${data.completedChapters}/${data.totalChapters}`)

  if (data.isComplete) {
    console.log('생성 완료!')
    eventSource.close()
  }
}

eventSource.onerror = (error) => {
  console.error('SSE 에러:', error)
  eventSource.close()
}
```

## React 컴포넌트 사용 예시

### 기본 사용법

```tsx
import { BookGenerationProgress } from '@/components/BookGenerationProgress'
import { useState } from 'react'

function MyBookCreator() {
  const [bookId, setBookId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateBook = async () => {
    const newBookId = crypto.randomUUID()

    // 1. 목차 생성
    const outlineResponse = await fetch('/api/generate-outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'AI 시대 생존 전략',
        description: 'ChatGPT를 활용한 업무 생산성 10배 향상',
        settings: { aiModel: 'claude-sonnet', language: 'ko' }
      })
    })

    const outline = await outlineResponse.json()

    // 2. 전체 책 생성 시작
    setBookId(newBookId)
    setIsGenerating(true)

    fetch('/api/generate-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: newBookId,
        bookTitle: outline.title,
        chapters: outline.chapters,
        settings: { aiModel: 'claude-sonnet' }
      })
    }).then(async (res) => {
      const result = await res.json()
      console.log('책 생성 완료:', result)
      setIsGenerating(false)
    })
  }

  return (
    <div>
      <button onClick={handleGenerateBook}>책 생성 시작</button>

      {isGenerating && bookId && (
        <BookGenerationProgress
          bookId={bookId}
          onComplete={(chapters) => {
            console.log('완료된 챕터들:', chapters)
            // 편집 페이지로 이동하거나 결과 표시
          }}
          onError={(error) => {
            console.error('생성 실패:', error)
            alert('책 생성 중 오류가 발생했습니다')
          }}
        />
      )}
    </div>
  )
}
```

### 고급 사용법 (커스터마이징)

```tsx
import { BookGenerationProgress } from '@/components/BookGenerationProgress'
import { useState, useEffect } from 'react'

function AdvancedBookCreator() {
  const [bookId, setBookId] = useState<string | null>(null)
  const [chapters, setChapters] = useState<any[]>([])

  // 완료된 챕터만 실시간으로 가져오기
  useEffect(() => {
    if (!bookId) return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/generation-progress/${bookId}`)
      if (res.ok) {
        const data = await res.json()

        // 완료된 챕터만 필터링
        const completed = data.chapters
          .filter((ch: any) => ch.status === 'completed')
          .map((ch: any) => ({
            index: ch.index,
            title: ch.title,
            content: ch.preview  // 전체 컨텐츠는 최종 결과에서
          }))

        setChapters(completed)

        if (data.isComplete) {
          clearInterval(interval)
          // 최종 결과 가져오기
          fetchFullBook(bookId)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [bookId])

  return (
    <div>
      <BookGenerationProgress bookId={bookId} />

      <div className="mt-8">
        <h2>완료된 챕터 ({chapters.length})</h2>
        {chapters.map((chapter) => (
          <div key={chapter.index}>
            <h3>{chapter.title}</h3>
            <p>{chapter.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 성능 특성

### 타이밍

```
배치 1 (챕터 1-5):
  ├─ 챕터 1 (Sonnet 4.5): ~30초
  ├─ 챕터 2-5 (Haiku 3.5): ~25초
  └─ 완료: ~30초 (병렬)

배치 2 (챕터 6-10):
  ├─ 챕터 6-10 (Haiku 3.5): ~25초
  └─ 완료: ~25초 (병렬)

총 소요시간: ~55초 (약 1분)
```

### 비용

```typescript
// Claude API 비용 (Tier 2 기준)
const costs = {
  sonnet45: {
    input: $0.003 / 1K tokens,
    output: $0.015 / 1K tokens
  },
  haiku35: {
    input: $0.0008 / 1K tokens,
    output: $0.004 / 1K tokens
  }
}

// 10챕터 책 생성 비용
const bookCost = {
  chapter1_sonnet: (3000 * 0.003 + 6000 * 0.015) = $0.099,
  chapters2_10_haiku: 9 * (3000 * 0.0008 + 6000 * 0.004) = $0.238,
  total: $0.337  // 약 $0.34 per book
}

// 월 1000권 생성 시: $340
```

### Rate Limits

```typescript
// Anthropic API Limits
const rateLimits = {
  tier1: {
    requests: 5 / minute,
    tokens: 40000 / minute,
    // 10챕터 병렬: ❌ (80K tokens 필요)
  },
  tier2: {
    requests: 50 / minute,
    tokens: 400000 / minute,
    // 10챕터 병렬: ✅ (80K tokens, 여유 있음)
  }
}

// 5개 배치 전략으로 Tier 1도 가능
const batchStrategy = {
  batch1: 5 * 8000 = 40000,  // ✅ Tier 1 OK
  batch2: 5 * 8000 = 40000,  // ✅ Tier 1 OK (1분 후)
}
```

## 에러 처리

### 부분 실패 처리

```typescript
// 챕터별로 독립적으로 생성되므로 부분 실패 가능
const result = await fetch('/api/generate-book', { ... }).then(r => r.json())

// 실패한 챕터 확인
const failedChapters = result.chapters.filter(ch => ch.status === 'error')

if (failedChapters.length > 0) {
  console.log('실패한 챕터:', failedChapters.map(ch => ch.index))

  // 재시도 로직
  for (const chapter of failedChapters) {
    await retryChapter(bookId, chapter.index)
  }
}
```

### 타임아웃 처리

```typescript
// Vercel Serverless 타임아웃: 10분
// 예상 시간: 1분
// 여유: 9분

// 만약 타임아웃 발생 시
const timeoutMs = 120000  // 2분
const generateWithTimeout = Promise.race([
  fetch('/api/generate-book', { ... }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  )
])
```

## 모니터링

### 로그 확인

```typescript
// 서버 로그 (Vercel 콘솔)
/*
[INFO] Starting parallel generation: bookId=xxx, batches=2
[INFO] Processing batch 1/2: chapters=[1,2,3,4,5]
[INFO] Generating chapter 1: model=Sonnet 4.5
[INFO] Generating chapter 2: model=Haiku 3.5
...
[INFO] Chapter 1 completed: 6234 chars, 28.5s
[INFO] Batch 1 completed
[INFO] Processing batch 2/2: chapters=[6,7,8,9,10]
...
[INFO] Book generation completed: 55.2s, 10/10 chapters
*/
```

## 주의사항

1. **bookId는 고유해야 함**: UUID 사용 권장
2. **동시 생성 제한**: 한 사용자당 최대 1개 책 동시 생성 권장
3. **진행상황 TTL**: 5분 후 자동 삭제 (메모리 절약)
4. **Tier 확인**: Anthropic API Tier 2 권장
5. **에러 재시도**: 자동 재시도 미구현, 수동 재시도 필요

## 다음 단계

- [ ] Redis로 진행상황 영구 저장
- [ ] 자동 재시도 로직
- [ ] 우선순위 큐 (유료 사용자 우선)
- [ ] 동시 생성 제한 (rate limiting)
- [ ] Webhook 콜백 (완료 시 알림)
