# Claude Sonnet 4.5 속도 최적화 가이드

## 📊 문제 현황

**현재 상태:**
- 목차 생성: ~15초 (Haiku 3.5)
- 첫 챕터 생성: ~15-20초 (Sonnet 4.5)
- 사용자 체감: 느림, 답답함

**원인 분석:**
- 전체 응답 완료 후 반환 (Non-streaming)
- 프롬프트 캐싱 미적용
- 최적화되지 않은 토큰 설정

---

## 🚀 속도 개선 방법 (우선순위별)

### 1. Streaming API 구현 ⚡⚡⚡ (최우선 - 체감 속도 90% 개선)

**효과:**
- TTFT (Time To First Token): 0.64초 (Sonnet 4.5)
- 사용자 체감 속도: 즉각 반응
- 구현 난이도: 중
- 비용 영향: 없음

**구현 방법:**

```typescript
// 기존 (Non-streaming)
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 8000,
  messages: [{ role: 'user', content: prompt }],
})

// 개선 (Streaming)
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 8000,
  messages: [{ role: 'user', content: prompt }],
})

// 실시간 토큰 전송
for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta') {
    // 클라이언트로 즉시 전송
    yield chunk.delta.text
  }
}
```

**Next.js API Route 구현:**

```typescript
// ReadableStream 사용
const encoder = new TextEncoder()

const stream = new ReadableStream({
  async start(controller) {
    const apiStream = await anthropic.messages.stream({...})

    for await (const chunk of apiStream) {
      if (chunk.type === 'content_block_delta') {
        controller.enqueue(
          encoder.encode(chunk.delta.text)
        )
      }
    }

    controller.close()
  }
})

return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' }
})
```

**클라이언트 구현:**

```typescript
const response = await fetch('/api/generate-chapter', {
  method: 'POST',
  body: JSON.stringify(data)
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const text = decoder.decode(value)
  setContent(prev => prev + text) // 실시간 업데이트
}
```

---

### 2. Prompt Caching 구현 💰💰💰 (비용 90% + 속도 85% 개선)

**효과:**
- 비용 절감: 최대 90%
- 속도 개선: 최대 85%
- 캐시 유지: 5분 (ephemeral)
- 구현 난이도: 낮

**적용 조건:**
- 반복되는 시스템 프롬프트
- 최소 1024 토큰 이상 (Sonnet)
- 최소 2048 토큰 이상 (Haiku)

**구현 방법:**

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 8000,
  system: [
    {
      type: 'text',
      text: systemPrompt, // 긴 시스템 프롬프트
      cache_control: { type: 'ephemeral' } // 캐싱 활성화
    }
  ],
  messages: [{ role: 'user', content: prompt }],
})

// 응답에서 캐시 사용량 확인
console.log('Cache creation:', response.usage.cache_creation_input_tokens)
console.log('Cache reads:', response.usage.cache_read_input_tokens)
```

**캐싱 전략:**

```typescript
// 여러 캐시 브레이크포인트 (최대 4개)
system: [
  {
    type: 'text',
    text: baseSystemPrompt, // 모든 요청에 공통
    cache_control: { type: 'ephemeral' }
  },
  {
    type: 'text',
    text: bookContextPrompt, // 책 생성 시 공통
    cache_control: { type: 'ephemeral' }
  }
]
```

**비용 구조:**
- Cache Write: 기본 가격 × 1.25
- Cache Read: 기본 가격 × 0.1 (90% 절감)

**예시:**
```
첫 호출:
- Input: 10000 tokens × $3.00 = $0.03
- Cache Write: 10000 tokens × $3.75 = $0.0375

이후 호출 (캐시 히트):
- Cache Read: 10000 tokens × $0.30 = $0.003 (90% 절감)
```

---

### 3. Prompt & Output 최적화 📝 (점진적 개선)

**max_tokens 최적화:**

```typescript
// 현재 설정
max_tokens: 8000 // 모든 요청에 동일

// 개선 설정
const TOKEN_LIMITS = {
  outline: 2000,      // 목차는 짧음
  firstChapter: 4000, // 첫 챕터는 중간
  chapter: 3000,      // 일반 챕터
  summary: 1000       // 요약은 짧음
}
```

**프롬프트 길이 단축:**

```typescript
// ❌ 너무 장황
const prompt = `
I want you to create a very detailed and comprehensive ebook outline.
Please make sure to include all the important points and make it very clear.
Also, please ensure that the content is engaging and well-structured.
Furthermore, please add examples wherever possible.
...
`

// ✅ 간결하고 명확
const prompt = `
Create an ebook outline with:
- 6-8 chapters
- 3 key points per chapter
- Clear, engaging titles

Format: JSON
`
```

**Temperature 조정:**

```typescript
// 창의적 콘텐츠 (제목, 스토리)
temperature: 0.7

