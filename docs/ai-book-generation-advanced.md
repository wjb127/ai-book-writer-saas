# AI 책 작성 기능 고도화 기획안

## 📋 목차
1. [목표 및 비전](#목표-및-비전)
2. [현재 상태 분석](#현재-상태-분석)
3. [아하 모먼트 정의](#아하-모먼트-정의)
4. [핵심 개선 사항](#핵심-개선-사항)
5. [상세 기능 명세](#상세-기능-명세)
6. [UX/UI 개선](#uxui-개선)
7. [기술 구현](#기술-구현)
8. [개발 우선순위](#개발-우선순위)

---

## 목표 및 비전

### 비전
**"5분 만에 완성도 80%의 전자책 초안을 받아보는 마법 같은 경험"**

### 아하 모먼트 목표
사용자가 처음 서비스를 사용할 때:
1. **3분 이내** 주제 입력 → 목차 생성 완료
2. **10분 이내** 첫 챕터 읽고 "이 정도면 쓸만한데?" 느낌
3. **30분 이내** 전체 책 초안 완성 후 "진짜 책이 만들어졌네!" 감동

### 성공 지표
- **Activation Rate**: 가입 후 첫 책 완성률 70% 이상
- **Time to First Book**: 평균 30분 이내
- **Quality Score**: 사용자 만족도 4.0/5.0 이상
- **Retention**: D7 리텐션 40% 이상

---

## 현재 상태 분석

### 강점 ✅
- [x] 기본적인 목차 생성 작동
- [x] 챕터별 내용 생성 가능
- [x] 마크다운 편집기 제공
- [x] PDF 내보내기 기능

### 약점 ❌
1. **생성 품질 불안정**
   - AI 응답이 매번 다름
   - 챕터 간 일관성 부족
   - 분량 조절 어려움

2. **사용자 컨트롤 부족**
   - 톤앤매너 조절 불가
   - 스타일 선택 없음
   - 타겟 독자 설정 불가

3. **피드백 루프 약함**
   - 마음에 안 들면 재생성밖에 없음
   - 부분 수정 어려움
   - 버전 관리 없음

4. **느린 생성 속도**
   - 챕터 하나씩 순차 생성
   - 전체 생성 시 5-10분 소요
   - 진행 상황 불명확

---

## 아하 모먼트 정의

### Moment 1: "와, 진짜 내 주제로 목차가 만들어졌다!"
**타이밍**: 주제 입력 후 30초
**경험**:
- 로딩 애니메이션과 함께 실시간으로 목차 항목이 하나씩 나타남
- 각 챕터마다 키포인트가 함께 표시되어 "오, 이거 포함되면 좋겠는데"라는 생각 확인
- 목차 구조가 논리적이고 체계적임을 직감

### Moment 2: "이 AI가 내 의도를 이해했네?"
**타이밍**: 첫 챕터 생성 후 1분
**경험**:
- 단순 정보 나열이 아닌, 스토리텔링이 있는 글
- 타겟 독자를 고려한 톤앤매너
- 예시와 비유가 적절하게 포함됨
- "내가 쓰고 싶었던 느낌이 이거야!"

### Moment 3: "와, 30분 만에 책 한 권이 만들어졌다!"
**타이밍**: 전체 책 생성 완료
**경험**:
- 진행 상황이 실시간으로 표시됨 (1/10 챕터 완료...)
- 완성된 책을 스크롤하며 읽는 재미
- PDF로 다운받아서 주변에 자랑하고 싶은 마음
- "이 정도면 80% 완성이고, 20%만 다듬으면 되겠다"

---

## 핵심 개선 사항

### 1. 스마트 설정 마법사 (Onboarding Wizard)

#### AS-IS (현재)
```
주제: [입력]
설명: [입력]
→ [생성하기 버튼]
```

#### TO-BE (개선)
```
Step 1: 어떤 책을 쓰고 싶으세요?
  주제: [입력]
  설명: [입력]

Step 2: 독자가 누구인가요? (선택)
  ○ 일반인 (쉽고 친근하게)
  ○ 전문가 (깊이 있고 정확하게)
  ○ 학생 (교육적이고 단계적으로)
  ○ 직장인 (실용적이고 간결하게)

Step 3: 어떤 스타일을 원하시나요?
  ○ 스토리텔링 (이야기 중심, 흥미진진하게)
  ○ 실용 가이드 (How-to 중심, 액션 아이템 포함)
  ○ 학술적 (데이터와 연구 기반)
  ○ 에세이 (개인적 경험과 생각 중심)

Step 4: 분량은 어느 정도가 좋을까요?
  ○ 가볍게 (5-7챕터, 각 1,000자) - 30분 완독
  ○ 적당히 (8-12챕터, 각 1,500자) - 1시간 완독
  ○ 깊이있게 (12-20챕터, 각 2,000자) - 2-3시간 완독

Step 5: 추가 요청사항 (선택)
  - 실제 사례 많이 포함해주세요
  - 챕터마다 실습 과제 넣어주세요
  - 인용문과 통계 자료 포함해주세요
  - [자유 입력]

→ [AI 책 생성 시작!]
```

#### 구현 데이터
```typescript
interface BookGenerationSettings {
  // 기본 정보
  topic: string;
  description: string;

  // 타겟 독자
  targetAudience: 'general' | 'professional' | 'student' | 'corporate';

  // 스타일
  writingStyle: 'storytelling' | 'practical' | 'academic' | 'essay';

  // 분량
  length: 'light' | 'medium' | 'deep';
  chapterCount: number; // 자동 계산
  wordsPerChapter: number; // 자동 계산

  // 톤앤매너
  tone: 'friendly' | 'professional' | 'casual' | 'formal';

  // 추가 요청
  includeExamples: boolean;
  includeExercises: boolean;
  includeStats: boolean;
  customInstructions?: string;

  // AI 모델 선택
  aiModel: 'gpt-4' | 'gpt-3.5' | 'claude-opus' | 'claude-sonnet';
}
```

---

### 2. 실시간 스트리밍 생성

#### AS-IS
```
[생성 중...] (5초 대기)
→ 전체 텍스트 한번에 표시
```

#### TO-BE
```
[제목이 먼저 나타남]
1장 서론
[텍스트가 타이핑되듯 나타남...]
여러분은 혹시 이런 고민을 해본 적 있나요?
...

[완료 후 자동으로 다음 챕터 생성]
2장 ...
```

#### 구현 방법
```typescript
// API Route: /api/generate-chapter-stream
export async function POST(req: Request) {
  const { bookId, chapterIndex, settings } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const openai = new OpenAI();

      const completion = await openai.chat.completions.create({
        model: settings.aiModel,
        messages: [/* 프롬프트 */],
        stream: true,
      });

      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

---

### 3. AI 편집 어시스턴트 (Chat-based Editing)

#### 기능
사용자가 챕터를 선택하고 채팅으로 수정 요청:

```
User: "이 부분 너무 어려워요. 좀 더 쉽게 설명해주세요"
AI: "네, 전문 용어를 줄이고 비유를 추가해서 다시 작성했습니다"
→ [해당 부분만 자동 수정]

User: "이 챕터에 실제 사례 2개 추가해줘"
AI: "다음 두 가지 사례를 추가했습니다:
     1. 스타벅스의 고객 경험 전략
     2. 애플의 제품 디자인 철학"
→ [사례 섹션 추가됨]

User: "전체적으로 더 친근한 말투로 바꿔줘"
AI: "존댓말을 반말로, 딱딱한 표현을 구어체로 변경했습니다"
→ [전체 톤 변경]
```

#### UI/UX
```
┌─────────────────────────────────────────────┐
│ 1장 서론                          [편집 모드] │
├─────────────────────────────────────────────┤
│                                             │
│ [챕터 내용 표시]                             │
│                                             │
│ 여러분은 혹시 이런 고민을...                 │
│                                             │
├─────────────────────────────────────────────┤
│ 💬 AI 편집 어시스턴트                        │
├─────────────────────────────────────────────┤
│ 이 챕터를 어떻게 수정할까요?                 │
│                                             │
│ [퀵 액션]                                   │
│ • 더 쉽게 설명해줘                           │
│ • 실제 사례 추가해줘                         │
│ • 분량 늘려줘 (1,500자 → 2,000자)           │
│ • 톤앤매너 변경 (친근하게/전문적으로)        │
│                                             │
│ [메시지 입력]                    [전송]      │
└─────────────────────────────────────────────┘
```

#### 구현
```typescript
// AI 편집 명령어 파싱
const parseEditCommand = (command: string, chapterContent: string) => {
  const patterns = {
    simplify: /쉽게|간단하게|이해하기 쉽게/,
    addExample: /사례|예시|예제.*추가/,
    expand: /늘려|확장|더 길게/,
    shorten: /줄여|축약|짧게/,
    changeTone: /말투|톤|분위기.*바꿔/,
  };

  if (patterns.simplify.test(command)) {
    return { action: 'simplify', target: 'content' };
  }
  if (patterns.addExample.test(command)) {
    const count = command.match(/(\d+)개/)?.[1] || '1';
    return { action: 'addExample', count: parseInt(count) };
  }
  // ... 더 많은 패턴

  return { action: 'custom', instruction: command };
};
```

---

### 4. 스마트 목차 조정

#### AS-IS
목차가 생성되면 수정 불가 (또는 전체 재생성)

#### TO-BE
```
생성된 목차:
1. 서론 [수정] [삭제]
2. 배경지식 [수정] [삭제]
3. 핵심 개념 [수정] [삭제]
   → [+ 하위 챕터 추가]
4. 실전 활용법 [수정] [삭제]
5. 결론 [수정] [삭제]

[+ 챕터 추가] [전체 재구성 요청]

각 챕터 [수정] 클릭 시:
┌─────────────────────────────────┐
│ 챕터 제목: [배경지식]            │
│ 주요 내용:                       │
│ • [키포인트 1]                   │
│ • [키포인트 2]                   │
│ • [+ 키포인트 추가]              │
│                                 │
│ [취소] [AI에게 개선 요청] [저장] │
└─────────────────────────────────┘
```

#### 드래그 앤 드롭 재정렬
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function OutlineEditor({ chapters, setChapters }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={chapters} strategy={verticalListSortingStrategy}>
        {chapters.map((chapter) => (
          <SortableChapterItem key={chapter.id} chapter={chapter} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

### 5. 병렬 생성 및 진행 상황 표시

#### AS-IS
순차 생성 (1 → 2 → 3 → ...)

#### TO-BE
병렬 생성 + 실시간 진행 표시

```
┌─────────────────────────────────────────────┐
│ 📖 책 생성 중... (예상 시간: 3분 30초)        │
├─────────────────────────────────────────────┤
│                                             │
│ ✅ 목차 생성 완료                            │
│ ✅ 1장 서론 [1,234자] ━━━━━━━━━━━━ 100%    │
│ ⏳ 2장 배경지식 [234자...] ━━━━━━━─── 60%  │
│ ⏳ 3장 핵심 개념 [12자...] ━━───────── 20% │
│ ⏸️  4장 실전 활용법 (대기 중)               │
│ ⏸️  5장 결론 (대기 중)                      │
│                                             │
│ 현재: 2개 챕터 동시 생성 중                  │
│ 완료: 1 / 5 챕터                            │
│                                             │
│ [일시정지] [완료된 챕터 먼저 보기]           │
└─────────────────────────────────────────────┘
```

#### 구현 (큐 시스템)
```typescript
// lib/queue/book-generation-queue.ts
import { Queue } from 'bullmq'; // 또는 Inngest

interface GenerationJob {
  bookId: string;
  chapterId: string;
  chapterIndex: number;
  settings: BookGenerationSettings;
}

class BookGenerationQueue {
  private queue: Queue;

  async addBookGeneration(bookId: string, chapters: Chapter[], settings: BookGenerationSettings) {
    // 병렬 생성 작업 추가 (최대 3개 동시 실행)
    const jobs = chapters.map((chapter, index) => ({
      name: 'generate-chapter',
      data: {
        bookId,
        chapterId: chapter.id,
        chapterIndex: index,
        settings,
      },
      opts: {
        priority: index, // 순서대로 우선순위 부여
      }
    }));

    await this.queue.addBulk(jobs);
  }

  async getProgress(bookId: string) {
    const jobs = await this.queue.getJobs(['active', 'completed', 'waiting']);
    const bookJobs = jobs.filter(j => j.data.bookId === bookId);

    return {
      total: bookJobs.length,
      completed: bookJobs.filter(j => j.finishedOn).length,
      active: bookJobs.filter(j => !j.finishedOn && j.processedOn).length,
      waiting: bookJobs.filter(j => !j.processedOn).length,
    };
  }
}
```

#### 실시간 진행 상황 (WebSocket or SSE)
```typescript
// app/api/generation/[bookId]/progress/route.ts
export async function GET(req: Request, { params }: { params: { bookId: string } }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        const progress = await bookGenerationQueue.getProgress(params.bookId);
        const data = `data: ${JSON.stringify(progress)}\n\n`;
        controller.enqueue(encoder.encode(data));

        if (progress.completed === progress.total) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  });
}
```

---

### 6. AI 프롬프트 엔지니어링 고도화

#### 현재 프롬프트 (단순)
```typescript
const prompt = `다음 주제로 책의 ${chapterTitle} 챕터를 작성해주세요.

주제: ${topic}
설명: ${description}
챕터 제목: ${chapterTitle}
키포인트: ${keyPoints.join(', ')}

한글로 작성하고, 1000-1500자 분량으로 작성해주세요.`;
```

#### 개선 프롬프트 (구조화)
```typescript
const generateAdvancedPrompt = (settings: BookGenerationSettings, chapter: Chapter) => {
  const { targetAudience, writingStyle, tone, includeExamples } = settings;

  // 독자 페르소나
  const audienceContext = {
    general: "일반 독자를 위해 쉽고 친근한 언어를 사용하세요. 전문 용어는 피하고, 일상적인 비유를 활용하세요.",
    professional: "전문가를 위해 정확하고 깊이 있는 내용을 작성하세요. 최신 연구와 데이터를 인용하세요.",
    student: "학습자를 위해 단계적이고 명확하게 설명하세요. 각 개념 후 요약을 추가하세요.",
    corporate: "직장인을 위해 실용적이고 액션 가능한 내용을 작성하세요. 시간 효율적으로 읽을 수 있게 하세요.",
  }[targetAudience];

  // 스타일 가이드
  const styleGuide = {
    storytelling: `
      - 흥미로운 일화나 이야기로 시작하세요
      - 주인공의 여정처럼 전개하세요
      - 갈등과 해결 구조를 활용하세요
      - 감정적 연결을 만드세요
    `,
    practical: `
      - 명확한 단계별 가이드를 제공하세요
      - 각 섹션마다 실행 가능한 액션 아이템을 포함하세요
      - 체크리스트나 템플릿을 활용하세요
      - "어떻게"에 초점을 맞추세요
    `,
    academic: `
      - 논문 스타일로 작성하세요
      - 주장에 대한 근거를 명확히 하세요
      - 인용과 참고문헌을 포함하세요
      - 객관적이고 중립적인 톤을 유지하세요
    `,
    essay: `
      - 개인적 경험과 생각을 녹여내세요
      - 성찰적이고 사색적인 톤을 사용하세요
      - 은유와 비유를 풍부하게 활용하세요
      - 독자에게 질문을 던지세요
    `,
  }[writingStyle];

  // 구조 템플릿
  const structure = `
## ${chapter.title}

### 도입 (Opening Hook)
[독자의 관심을 끄는 질문, 일화, 또는 놀라운 사실로 시작]

### 본론 (Main Content)
${chapter.keyPoints.map((point, i) => `
#### ${i + 1}. ${point}
[핵심 내용 설명]
${includeExamples ? '[실제 사례나 예시]' : ''}
`).join('\n')}

### 요약 (Key Takeaways)
[이 챕터의 핵심 메시지 3-5개 요약]

${settings.includeExercises ? '### 실습 과제\n[독자가 직접 해볼 수 있는 활동]' : ''}
  `;

  return `당신은 베스트셀러 작가입니다. 다음 지침에 따라 책의 챕터를 작성해주세요.

<context>
책 주제: ${settings.topic}
책 설명: ${settings.description}
타겟 독자: ${targetAudience}
글쓰기 스타일: ${writingStyle}
톤: ${tone}
</context>

<audience>
${audienceContext}
</audience>

<style>
${styleGuide}
</style>

<structure>
${structure}
</structure>

<requirements>
- 분량: ${settings.wordsPerChapter}자 내외 (±10%)
- 언어: 한글 (존댓말 사용)
- 문단: 3-5개의 명확한 섹션으로 구분
- 가독성: 한 문장은 50자 이내, 한 문단은 200자 이내
${includeExamples ? '- 실제 사례를 최소 2개 포함하세요' : ''}
${settings.includeStats ? '- 통계나 데이터를 인용하세요 (출처 명시)' : ''}
</requirements>

<previous_chapters>
${chapter.order_index > 0 ? `이전 챕터 요약: ${chapter.previousSummary}` : '이것은 첫 챕터입니다.'}
</previous_chapters>

위 지침을 모두 고려하여, "${chapter.title}" 챕터를 작성해주세요.`;
};
```

#### Few-shot Learning (예시 제공)
```typescript
const fewShotExamples = `
다음은 좋은 예시입니다:

<example>
## 1장 왜 당신은 글을 써야 하는가

당신은 하루에 몇 개의 문장을 쓰나요? 카카오톡 메시지, 이메일, 보고서...
아마 생각보다 훨씬 많을 겁니다. 우리는 이미 매일 글을 쓰고 있습니다.
하지만 정작 "글을 쓴다"고 하면 어렵게 느껴지는 이유는 뭘까요?

### 글쓰기는 생각 정리의 도구입니다

스티브 잡스는 "명확하게 쓸 수 없다면, 명확하게 생각하지 못하는 것"이라고 말했습니다.
글을 쓰는 과정에서 우리는...
[계속]
</example>

이런 스타일로 작성해주세요.
`;
```

---

### 7. 표지 디자인 자동 생성

#### 기능
책 제목과 주제를 바탕으로 AI가 표지 디자인 생성

```
┌─────────────────────────────────────────────┐
│ 📚 표지 디자인 생성                          │
├─────────────────────────────────────────────┤
│                                             │
│ [미리보기 1]  [미리보기 2]  [미리보기 3]     │
│  Modern       Vintage      Minimalist       │
│                                             │
│ 스타일 선택:                                 │
│ ○ 모던   ○ 빈티지   ○ 미니멀  ○ 일러스트    │
│                                             │
│ 색상 테마:                                   │
│ ○ 블루   ○ 그린   ○ 골드   ○ 레드          │
│                                             │
│ [AI에게 직접 요청하기]                       │
│ 예: "숲 속 풍경이 들어간 차분한 느낌"         │
│                                             │
│ [다시 생성] [이 표지 사용하기]               │
└─────────────────────────────────────────────┘
```

#### 구현 (DALL-E 또는 Stable Diffusion)
```typescript
// lib/ai/cover-generator.ts
import OpenAI from 'openai';

export async function generateBookCover(
  title: string,
  genre: string,
  style: 'modern' | 'vintage' | 'minimalist' | 'illustration'
) {
  const openai = new OpenAI();

  const stylePrompts = {
    modern: 'modern, clean, bold typography, gradient colors, professional',
    vintage: 'vintage, retro, textured paper, classic fonts, warm tones',
    minimalist: 'minimalist, simple, lots of white space, elegant, subtle',
    illustration: 'illustrated, artistic, hand-drawn elements, creative, colorful',
  };

  const prompt = `
    Book cover design for "${title}".
    Genre: ${genre}.
    Style: ${stylePrompts[style]}.
    High quality, professional, suitable for e-book.
    Aspect ratio 2:3 (portrait).
    No text on the cover (text will be added separately).
  `;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1792', // 2:3 비율
    quality: 'hd',
    n: 1,
  });

  return response.data[0].url;
}

// 표지에 텍스트 오버레이 (Canvas API)
export async function addTextToCover(
  imageUrl: string,
  title: string,
  author: string
) {
  // Next.js API Route에서 실행
  const canvas = createCanvas(1024, 1792);
  const ctx = canvas.getContext('2d');

  // 배경 이미지 로드
  const image = await loadImage(imageUrl);
  ctx.drawImage(image, 0, 0);

  // 제목 추가
  ctx.font = 'bold 80px Noto Sans KR';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(title, 512, 400);

  // 저자 추가
  ctx.font = '40px Noto Sans KR';
  ctx.fillText(author, 512, 1600);

  return canvas.toBuffer('image/png');
}
```

---

### 8. 다국어 번역 원클릭

#### 기능
```
┌─────────────────────────────────────────────┐
│ 🌐 책 번역하기                               │
├─────────────────────────────────────────────┤
│                                             │
│ 현재 언어: 한국어                            │
│                                             │
│ 번역할 언어 선택:                            │
│ ☐ 영어 (English)                            │
│ ☐ 일본어 (日本語)                           │
│ ☐ 중국어 간체 (简体中文)                    │
│ ☐ 스페인어 (Español)                        │
│                                             │
│ 번역 스타일:                                 │
│ ○ 직역 (정확하고 문자 그대로)                │
│ ○ 의역 (자연스럽고 현지화)                   │
│                                             │
│ 예상 크레딧: 50 크레딧                       │
│ 예상 시간: 2분                               │
│                                             │
│ [번역 시작]                                  │
└─────────────────────────────────────────────┘
```

#### 구현
```typescript
// API: /api/translate-book
export async function POST(req: Request) {
  const { bookId, targetLanguages, style } = await req.json();

  const book = await getBook(bookId);
  const chapters = await getChapters(bookId);

  // 각 언어별로 번역 작업 생성
  for (const lang of targetLanguages) {
    const translatedBookId = await createTranslatedBook(book, lang);

    // 병렬로 챕터 번역
    await Promise.all(
      chapters.map(chapter =>
        translateChapter(chapter, lang, style, translatedBookId)
      )
    );
  }

  return NextResponse.json({ success: true });
}

async function translateChapter(
  chapter: Chapter,
  targetLang: string,
  style: 'literal' | 'localized',
  translatedBookId: string
) {
  const openai = new OpenAI();

  const systemPrompt = style === 'literal'
    ? `You are a professional translator. Translate the following text to ${targetLang} accurately, preserving the original meaning and tone.`
    : `You are a localization expert. Adapt the following text to ${targetLang}, making it natural and culturally appropriate for native speakers.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: chapter.content }
    ],
    temperature: 0.3, // 일관성을 위해 낮게
  });

  await saveTranslatedChapter({
    book_id: translatedBookId,
    order_index: chapter.order_index,
    title: await translateText(chapter.title, targetLang),
    content: response.choices[0].message.content,
  });
}
```

---

### 9. 버전 관리 및 비교

#### 기능
```
┌─────────────────────────────────────────────┐
│ 📝 버전 히스토리                             │
├─────────────────────────────────────────────┤
│                                             │
│ ● v1.3 (현재) - 2시간 전                    │
│   "2장과 3장 내용 보강"                      │
│   [보기] [복원]                              │
│                                             │
│ ○ v1.2 - 5시간 전                           │
│   "AI 편집: 톤앤매너 친근하게 변경"          │
│   [보기] [복원] [v1.3과 비교]                │
│                                             │
│ ○ v1.1 - 1일 전                             │
│   "초기 AI 생성 완료"                        │
│   [보기] [복원] [v1.3과 비교]                │
│                                             │
│ ○ v1.0 - 1일 전                             │
│   "목차 생성"                                │
│   [보기] [복원]                              │
└─────────────────────────────────────────────┘

[v1.3과 비교] 클릭 시:
┌─────────────────────────────────────────────┐
│ v1.2 (왼쪽)           v1.3 (오른쪽)          │
├─────────────────────────────────────────────┤
│ 안녕하세요.          │ 안녕!                 │
│ 이 책에서는...      │ 이 책에서는...        │
│ [삭제된 부분]        │ [추가된 실제 사례]    │
└─────────────────────────────────────────────┘
```

#### 자동 저장
```typescript
// 3초마다 자동 저장
useEffect(() => {
  const interval = setInterval(async () => {
    if (hasUnsavedChanges) {
      await autoSaveBook(bookId, chapters);
      setHasUnsavedChanges(false);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [bookId, chapters, hasUnsavedChanges]);

// 주요 변경 시 버전 생성
async function createVersion(bookId: string, description: string) {
  const book = await getBook(bookId);
  const chapters = await getChapters(bookId);

  const versionNumber = (await getLatestVersion(bookId))?.version_number + 1 || 1;

  await db.book_versions.create({
    book_id: bookId,
    version_number: versionNumber,
    snapshot: {
      book,
      chapters,
    },
    description,
    created_by: userId,
  });
}
```

---

## UX/UI 개선

### 전체 생성 플로우

```
[랜딩]
  ↓
[시작하기] → [로그인/가입]
  ↓
[설정 마법사 Step 1-5] (신규)
  ↓
[목차 생성 중...] (실시간 스트리밍)
  ↓
[목차 확인 및 수정] (드래그앤드롭)
  ↓
[전체 생성 시작]
  ↓
[진행 상황 대시보드] (병렬 생성)
  ↓
[완성! 미리보기]
  ↓
[편집 모드] (AI 어시스턴트)
  ↓
[표지 디자인 생성]
  ↓
[다운로드 / 저장 / 공유]
```

### 반응형 디자인
- **데스크톱**: 좌측 목차, 우측 편집기, 하단 AI 어시스턴트
- **태블릿**: 탭으로 전환 (목차 ↔ 편집기 ↔ 어시스턴트)
- **모바일**: 풀스크린 편집, 하단 플로팅 버튼으로 기능 접근

---

## 개발 우선순위

### 🔥 Phase 1: 아하 모먼트 핵심 (2주)
1. ✅ 설정 마법사 (5-step wizard)
2. ✅ 실시간 스트리밍 생성 (SSE)
3. ✅ 진행 상황 표시 (progress bar)
4. ✅ 프롬프트 엔지니어링 고도화

**목표**: 사용자가 "와, 이거 진짜 좋다!"를 느끼게

### 🚀 Phase 2: 편집 경험 (2주)
1. ✅ AI 편집 어시스턴트 (chat-based)
2. ✅ 스마트 목차 조정 (드래그앤드롭)
3. ✅ 자동 저장 및 버전 관리
4. ✅ 병렬 생성 (큐 시스템)

**목표**: 편집이 즐겁고 쉽게

### 🎨 Phase 3: 비주얼 완성도 (1주)
1. ✅ 표지 디자인 생성
2. ✅ PDF/EPUB 고품질 내보내기
3. ✅ 다크 모드
4. ✅ 애니메이션 및 트랜지션

**목표**: 프로페셔널한 느낌

### 🌐 Phase 4: 추가 가치 (1주)
1. ✅ 다국어 번역
2. ✅ 음성 읽기 (TTS)
3. ✅ 협업 기능 기초
4. ✅ 템플릿 라이브러리

---

## 성공 메트릭

### 정량 지표
- **Time to First Chapter**: 평균 2분 이내
- **Completion Rate**: 목차 생성 → 전체 완성 70% 이상
- **Edit Rate**: 생성 후 편집하는 사용자 80% 이상
- **Satisfaction Score**: 4.0/5.0 이상

### 정성 피드백
- "AI가 내 의도를 이해했다"
- "생각보다 퀄리티가 좋다"
- "편집하기 편하다"
- "친구에게 추천하고 싶다"

---

## 다음 단계

### 이번 주
1. [ ] 설정 마법사 UI 컴포넌트 작성
2. [ ] SSE 기반 스트리밍 API 구현
3. [ ] 프롬프트 템플릿 작성 및 테스트

### 다음 주
1. [ ] AI 편집 어시스턴트 프로토타입
2. [ ] 병렬 생성 큐 시스템 구축
3. [ ] 실제 사용자 5명 베타 테스트

### 이번 달 목표
- Phase 1-2 완료
- 베타 테스터 50명 확보
- 아하 모먼트 달성률 60% 이상

---

**"첫 30분이 모든 것을 결정한다. 그 30분을 마법으로 만들자."** ✨
