# 토스페이먼츠 결제 모듈 구현 가이드

## 📋 목차
1. [환경 설정](#1-환경-설정)
2. [Pricing 페이지 구현](#2-pricing-페이지-구현)
3. [결제 페이지 구현](#3-결제-페이지-구현)
4. [결제 승인 API 구현](#4-결제-승인-api-구현)
5. [성공/실패 페이지 구현](#5-성공실패-페이지-구현)
6. [데이터베이스 연동](#6-데이터베이스-연동)
7. [크레딧 시스템 구현](#7-크레딧-시스템-구현)
8. [사용자 인증 통합](#8-사용자-인증-통합)

---

## 1. 환경 설정

### ✅ 체크리스트
- [ ] 토스페이먼츠 회원가입 완료
- [ ] 테스트 API 키 발급 확인
- [ ] 환경변수 설정 완료
- [ ] SDK 패키지 설치 완료

### 1.1 토스페이먼츠 회원가입
1. https://developers.tosspayments.com/ 접속
2. 이메일로 회원가입
3. 개발자센터 로그인

### 1.2 테스트 API 키 확인
1. 개발자센터 → API 키 메뉴 이동
2. 테스트 키 확인 (클라이언트 키 + 시크릿 키)

**문서 제공 테스트 키 (즉시 사용 가능)**:
```
클라이언트 키: test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
시크릿 키: test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6
```

### 1.3 환경변수 설정
`.env.local` 파일에 추가:
```bash
# 토스페이먼츠 테스트 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm
TOSS_SECRET_KEY=test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6

# 결제 완료 리다이렉트 URL (로컬 개발 환경)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 1.4 SDK 설치
```bash
npm install @tosspayments/payment-widget-sdk
```

### 📸 화면 확인
- 터미널에서 설치 완료 메시지 확인
- `.env.local` 파일 생성 확인

---

## 2. Pricing 페이지 구현

### ✅ 체크리스트
- [ ] 요금제 데이터 타입 정의
- [ ] Pricing 페이지 컴포넌트 생성
- [ ] 요금제 카드 UI 구현
- [ ] 결제하기 버튼 동작 확인

### 2.1 요금제 타입 정의
`src/types/pricing.ts` 파일 생성:
```typescript
export interface PricingPlan {
  id: string
  name: string
  price: number
  credits: number
  description: string
  features: string[]
  popular?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29000,
    credits: 50,
    description: '처음 시작하는 분들께 추천',
    features: [
      '5권의 전자책 생성',
      '기본 템플릿 제공',
      '이메일 지원',
      '30일간 유효'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 50000,
    credits: 100,
    description: '가장 인기있는 플랜',
    features: [
      '10권의 전자책 생성',
      '모든 템플릿 사용',
      '우선 지원',
      '60일간 유효',
      '10% 보너스 크레딧'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 100000,
    credits: 250,
    description: '전문가를 위한 플랜',
    features: [
      '25권의 전자책 생성',
      '프리미엄 템플릿',
      '24시간 지원',
      '90일간 유효',
      '25% 보너스 크레딧'
    ]
  }
]
```

### 2.2 Pricing 페이지 생성
`src/app/pricing/page.tsx` 파일 생성:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRICING_PLANS } from '@/types/pricing'

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    // 결제 페이지로 이동
    router.push(`/checkout?plan=${planId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            크레딧 충전하기
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            AI 전자책 생성에 필요한 크레딧을 충전하세요
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative ${plan.popular ? 'border-amber-400 border-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-amber-400 text-slate-900 px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      인기
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-6">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.price.toLocaleString()}원
                    </span>
                    <div className="text-sm text-muted-foreground mt-2">
                      {plan.credits} 크레딧
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={selectedPlan === plan.id}
                  >
                    {selectedPlan === plan.id ? '선택됨' : '선택하기'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-slate-400 text-sm"
        >
          <p>💡 크레딧 1개 = 전자책 1권 생성</p>
          <p className="mt-2">안전한 결제를 위해 토스페이먼츠를 사용합니다</p>
        </motion.div>
      </div>
    </div>
  )
}
```

### 📸 화면 확인
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000/pricing` 접속
3. 확인사항:
   - [ ] 3개의 요금제 카드가 표시되는가?
   - [ ] Pro 플랜에 "인기" 뱃지가 있는가?
   - [ ] 각 카드의 가격과 크레딧이 올바르게 표시되는가?
   - [ ] "선택하기" 버튼 클릭 시 /checkout으로 이동하는가?

---

## 3. 결제 페이지 구현

### ✅ 체크리스트
- [ ] 결제 페이지 컴포넌트 생성
- [ ] 토스 결제위젯 SDK 통합
- [ ] 결제 정보 표시
- [ ] 결제하기 버튼 동작 확인

### 3.1 결제 페이지 생성
`src/app/checkout/page.tsx` 파일 생성:
```typescript
'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { PRICING_PLANS } from '@/types/pricing'
import { toast } from 'sonner'

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
const customerKey = 'anonymous' // TODO: 나중에 사용자 ID로 교체

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null)
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedPlan = PRICING_PLANS.find(p => p.id === planId)

  useEffect(() => {
    if (!selectedPlan) {
      toast.error('요금제를 선택해주세요')
      router.push('/pricing')
      return
    }

    const loadWidget = async () => {
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey)
        paymentWidgetRef.current = paymentWidget

        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: selectedPlan.price },
          { variantKey: 'DEFAULT' }
        )
        paymentMethodsWidgetRef.current = paymentMethodsWidget

        paymentWidget.renderAgreement('#agreement')

        setIsLoading(false)
      } catch (error) {
        console.error('결제위젯 로드 실패:', error)
        toast.error('결제 모듈 로딩에 실패했습니다')
      }
    }

    loadWidget()
  }, [selectedPlan, router])

  const handlePayment = async () => {
    if (!paymentWidgetRef.current || !selectedPlan) return

    setIsProcessing(true)

    try {
      // orderId 생성 (UUID 사용 권장)
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: `${selectedPlan.name} 플랜 (${selectedPlan.credits} 크레딧)`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: 'customer@example.com', // TODO: 실제 이메일로 교체
        customerName: '고객', // TODO: 실제 이름으로 교체
      })
    } catch (error) {
      console.error('결제 요청 실패:', error)
      toast.error('결제 요청에 실패했습니다')
      setIsProcessing(false)
    }
  }

  if (!selectedPlan) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">결제하기</CardTitle>
            <CardDescription>
              안전한 결제를 위해 토스페이먼츠를 사용합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 주문 정보 */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">주문 정보</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">플랜</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">크레딧</span>
                  <span className="font-medium">{selectedPlan.credits} 크레딧</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">결제 금액</span>
                  <span className="text-xl font-bold text-amber-600">
                    {selectedPlan.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 결제 위젯 */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <>
                <div id="payment-widget" />
                <div id="agreement" />
              </>
            )}

            {/* 결제 버튼 */}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isLoading || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  결제 처리 중...
                </>
              ) : (
                `${selectedPlan.price.toLocaleString()}원 결제하기`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              결제 진행 시 토스페이먼츠의 이용약관에 동의하게 됩니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
```

### 📸 화면 확인
1. Pricing 페이지에서 플랜 선택
2. `/checkout?plan=pro` 페이지로 이동
3. 확인사항:
   - [ ] 주문 정보가 올바르게 표시되는가?
   - [ ] 토스 결제위젯이 로드되는가?
   - [ ] 결제 수단 선택 UI가 나타나는가?
   - [ ] 약관 동의 체크박스가 보이는가?

---

## 4. 결제 승인 API 구현

### ✅ 체크리스트
- [ ] 결제 승인 API 라우트 생성
- [ ] 토스페이먼츠 승인 요청 구현
- [ ] 에러 처리 추가

### 4.1 결제 승인 API 생성
`src/app/api/payment/confirm/route.ts` 파일 생성:
```typescript
import { NextRequest, NextResponse } from 'next/server'

const secretKey = process.env.TOSS_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    // TODO: 나중에 DB에서 원래 주문 금액 검증
    // const order = await getOrder(orderId)
    // if (order.amount !== amount) {
    //   throw new Error('결제 금액 불일치')
    // }

    // 토스페이먼츠 승인 요청
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('결제 승인 실패:', data)
      return NextResponse.json(
        { error: data.message || '결제 승인에 실패했습니다' },
        { status: response.status }
      )
    }

    // TODO: 성공 시 DB에 결제 정보 저장
    // await savePayment({
    //   orderId,
    //   paymentKey,
    //   amount,
    //   status: 'DONE',
    //   method: data.method,
    //   approvedAt: data.approvedAt
    // })

    // TODO: 크레딧 지급
    // await addCredits(userId, credits)

    return NextResponse.json(data)

  } catch (error) {
    console.error('결제 승인 오류:', error)
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

### 📸 화면 확인
- 아직 API 테스트는 다음 단계에서 진행

---

## 5. 성공/실패 페이지 구현

### ✅ 체크리스트
- [ ] 결제 성공 페이지 생성
- [ ] 결제 실패 페이지 생성
- [ ] 최종 승인 요청 처리

### 5.1 결제 성공 페이지
`src/app/payment/success/page.tsx` 파일 생성:
```typescript
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConfirming, setIsConfirming] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        toast.error('결제 정보가 올바르지 않습니다')
        router.push('/pricing')
        return
      }

      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount)
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '결제 승인 실패')
        }

        setPaymentInfo(data)
        toast.success('결제가 완료되었습니다!')
      } catch (error: any) {
        console.error('결제 승인 오류:', error)
        toast.error(error.message || '결제 승인에 실패했습니다')
        router.push('/payment/fail')
      } finally {
        setIsConfirming(false)
      }
    }

    confirmPayment()
  }, [searchParams, router])

  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
              <p className="text-lg">결제를 승인하는 중입니다...</p>
              <p className="text-sm text-muted-foreground text-center">
                잠시만 기다려주세요
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">결제 완료!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">주문번호</span>
              <span className="font-mono text-sm">{paymentInfo.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 금액</span>
              <span className="font-semibold">
                {paymentInfo.totalAmount?.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 수단</span>
              <span>{paymentInfo.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">승인 시각</span>
              <span className="text-sm">
                {new Date(paymentInfo.approvedAt).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="lg" asChild>
              <Link href="/create">책 생성하러 가기</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            결제 영수증은 이메일로 전송되었습니다
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
```

### 5.2 결제 실패 페이지
`src/app/payment/fail/page.tsx` 파일 생성:
```typescript
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function FailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">결제 실패</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 text-center">
              {errorMessage || '결제 처리 중 문제가 발생했습니다'}
            </p>
            {errorCode && (
              <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
                오류 코드: {errorCode}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="lg" asChild>
              <Link href="/pricing">다시 시도하기</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>문제가 계속되면 고객센터로 문의해주세요</p>
            <p>support@example.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}
```

### 📸 화면 확인 (전체 플로우 테스트)
1. `/pricing` → 플랜 선택
2. `/checkout` → 결제 수단 선택
3. 테스트 결제 진행:
   - 실제 카드번호 입력 가능 (테스트 키 사용 시 청구 안 됨)
   - 또는 결제창 닫기로 실패 테스트
4. 성공 시 `/payment/success` 페이지 확인
5. 실패 시 `/payment/fail` 페이지 확인

---

## 6. 데이터베이스 연동

### ✅ 체크리스트
- [ ] Supabase 테이블 생성
- [ ] 결제 정보 저장 로직 추가
- [ ] 결제 내역 조회 API 구현

### 6.1 Supabase 테이블 생성
Supabase SQL Editor에서 실행:

```sql
-- payments 테이블
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_id VARCHAR(255) UNIQUE NOT NULL,
  payment_key VARCHAR(255),
  amount INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  method VARCHAR(50),
  plan_id VARCHAR(50),
  credits INTEGER,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- user_credits 테이블
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  balance INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- credit_transactions 테이블
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  payment_id UUID REFERENCES payments(id),
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
```

### 6.2 결제 정보 저장 로직 추가
`src/app/api/payment/confirm/route.ts` 수정:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const secretKey = process.env.TOSS_SECRET_KEY!

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { paymentKey, orderId, amount, planId } = await request.json()

    // 토스페이먼츠 승인 요청
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || '결제 승인에 실패했습니다' },
        { status: response.status }
      )
    }

    // DB에 결제 정보 저장
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_key: paymentKey,
        amount: data.totalAmount,
        status: data.status,
        method: data.method,
        plan_id: planId,
        approved_at: data.approvedAt
      })

    if (paymentError) {
      console.error('결제 정보 저장 실패:', paymentError)
      // 결제는 성공했지만 DB 저장 실패 - 수동 처리 필요
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('결제 승인 오류:', error)
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

### 📸 화면 확인
- Supabase Dashboard → Table Editor → payments 테이블에 데이터 저장 확인

---

## 7. 크레딧 시스템 구현

### ✅ 체크리스트
- [ ] 크레딧 지급 로직 구현
- [ ] 크레딧 사용 로직 구현
- [ ] 크레딧 잔액 표시 컴포넌트

### 7.1 크레딧 지급 API
`src/app/api/credits/add/route.ts` 파일 생성:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { userId, credits, paymentId, description } = await request.json()

    // user_credits 업데이트 (upsert)
    const { error: creditError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        balance: supabase.raw(`balance + ${credits}`)
      }, {
        onConflict: 'user_id'
      })

    if (creditError) throw creditError

    // 거래 내역 기록
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        payment_id: paymentId,
        amount: credits,
        type: 'PURCHASE',
        description
      })

    if (transactionError) throw transactionError

    return NextResponse.json({ success: true, credits })

  } catch (error) {
    console.error('크레딧 지급 실패:', error)
    return NextResponse.json(
      { error: '크레딧 지급 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
```

### 7.2 크레딧 표시 컴포넌트
`src/components/CreditBalance.tsx` 파일 생성:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CreditBalance() {
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    // TODO: 실제 크레딧 조회 API 호출
    // const fetchBalance = async () => {
    //   const response = await fetch('/api/credits/balance')
    //   const data = await response.json()
    //   setBalance(data.balance)
    // }
    // fetchBalance()

    // 임시 데이터
    setBalance(100)
  }, [])

  if (balance === null) return null

  return (
    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
      <Coins className="w-4 h-4 text-amber-500" />
      <span className="font-semibold">{balance}</span>
      <span className="text-xs text-muted-foreground">크레딧</span>
    </Badge>
  )
}
```

### 📸 화면 확인
- Navigation bar에 크레딧 잔액 표시 확인

---

## 8. 사용자 인증 통합

### ✅ 체크리스트
- [ ] Supabase Auth 설정
- [ ] 로그인/회원가입 페이지
- [ ] 결제 시 사용자 정보 연동
- [ ] 보호된 라우트 구현

### 8.1 Supabase Auth 설정
```typescript
// src/lib/supabase/client.ts 에서 이미 설정됨
// 추가 설정 필요 시 여기서 작업
```

### 8.2 로그인 페이지 (TODO)
```typescript
// src/app/login/page.tsx
// 추후 구현 예정
```

### 8.3 결제 시 사용자 정보 연동
`src/app/checkout/page.tsx` 수정:
```typescript
// customerKey를 실제 사용자 ID로 변경
const { data: { user } } = await supabase.auth.getUser()
const customerKey = user?.id || 'anonymous'
```

---

## 🎯 구현 순서 요약

1. ✅ **환경 설정** (10분)
   - API 키 발급 및 환경변수 설정

2. ✅ **Pricing 페이지** (30분)
   - 요금제 UI 구현 및 테스트

3. ✅ **결제 페이지** (40분)
   - 토스 SDK 통합 및 결제 UI 구현

4. ✅ **결제 승인 API** (20분)
   - 서버 사이드 승인 로직 구현

5. ✅ **성공/실패 페이지** (30분)
   - 결제 완료 플로우 구현

6. ✅ **DB 연동** (40분)
   - 결제 정보 저장 및 조회

7. ✅ **크레딧 시스템** (1시간)
   - 크레딧 지급/사용/표시 구현

8. ✅ **사용자 인증 통합** (1시간)
   - Auth 연동 및 보호된 라우트

**총 예상 시간: 약 4-5시간**

---

## 📌 중요 참고사항

### 보안
- ⚠️ 시크릿 키는 절대 클라이언트에 노출하지 마세요
- ⚠️ 결제 금액은 반드시 서버에서 검증하세요
- ⚠️ orderId는 예측 불가능하게 생성하세요

### 테스트
- 테스트 키 사용 시 실제 결제는 발생하지 않습니다
- 개발자센터에서 테스트 결제 내역을 확인할 수 있습니다

### 프로덕션 배포 전 체크리스트
- [ ] 라이브 API 키로 교체
- [ ] 도메인 등록 및 HTTPS 적용
- [ ] 웹훅 URL 설정 (옵션)
- [ ] 에러 모니터링 설정
- [ ] 결제 내역 백업 정책 수립

---

## 🔗 참고 링크
- [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)
- [결제위젯 가이드](https://docs.tosspayments.com/guides/payment-widget/integration)
- [API 레퍼런스](https://docs.tosspayments.com/reference)
- [샘플 프로젝트](https://github.com/tosspayments/tosspayments-sample)
