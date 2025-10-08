# AI Book Writer SaaS - MVP 테스트 구현안

## 개요
이 문서는 구글 애즈 테스트를 위한 MVP 버전 구현 계획을 제시합니다.
사용자 인증/기능은 비활성화하고, 데모 + 리드 수집에 집중합니다.

---

## 📋 MVP 구현 단계

### Phase 1: 랜딩 페이지 개선 (우선순위: 높음)
### Phase 2: 데모 기능 강화 (우선순위: 높음)
### Phase 3: 리드 수집 시스템 (우선순위: 높음)
### Phase 4: 대시보드 (우선순위: 중간)
### Phase 5: 사용자 기능 비활성화 (우선순위: 높음)

---

## Phase 1: 랜딩 페이지 개선

### 목표
- 전환율 최적화
- 명확한 가치 제안 (Value Proposition)
- CTA (Call-to-Action) 강화

### 구현 내용

#### 1.1 히어로 섹션 강화
```tsx
// src/app/page.tsx 개선

<HeroSection>
  {/* 헤드라인 - 문제 해결 중심 */}
  <h1>
    전자책 쓰는데 <span className="text-primary">몇 달</span>씩 걸리나요?
    <br />
    <span className="text-primary">AI가 5분</span>만에 만들어드립니다
  </h1>

  {/* 서브헤드라인 - 구체적 혜택 */}
  <p>
    블로그 전문가, 강사, 마케터를 위한 최고의 AI 전자책 생성 도구
    <br />
    아이디어만 있으면 됩니다. 나머지는 AI가 알아서!
  </p>

  {/* 소셜 프루프 */}
  <div className="social-proof">
    ⭐⭐⭐⭐⭐ 베타 사용자 98% 만족도
    📚 지금까지 1,234권의 전자책 생성
  </div>

  {/* 메인 CTA */}
  <div className="cta-buttons">
    <Button size="lg" onClick={scrollToDemo}>
      🚀 무료로 5분만에 체험하기
    </Button>
    <Button size="lg" variant="outline" onClick={scrollToWaitlist}>
      📧 출시 알림 신청 (사은품 증정)
    </Button>
  </div>
</HeroSection>
```

#### 1.2 문제-해결 섹션 추가
```tsx
<ProblemSolutionSection>
  <div className="problems">
    <h2>😰 이런 고민 있으셨죠?</h2>
    <ul>
      <li>❌ 전자책 쓸 시간이 없어요 (직장인/프리랜서)</li>
      <li>❌ 어떻게 시작해야 할지 모르겠어요</li>
      <li>❌ 글 쓰는게 너무 어려워요</li>
      <li>❌ 외주 맡기면 비용이 너무 비싸요 (100만원+)</li>
    </ul>
  </div>

  <div className="solutions">
    <h2>✨ AI Book Writer가 해결합니다</h2>
    <ul>
      <li>✅ 5분 만에 완성된 전자책 초안</li>
      <li>✅ AI가 목차부터 내용까지 자동 생성</li>
      <li>✅ 간단한 편집만으로 완성</li>
      <li>✅ 월 ₩9,900부터 (커피 3잔 가격)</li>
    </ul>
  </div>
</ProblemSolutionSection>
```

#### 1.3 데모 영상/GIF 추가
```tsx
<DemoVideoSection>
  <h2>📹 실제 작동 화면을 확인해보세요</h2>

  {/* Loom 또는 직접 녹화한 데모 영상 */}
  <video
    src="/demo-video.mp4"
    autoPlay
    loop
    muted
    className="demo-video"
  />

  {/* 또는 애니메이션 GIF */}
  <img src="/demo.gif" alt="AI Book Writer 데모" />
</DemoVideoSection>
```