// 구조화된 출력 (목차, JSON)
temperature: 0.3
```

---

## 📈 예상 성능 개선

### Before (현재)

| 작업 | 모델 | 시간 | 사용자 체감 |
|------|------|------|------------|
| 목차 생성 | Haiku 3.5 | 15초 | 느림 😐 |
| 첫 챕터 | Sonnet 4.5 | 20초 | 매우 느림 😞 |
| 일반 챕터 | Haiku 3.5 | 15초 | 느림 😐 |

### After (Streaming 적용)

| 작업 | 모델 | TTFT | 완료 시간 | 사용자 체감 |
|------|------|------|----------|------------|
| 목차 생성 | Haiku 3.5 | 0.36초 | 15초 | 빠름 😊 |
| 첫 챕터 | Sonnet 4.5 | 0.64초 | 20초 | 빠름 😊 |
| 일반 챕터 | Haiku 3.5 | 0.36초 | 15초 | 빠름 😊 |

### After (Streaming + Caching)

| 작업 | 모델 | TTFT | 완료 시간 | 비용 절감 | 사용자 체감 |
|------|------|------|----------|----------|------------|
| 목차 생성 (첫 호출) | Haiku 3.5 | 0.36초 | 15초 | - | 빠름 😊 |
| 목차 생성 (캐시) | Haiku 3.5 | 0.2초 | 9초 | 90% | 매우 빠름 🚀 |
| 첫 챕터 (첫 호출) | Sonnet 4.5 | 0.64초 | 20초 | - | 빠름 😊 |
| 첫 챕터 (캐시) | Sonnet 4.5 | 0.3초 | 12초 | 90% | 매우 빠름 🚀 |

---

## 🎯 구현 우선순위

### Phase 1: Streaming API (즉시 구현 - 최대 효과)
- [ ] `generateWithClaude` 함수에 스트리밍 옵션 추가
- [ ] API Route를 ReadableStream으로 변경
- [ ] 클라이언트에서 스트림 처리 구현
- [ ] 로딩 UI를 실시간 타이핑 UI로 변경

**예상 작업 시간:** 2-3시간
**예상 효과:** 체감 속도 90% 개선

### Phase 2: Prompt Caching (고효율)
- [ ] 시스템 프롬프트에 cache_control 추가
- [ ] 캐시 히트율 모니터링 로직 추가
- [ ] 로그에 캐시 사용량 기록

**예상 작업 시간:** 1-2시간
**예상 효과:** 비용 90% + 속도 85% 개선

### Phase 3: 점진적 최적화
- [ ] max_tokens을 작업별로 세분화
- [ ] 프롬프트 길이 단축
- [ ] Temperature 최적화

**예상 작업 시간:** 1-2시간
**예상 효과:** 10-20% 추가 개선

---

## 🔍 모니터링 및 측정

### 성능 메트릭

```typescript
interface PerformanceMetrics {
  // 속도 관련
  ttft: number           // Time To First Token
  totalLatency: number   // 전체 응답 시간
  throughput: number     // tokens/second

  // 비용 관련
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number

  // 품질 관련
  stopReason: string
  modelUsed: string
}
```

### 로깅 개선

```typescript
logger.aiResponse('Chapter generation', {
  duration: `${duration}ms`,
  ttft: `${ttftMs}ms`,
  tokensUsed,
  cacheHit: !!usage.cache_read_input_tokens,
  cacheSavings: usage.cache_read_input_tokens * 0.9,
  model
})
```

---

## 📚 참고 자료

### 공식 문서
- [Anthropic - Reducing Latency](https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-latency)
- [Anthropic - Prompt Caching](https://docs.claude.com/en/docs/build-with-claude/prompt-caching)
- [Anthropic - Streaming Responses](https://docs.anthropic.com/en/api/streaming)

### 커뮤니티 리소스
- SigNoz - Claude API Latency Optimization Guide
- Medium - Best Practices for Maximizing Claude Code Performance
- AWS - Supercharge Development with Prompt Caching

### 벤치마크 데이터
- Claude Haiku 3.5: TTFT 0.36s, Throughput 52.54 t/s
- Claude Sonnet 4.5: TTFT 0.64s, Throughput 50.88 t/s

---

## 💡 추가 최적화 아이디어

### 1. Parallel Generation
여러 챕터를 동시에 생성 (API 레이트 리밋 주의)

```typescript
const chapters = await Promise.all([
  generateChapter(1),
  generateChapter(2),
  generateChapter(3)
])
```

### 2. Batch API (50% 비용 절감)
긴급하지 않은 작업은 Batch API 사용

```typescript
// 24시간 이내 처리, 50% 할인
const batchJob = await anthropic.batch.create({
  requests: multipleChapterRequests
})
```

### 3. Edge Computing
Vercel Edge Functions로 지역별 레이턴시 감소

---

**문서 버전:** 1.0
**최종 업데이트:** 2025-10-08
**작성자:** AI eBook Writer SaaS Team