#### 1.4 FAQ 섹션
```tsx
<FAQSection>
  <h2>자주 묻는 질문</h2>
  <Accordion>
    <AccordionItem value="q1">
      <AccordionTrigger>정말 5분만에 만들 수 있나요?</AccordionTrigger>
      <AccordionContent>
        네! 주제와 간단한 설명만 입력하면 AI가 자동으로 목차와
        내용을 생성합니다. 평균 5-10분이면 초안이 완성됩니다.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="q2">
      <AccordionTrigger>어떤 분야의 책을 만들 수 있나요?</AccordionTrigger>
      <AccordionContent>
        비즈니스, 자기계발, 마케팅, 교육, 취미 등 거의 모든 분야가
        가능합니다. AI가 전문적인 내용을 생성해드립니다.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="q3">
      <AccordionTrigger>무료 체험은 어떻게 하나요?</AccordionTrigger>
      <AccordionContent>
        아래 데모 섹션에서 바로 체험하실 수 있습니다.
        회원가입 없이 즉시 테스트 가능합니다!
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</FAQSection>
```

---

## Phase 2: 데모 기능 강화

### 목표
- 사용자가 실제 가치를 체험할 수 있도록
- 전환 유도

### 구현 내용

#### 2.1 데모 페이지 개선
```typescript
// src/app/demo/page.tsx 개선

// 1. 제한사항 명확히 표시
<DemoLimitations>
  <Alert>
    <Sparkles className="h-4 w-4" />
    <AlertTitle>무료 체험 버전</AlertTitle>
    <AlertDescription>
      • 챕터 3개까지 생성 가능
      <br />
      • 내보내기 기능은 유료 버전에서 제공
      <br />
      💡 전체 기능을 사용하려면 출시 알림을 신청하세요!
    </AlertDescription>
  </Alert>
</DemoLimitations>

// 2. 생성 완료 후 CTA
<AfterGenerationCTA>
  {generatedChapters.size >= 3 && (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>🎉 데모를 체험해보셨네요!</CardTitle>
        <CardDescription>
          전체 기능으로 실제 전자책을 만들어보시겠어요?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowWaitlistModal(true)}
          >
            출시 알림 신청하고 조기 할인 받기
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            선착순 100명 50% 할인 + 평생 무료 업데이트
          </p>
        </div>
      </CardContent>
    </Card>
  )}
</AfterGenerationCTA>
```

#### 2.2 예시 주제 추가
```typescript
// 인기 있는 예시를 더 추가
const demoExamples = [
  {
    topic: "ChatGPT로 블로그 수익 10배 늘리기",
    description: "AI 도구를 활용한 콘텐츠 마케팅 전략...",
    category: "💼 비즈니스"
  },
  {
    topic: "초보자를 위한 주식 투자 가이드",
    description: "기초부터 실전까지 단계별 투자 전략...",
    category: "💰 재테크"
  },
  {
    topic: "30일 만에 영어 회화 마스터하기",
    description: "직장인을 위한 실전 영어 학습법...",
    category: "📚 교육"
  },
  {
    topic: "인스타그램으로 월 300만원 벌기",
    description: "제로부터 인플루언서로 성장하는 법...",
    category: "📱 SNS 마케팅"
  }
]
```

---

## Phase 3: 리드 수집 시스템

### 목표
- 이메일 리스트 구축
- 출시 알림 자동화
- 전환율 추적

### 3.1 데이터베이스 스키마

```sql
-- Waitlist 테이블 (가장 간단한 버전)
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 기본 정보
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- 추가 정보 (선택)
  use_case TEXT, -- 어떤 용도로 사용할 건지
  book_topic TEXT, -- 만들고 싶은 책 주제
  referred_from TEXT, -- 유입 경로 (google_ads, instagram, etc)

  -- UTM 파라미터 (광고 추적용)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'converted')),

  -- 사은품/혜택
  early_bird_discount BOOLEAN DEFAULT TRUE, -- 조기 할인 대상
  gift_sent BOOLEAN DEFAULT FALSE, -- 사은품 발송 여부

  -- 메타데이터
  ip_address INET,
  user_agent TEXT,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_utm_source ON public.waitlist(utm_source);

-- RLS 정책 (공개 테이블이지만 쓰기만 허용)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert to waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- 관리자만 조회 가능 (대시보드용)
CREATE POLICY "Only admins can view waitlist"
  ON public.waitlist FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'your-admin@email.com',
      'another-admin@email.com'
    )
  );
```

### 3.2 Waitlist API

```typescript
// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 서비스 키 사용
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, useCase, bookTopic } = body

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일을 입력해주세요' },
        { status: 400 }
      )
    }

    // UTM 파라미터 추출
    const utmSource = request.nextUrl.searchParams.get('utm_source')
    const utmMedium = request.nextUrl.searchParams.get('utm_medium')
    const utmCampaign = request.nextUrl.searchParams.get('utm_campaign')

    // IP 주소 추출
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    // Supabase에 저장
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        full_name: fullName,
        use_case: useCase,
        book_topic: bookTopic,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single()

    if (error) {
      // 이미 등록된 이메일인 경우
      if (error.code === '23505') {
        return NextResponse.json(
          { message: '이미 등록된 이메일입니다' },
          { status: 200 }
        )
      }
      throw error
    }

    // 웰컴 이메일 발송 (선택사항)
    await sendWelcomeEmail(email, fullName)

    // 슬랙/디스코드 알림 (선택사항)
    await notifyNewSignup(email, useCase)

    return NextResponse.json({
      success: true,
      message: '신청이 완료되었습니다! 곧 연락드리겠습니다.',
      data
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: '등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 통계 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { data: stats } = await supabase
      .from('waitlist')
      .select('status, utm_source, created_at')

    // 통계 계산
    const totalSignups = stats?.length || 0
    const todaySignups = stats?.filter(s =>
      new Date(s.created_at).toDateString() === new Date().toDateString()
    ).length || 0

    const bySource = stats?.reduce((acc, curr) => {
      acc[curr.utm_source || 'direct'] = (acc[curr.utm_source || 'direct'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalSignups,
      todaySignups,
      bySource
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### 3.3 Waitlist 컴포넌트

```typescript
// src/components/WaitlistForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [useCase, setUseCase] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          useCase
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast.success('🎉 신청 완료! 이메일을 확인해주세요.')

        // Google Analytics 이벤트
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'waitlist_signup', {
            event_category: 'engagement',
            event_label: email
          })
        }
      } else {
        toast.error(data.error || '오류가 발생했습니다')
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">🎉 신청 완료!</h3>
        <p className="mb-4">
          <strong>{email}</strong>로 확인 메일을 보내드렸습니다.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✅ 출시 알림을 제일 먼저 받으실 수 있어요</p>
          <p>✅ 선착순 50% 조기 할인 혜택</p>
          <p>✅ 평생 무료 업데이트</p>
          <p>✅ 특별 사은품 증정</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Input
          type="email"
          placeholder="이메일 주소*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Input
          type="text"
          placeholder="이름"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div>
        <Textarea
          placeholder="어떤 전자책을 만들고 싶으신가요? (선택)"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? '등록 중...' : '🚀 출시 알림 신청하기'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        선착순 100명 한정 특별 혜택 제공
      </p>
    </form>
  )
}
```

### 3.4 팝업/모달 전략

```typescript
// src/components/WaitlistModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WaitlistForm } from './WaitlistForm'

export function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Exit Intent (마우스가 화면 위로 올라갈 때)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem('waitlist_shown')) {
        setIsOpen(true)
        localStorage.setItem('waitlist_shown', 'true')
      }
    }

    // 30초 후 자동으로 표시
    const timeout = setTimeout(() => {
      if (!localStorage.getItem('waitlist_shown')) {
        setIsOpen(true)
        localStorage.setItem('waitlist_shown', 'true')
      }
    }, 30000)

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🎁 특별 혜택을 놓치지 마세요!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            출시 알림을 신청하시면:
          </p>
          <ul className="text-sm space-y-2">
            <li>✅ 선착순 50% 할인 (₩19,900 → ₩9,900)</li>
            <li>✅ 평생 무료 업데이트 보장</li>
            <li>✅ 프리미엄 템플릿 무료 제공</li>
            <li>✅ 1:1 사용법 가이드</li>
          </ul>
          <WaitlistForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Phase 4: 관리자 대시보드

### 4.1 대시보드 레이아웃

```typescript
// src/app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, BarChart } from '@/components/ui/charts'

interface DashboardStats {
  totalSignups: number
  todaySignups: number
  weeklySignups: number
  bySource: Record<string, number>
  conversionRate: number
  recentSignups: Array<{
    email: string
    fullName: string
    useCase: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">📊 대시보드</h1>

      {/* KPI 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">총 가입자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSignups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">오늘 가입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +{stats?.todaySignups}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">이번 주</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              +{stats?.weeklySignups}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">전환율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats?.conversionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 유입 경로 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>유입 경로</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats?.bySource || {}).map(([source, count]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-sm">{source}</span>
                  <span className="font-bold">{count}명</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>일별 가입 추이</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 차트 라이브러리 사용 (recharts 등) */}
            <div className="h-64">
              {/* <LineChart data={dailySignups} /> */}
              차트 영역
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 가입자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 가입자</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentSignups.map((signup) => (
              <div key={signup.email} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{signup.fullName || signup.email}</div>
                    <div className="text-sm text-muted-foreground">{signup.email}</div>
                    {signup.useCase && (
                      <div className="text-sm mt-1">{signup.useCase}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(signup.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 내보내기 버튼 */}
      <div className="mt-8">
        <Button onClick={exportToCSV}>
          📥 CSV로 내보내기
        </Button>
      </div>
    </div>
  )
}

function exportToCSV() {
  // CSV 내보내기 로직
  window.location.href = '/api/admin/export-csv'
}
```

### 4.2 관리자 인증

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAILS = [
  'your-email@example.com',
  'another-admin@example.com'
]

export async function middleware(req: NextRequest) {
  // /admin 경로만 보호
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 로그인 안 되어 있으면
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // 관리자가 아니면
    if (!ADMIN_EMAILS.includes(session.user.email || '')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

---

## Phase 5: 사용자 기능 비활성화

### 5.1 기능별 비활성화 전략

```typescript
// src/lib/feature-flags.ts
export const FEATURES = {
  // MVP 테스트 중에는 false
  AUTH_ENABLED: false,
  USER_DASHBOARD: false,
  SAVE_TO_DATABASE: false,
  EXPORT_ENABLED: false,
  PAYMENT_ENABLED: false,

  // 활성화된 기능
  DEMO_ENABLED: true,
  WAITLIST_ENABLED: true,
  ANALYTICS_ENABLED: true,
} as const

// 환경 변수로도 제어 가능
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  // 환경 변수 우선
  const envValue = process.env[`NEXT_PUBLIC_FEATURE_${feature}`]
  if (envValue !== undefined) {
    return envValue === 'true'
  }

  return FEATURES[feature]
}
```

### 5.2 UI에서 기능 숨기기

```typescript
// src/app/page.tsx
import { isFeatureEnabled } from '@/lib/feature-flags'

export default function HomePage() {
  return (
    <>
      {/* 데모는 항상 표시 */}
      <DemoSection />

      {/* 회원가입은 숨김 */}
      {isFeatureEnabled('AUTH_ENABLED') && (
        <SignUpSection />
      )}

      {/* 대신 Waitlist 표시 */}
      {isFeatureEnabled('WAITLIST_ENABLED') && (
        <WaitlistSection />
      )}
    </>
  )
}
```

### 5.3 Navigation 수정

```typescript
// src/components/Navigation.tsx
export function Navigation() {
  return (
    <nav>
      <Link href="/">홈</Link>
      <Link href="/demo">데모</Link>

      {/* MVP 중에는 숨김 */}
      {isFeatureEnabled('AUTH_ENABLED') ? (
        <>
          <Link href="/login">로그인</Link>
          <Link href="/signup">회원가입</Link>
        </>
      ) : (
        <Button onClick={() => scrollToWaitlist()}>
          출시 알림 신청
        </Button>
      )}
    </nav>
  )
}
```

---

## 구글 애즈 추적 설정

### GA4 + Google Ads 연동

```typescript
// src/app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');

            // Google Ads 전환 추적
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 전환 이벤트 추적

```typescript
// src/lib/analytics.ts
export const trackEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params)
  }
}

// 주요 이벤트들
export const events = {
  demoStarted: () => trackEvent('demo_started'),
  demoCompleted: () => trackEvent('demo_completed'),

  waitlistSignup: (email: string) => trackEvent('waitlist_signup', {
    event_category: 'conversion',
    event_label: email
  }),

  chapterGenerated: (chapterNumber: number) => trackEvent('chapter_generated', {
    chapter_number: chapterNumber
  }),
}
```

---

## 배포 체크리스트

### 배포 전 필수 작업

- [ ] Supabase 프로젝트 생성 및 테이블 생성
- [ ] 환경 변수 설정 (.env.production)
- [ ] Google Analytics 4 설정
- [ ] Google Ads 전환 추적 설정
- [ ] 도메인 연결 및 SSL 인증서
- [ ] OG 이미지 및 메타 태그 최적화
- [ ] 모바일 반응형 테스트
- [ ] 페이지 로딩 속도 최적화
- [ ] 에러 모니터링 (Sentry 등)

### 환경 변수 (.env.production)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs (데모용)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX

# Feature Flags
NEXT_PUBLIC_FEATURE_AUTH_ENABLED=false
NEXT_PUBLIC_FEATURE_WAITLIST_ENABLED=true

# Admin
ADMIN_EMAILS=your@email.com,another@email.com
```

---

## 광고 캠페인 구조

### 1. 구글 애즈 키워드

**High Intent (높은 구매 의도)**
- "전자책 만들기"
- "ai 전자책 생성"
- "전자책 제작 서비스"
- "ebook 작성 도구"

**Problem Aware (문제 인식)**
- "전자책 쓰는 법"
- "빨리 책 쓰는 방법"
- "전자책 외주 비용"

**Solution Aware (솔루션 인식)**
- "ai 글쓰기 도구"
- "자동 콘텐츠 생성"
- "chatgpt 전자책"

### 2. 랜딩 페이지 A/B 테스트

**버전 A: 속도 강조**
- 헤드라인: "5분 만에 전자책 완성"
- CTA: "지금 바로 무료 체험"

**버전 B: 비용 강조**
- 헤드라인: "외주 비용 1/100로 전자책 만들기"
- CTA: "100만원 절약하기"

**버전 C: 결과 강조**
- 헤드라인: "이미 1,234명이 전자책 출간에 성공했습니다"
- CTA: "나도 작가되기"

---

## 예상 타임라인

### Week 1: 기반 작업
- ✅ 랜딩 페이지 개선
- ✅ 데모 기능 강화
- ✅ Supabase 설정

### Week 2: 리드 수집
- ✅ Waitlist 시스템 구현
- ✅ 대시보드 개발
- ✅ 이메일 자동화

### Week 3: 최적화
- ✅ 페이지 속도 최적화
- ✅ SEO 최적화
- ✅ 모바일 UX 개선

### Week 4: 광고 캠페인
- ✅ Google Ads 설정
- ✅ 추적 코드 설치
- ✅ A/B 테스트 시작

---

## 성공 지표 (KPI)

### 1차 목표 (첫 달)
- 🎯 Waitlist 가입자 100명
- 🎯 데모 완료율 30%+
- 🎯 광고 전환 비용 ₩5,000 이하

### 2차 목표 (3개월)
- 🎯 Waitlist 가입자 1,000명
- 🎯 유료 전환율 5%+ (50명)
- 🎯 MRR ₩500,000+

---

## 다음 단계

MVP 테스트 성공 후:
1. 사용자 인증 활성화 (Supabase Auth)
2. 결제 시스템 통합 (토스페이먼츠)
3. 데이터베이스 완전 전환 (설계안 2)
4. 추가 기능 개발 (템플릿, 협업 등)
