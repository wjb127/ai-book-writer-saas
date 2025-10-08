'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  Shield,
  X,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect } from 'react'

// 카운트업 컴포넌트
function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{count.toLocaleString()}</span>
}

// 실시간 알림 컴포넌트
function RealtimeNotifications() {
  const notifications = [
    { name: '김**', location: '서울', action: '전자책 완성' },
    { name: '이**', location: '부산', action: '프로 플랜 가입' },
    { name: '박**', location: '대구', action: '첫 판매 달성' },
    { name: '정**', location: '인천', action: '전자책 완성' },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(true)
      setCurrentIndex((prev) => (prev + 1) % notifications.length)

      setTimeout(() => setIsVisible(false), 5000)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const current = notifications[currentIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="fixed bottom-4 left-4 z-50"
        >
          <Card className="p-4 bg-white shadow-2xl border-2 border-green-500 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                {current.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold">
                  {current.name}님이 방금 {current.action}했습니다!
                </p>
                <p className="text-sm text-white/600">
                  {Math.floor(Math.random() * 5) + 1}분 전 • {current.location}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-amber-500" />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 스티키 CTA (모바일)
function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 800)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-slate-800 md:hidden z-50 shadow-2xl"
        >
          <Link href="/create">
            <Button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-4">
              지금 시작하기 →
            </Button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <RealtimeNotifications />
      <StickyCTA />

      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-slate-700" />
            <span className="font-bold text-xl">AI Book Writer</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/demo">
              <Button variant="ghost">무료 체험</Button>
            </Link>
            <Link href="/create">
              <Button className="bg-slate-800 hover:bg-slate-900">지금 시작하기</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - 10분 작가 충격 */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 overflow-hidden flex items-center">
        {/* 실시간 카운터 */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-amber-400 text-slate-900 px-6 py-2 rounded-full font-semibold shadow-lg text-sm md:text-base">
            🔥 지금 이 순간 <span className="text-slate-950 font-bold">127만원</span> 거래 중
          </div>
        </div>

        <div className="container mx-auto px-4 py-24 text-center text-white relative z-10">
          {/* 긴급 알림 배너 */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <Badge className="bg-amber-400 text-slate-900 font-semibold px-6 py-2 text-sm md:text-base rounded-full shadow-xl">
              ⚡ 마감 임박: 오늘 신청자 한정 75% 할인 (23명 남음)
            </Badge>
          </motion.div>

          {/* 메인 헤드라인 */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
          >
            <span className="block mb-2">150페이지 전자책,</span>
            <span className="block text-amber-400 text-4xl md:text-6xl">
              10분이면 충분합니다
            </span>
          </motion.h1>

          {/* 서브헤드라인 - 손익 비교 */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl mb-6 font-semibold"
          >
            성공하면 <span className="text-amber-400">월 1억 작가</span>
            <br />
            실패해도 <span className="text-amber-400">커피 두 잔 값</span>
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-xl mb-8 text-white/200"
          >
            1권당 <span className="text-white font-bold text-xl md:text-2xl">9,900원</span>
            <br />
            10권 묶음 <span className="text-white font-bold text-xl md:text-2xl">69,000원</span> (30% 할인)
          </motion.p>

          {/* 실시간 통계 카드 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10"
          >
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl px-4 md:px-6 py-4 border border-slate-700">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">2,847명</div>
              <div className="text-xs md:text-sm text-white/300">이미 작가가 됨</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl px-4 md:px-6 py-4 border border-slate-700">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">10분</div>
              <div className="text-xs md:text-sm text-white/300">평균 완성 시간</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl px-4 md:px-6 py-4 border border-slate-700">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">98%</div>
              <div className="text-xs md:text-sm text-white/300">만족도</div>
            </div>
          </motion.div>

          {/* CTA 버튼 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col gap-4 items-center mb-8"
          >
            <Link href="/create">
              <Button
                size="lg"
                className="group bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-base md:text-lg px-8 md:px-12 py-4 md:py-6 rounded-xl shadow-xl shadow-amber-400/20 hover:shadow-2xl hover:shadow-amber-400/30 transition-all"
              >
                <span className="flex flex-col items-center gap-2">
                  <span className="flex items-center gap-3">
                    🚀 지금 10분 만에 작가 되기
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <span className="text-xs md:text-sm font-normal">
                    회원가입 없이 바로 시작
                  </span>
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* 신뢰 요소 */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm opacity-80">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              신용카드 불필요
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              30초 만에 시작
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              30일 환불 보장
            </span>
          </div>

          {/* 스크롤 유도 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </motion.div>
        </div>
      </section>

      {/* FOMO Section - 손실 회피 */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              오늘도 <span className="text-amber-400">&ldquo;언젠가는 책 쓸거야&rdquo;</span>
              <br />
              하고 미루셨나요?
            </h2>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-slate-700 shadow-lg">
              <p className="text-xl md:text-2xl mb-4 font-semibold text-white">
                당신이 미루는 동안,
              </p>
              <p className="text-base md:text-xl mb-2 text-white/80">
                크몽에서 누군가는 <span className="text-amber-400 font-semibold">이 순간에도</span>
              </p>
              <p className="text-2xl md:text-4xl font-bold text-amber-400 mb-6">
                전자책으로 월 300만원 벌고 있습니다
              </p>

              <Separator className="my-6 bg-white/20" />

              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-white/20">
                  <p className="text-base md:text-lg font-semibold mb-2 text-white/90">
                    ❌ 지금 시작 안 하면
                  </p>
                  <p className="text-sm md:text-base text-white/70">
                    • 1년 후에도 똑같은 자리
                    <br />
                    • 1만원도 못 버는 인생
                    <br />
                    • 계속 &ldquo;할걸&rdquo; 후회만
                  </p>
                </div>

                <div className="bg-slate-700/30 p-6 rounded-xl border-2 border-amber-400/50">
                  <p className="text-base md:text-lg font-semibold mb-2 text-amber-400">
                    ✅ 지금 시작하면
                  </p>
                  <p className="text-sm md:text-base text-white">
                    • 10분 후 작가 됨
                    <br />
                    • 9,900원으로 전자책 사업 시작
                    <br />
                    • 평생 &ldquo;해봤다&rdquo; 자부심
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 실시간 손실 카운터 */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-950 border-2 border-slate-500/50 p-6 md:p-8 text-center text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-amber-400">
                ⏰ 당신이 이 페이지를 보는 동안 놓친 기회
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-400 mb-2">
                    <CountUp end={127} duration={3} />만원
                  </div>
                  <div className="text-xs md:text-sm">크몽 거래액 (실시간)</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-400 mb-2">
                    <CountUp end={23} duration={2} />명
                  </div>
                  <div className="text-xs md:text-sm">방금 전자책 완성 (5분 전)</div>
                </div>
              </div>
              <p className="mt-6 text-lg md:text-xl font-bold text-amber-400">
                계속 구경만 하시겠습니까?
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Before/After 대비 */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              작가는 <span className="text-amber-400">특별한 사람</span>만
              <br />
              되는 줄 알았습니다
            </h2>
            <p className="text-lg md:text-xl text-white/80">
              하지만 이미 2,847명의 평범한 사람들이 증명했습니다
            </p>
          </motion.div>

          {/* Before/After 극명한 대비 */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            <Card className="p-6 md:p-8 bg-gray-100 border-2 border-gray-300">
              <div className="text-center mb-6">
                <Badge className="bg-slate-500 text-white px-4 py-2 text-base md:text-lg font-bold">
                  ❌ 예전 방식
                </Badge>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <X className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold">6개월 집필</div>
                    <div className="text-xs md:text-sm text-white/600">밤낮으로 써도 끝이 안 보임</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <X className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold">출판사 계약 필요</div>
                    <div className="text-xs md:text-sm text-white/600">계약 따내기가 하늘의 별따기</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <X className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold">수백만원 투자</div>
                    <div className="text-xs md:text-sm text-white/600">편집, 디자인, 마케팅 비용</div>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-teal-50 border-2 border-slate-500 shadow-xl transform md:scale-105">
              <div className="text-center mb-6">
                <Badge className="bg-slate-800 text-white px-4 py-2 text-base md:text-lg font-bold">
                  ✨ AI Book Writer
                </Badge>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <CheckCircle className="w-6 h-6 text-slate-700 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-slate-700">10분 AI 작성</div>
                    <div className="text-xs md:text-sm text-white/600">커피 한 잔 마실 시간이면 끝</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <CheckCircle className="w-6 h-6 text-slate-700 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-slate-700">크몽 즉시 판매</div>
                    <div className="text-xs md:text-sm text-white/600">완성하자마자 바로 업로드, 바로 판매</div>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <CheckCircle className="w-6 h-6 text-slate-700 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-slate-700">9,900원/권</div>
                    <div className="text-xs md:text-sm text-white/600">10권 묶음 69,000원 (30% 할인)</div>
                  </div>
                </li>
              </ul>
            </Card>
          </div>

          {/* 통계 임팩트 */}
          <div className="bg-slate-800 rounded-2xl p-8 md:p-12 text-white text-center border border-amber-400/30">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">
              이미 <span className="text-amber-400">2,847명</span>이 10분 만에 작가가 되었습니다
            </h3>
            <p className="text-xl md:text-2xl mb-2">
              다음 차례는 <span className="text-amber-400 font-bold text-2xl md:text-3xl">당신</span>입니다
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Story Section - 김과장 vs 이대리 */}
      <section className="py-24 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
            두 사람의 <span className="text-amber-400">1년 후</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* 김과장 스토리 - 실패 */}
            <Card className="p-6 md:p-8 bg-slate-900 border-2 border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full -mr-16 -mt-16" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl md:text-2xl font-bold text-white">
                    김
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">김과장 (42세)</h3>
                    <p className="text-sm md:text-base text-white/60">회사원 • 연봉 5,000만원</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="text-xs md:text-sm text-white/50 mb-1">2024년 1월</p>
                    <p className="text-sm md:text-base font-medium text-white">&ldquo;전자책 쓰자! 부수입 만들자!&rdquo;</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="text-xs md:text-sm text-white/50 mb-1">2024년 3월</p>
                    <p className="text-sm md:text-base font-medium text-white">퇴근 후 2시간씩 집필... 너무 힘들다</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="text-xs md:text-sm text-white/50 mb-1">2024년 6월</p>
                    <p className="text-sm md:text-base font-medium text-white">3챕터 쓰고 포기... &ldquo;나중에 다시&rdquo;</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border-2 border-white/30">
                    <p className="text-xs md:text-sm text-white/70 mb-1 font-bold">2025년 1월 (1년 후)</p>
                    <p className="text-sm md:text-base font-bold text-white">
                      💔 결과: 전자책 0권 • 추가 수입 0원
                      <br />
                      여전히 &ldquo;언젠가는&hellip;&rdquo; 혼잣말
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-base md:text-lg font-bold text-white">
                    투자한 시간: <span className="text-white/70">120시간</span>
                    <br />
                    벌어들인 돈: <span className="text-white/70">0원</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* 이대리 스토리 - 성공 */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-amber-400 relative overflow-hidden shadow-2xl transform md:scale-105">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16" />

              <div className="absolute top-4 right-4 z-20">
                <Badge className="bg-amber-400 text-slate-950 font-bold px-4 py-2">
                  ✨ 성공 케이스
                </Badge>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-400 flex items-center justify-center text-xl md:text-2xl font-bold text-slate-900">
                    이
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">이대리 (38세)</h3>
                    <p className="text-sm md:text-base text-white/60">회사원 • 연봉 4,500만원</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-amber-400/30">
                    <p className="text-xs md:text-sm text-amber-400 mb-1 font-bold">2024년 1월</p>
                    <p className="text-sm md:text-base font-medium text-white">&ldquo;AI Book Writer 써보자!&rdquo;</p>
                  </div>

                  <div className="bg-slate-800/70 p-4 rounded-lg border border-amber-400/30">
                    <p className="text-xs md:text-sm text-amber-400 mb-1 font-bold">2024년 1월 (점심시간)</p>
                    <p className="text-sm md:text-base font-medium text-white">10분 만에 전자책 1권 완성, 크몽 업로드</p>
                  </div>

                  <div className="bg-slate-800/70 p-4 rounded-lg border border-amber-400/30">
                    <p className="text-xs md:text-sm text-amber-400 mb-1 font-bold">2024년 4월 (3개월 후)</p>
                    <p className="text-sm md:text-base font-medium text-white">월 평균 50만원 부수입 발생 💰</p>
                  </div>

                  <div className="bg-amber-400/20 p-4 rounded-lg border-2 border-amber-400">
                    <p className="text-xs md:text-sm text-amber-400 mb-1 font-bold">2025년 1월 (1년 후)</p>
                    <p className="text-sm md:text-base font-bold text-white">
                      ✅ 결과: 전자책 12권 • 월 수입 500만원
                      <br />
                      &ldquo;다음 책은 뭐 쓸까?&rdquo; 고민 중
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-amber-400/20 rounded-lg border border-amber-400">
                  <p className="text-base md:text-lg font-bold text-white">
                    투자한 시간: <span className="text-amber-400">2시간</span>
                    <br />
                    벌어들인 돈: <span className="text-amber-400">연 6,000만원</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* 핵심 메시지 */}
          <div className="max-w-3xl mx-auto text-center">
            <Card className="p-8 md:p-10 bg-black text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                둘의 차이는 <span className="text-amber-400">&lsquo;재능&rsquo;</span>이 아니었습니다
              </h3>
              <p className="text-xl md:text-2xl mb-6">
                <span className="text-amber-400 font-bold">&lsquo;올바른 도구&rsquo;</span>를 아는지
                <br />
                모르는지의 차이였죠
              </p>
              <Separator className="my-6 bg-white/20" />
              <p className="text-2xl md:text-3xl font-bold text-amber-400 mb-8">
                당신은 어느 쪽인가요?
              </p>
              <Link href="/create">
                <Button
                  size="lg"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-6"
                >
                  이대리처럼 성공하기 →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Timeline Section - 3개월 후 미래 */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            🔮 3개월 후 당신의
            <br />
            <span className="text-amber-300">두 가지 미래</span>
          </h2>
          <p className="text-lg md:text-xl text-center text-white/300 mb-16">
            어느 쪽을 선택하시겠습니까?
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* 미래 A - 실패 */}
            <Card className="p-6 md:p-8 bg-gray-800 border-2 border-amber-500 text-white">
              <Badge className="bg-slate-500 text-white mb-4">미래 A</Badge>

              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-amber-400">
                &ldquo;아... 그때 그거 해볼걸&rdquo;
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <p>통장 잔고 변화 없음</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <p>여전히 크몽에서 전자책 구경만</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <p>&ldquo;언젠가는&hellip;&rdquo; 똑같은 말 반복</p>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <p>다른 사람 성공 스토리 보며 부러워만</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                <p className="text-xl md:text-2xl font-bold text-amber-300">
                  추가 수입: 0원
                </p>
              </div>
            </Card>

            {/* 미래 B - 성공 */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-emerald-600 to-teal-600 border-4 border-amber-400 shadow-2xl transform md:scale-105 text-white">
              <Badge className="bg-amber-400 text-slate-950 mb-4 font-bold">미래 B ⭐</Badge>

              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-amber-300">
                &ldquo;오 진짜 되네?&rdquo;
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-300 flex-shrink-0" />
                  <p className="font-medium">전자책 3권 크몽에서 판매 중</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-300 flex-shrink-0" />
                  <p className="font-medium">월 추가 수입 80만원 안정적으로 발생</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-300 flex-shrink-0" />
                  <p className="font-medium">&ldquo;다음 책은 뭐 쓸까?&rdquo; 행복한 고민</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-amber-300 flex-shrink-0" />
                  <p className="font-medium">지인들에게 &ldquo;나 작가야&rdquo; 자랑</p>
                </div>
              </div>

              <div className="p-4 bg-amber-500 rounded-lg text-center text-black">
                <p className="text-xl md:text-2xl font-bold">
                  추가 수입: 월 80만원+
                </p>
                <p className="text-xs md:text-sm mt-1">(1년이면 960만원)</p>
              </div>
            </Card>
          </div>

          {/* 분기점 강조 */}
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10 bg-amber-400 text-slate-950 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                두 미래의 분기점
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-xl md:text-3xl font-bold">
                <span>오늘</span>
                <span>•</span>
                <span>9,900원</span>
                <span>•</span>
                <span>10분</span>
                <br className="md:hidden" />
                <span className="text-slate-900">(10권 묶음 69,000원)</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mb-6">
                당신은 어느 미래를 선택하시겠습니까?
              </p>
              <Link href="/create">
                <Button
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg md:text-xl px-8 md:px-12 py-4 md:py-6"
                >
                  미래 B 선택하기 →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section - 자판기 모델 */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block bg-slate-800 text-white px-6 md:px-8 py-3 md:py-4 rounded-full mb-6 border border-amber-400/30"
            >
              <p className="text-lg md:text-2xl font-bold">
                🎰 자판기처럼 간편하게! 필요한 만큼만 구매하세요
              </p>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              💸 150페이지 완성본
              <br />
              <span className="text-amber-400">단돈 9,900원</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 mb-6">
              외주 200만원 vs AI 9,900원 = <span className="text-amber-400 font-bold">20,202% 절약</span>
            </p>
          </div>

          {/* 가격 카드 */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* 1권 패키지 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-10 bg-slate-800 border-2 border-slate-700 h-full hover:shadow-2xl transition-shadow text-white">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">📖</div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">1권 패키지</h3>
                  <p className="text-white/70">먼저 써보고 싶으신 분</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    ₩9,900
                  </div>
                  <p className="text-sm text-white/70">전자책 1권 (150페이지)</p>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/70">API 원가 (Claude 4.5)</span>
                    <span className="font-bold text-white">₩1,450</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/70">당신의 비용</span>
                    <span className="font-bold text-white">₩9,900</span>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">순이익 마진</span>
                    <span className="font-bold text-amber-400 text-lg">583%</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">150페이지 완성본</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">15개 챕터 자동 생성</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">PDF/EPUB 내보내기</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">10분 만에 완성</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">무제한 수정 가능</span>
                  </li>
                </ul>

                <Link href="/create">
                  <Button
                    size="lg"
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-lg py-6"
                  >
                    1권 만들기 →
                  </Button>
                </Link>

                <p className="text-center text-xs text-white/70 mt-4">
                  크몽 판매가 평균 29,000원 = 즉시 19,100원 순이익
                </p>
              </Card>
            </motion.div>

            {/* 10권 패키지 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 md:p-10 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border-4 border-amber-400 h-full relative overflow-hidden shadow-2xl transform md:scale-105">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-400 text-slate-950 font-bold px-4 py-2 text-base">
                    ⭐ 30% 할인
                  </Badge>
                </div>

                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">10권 패키지</h3>
                  <p className="text-slate-100">본격적으로 사업하실 분</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-2xl md:text-3xl line-through opacity-70">₩99,000</span>
                    <span className="text-4xl md:text-5xl font-bold text-amber-400">₩69,000</span>
                  </div>
                  <p className="text-sm text-slate-100">전자책 10권 (1,500페이지)</p>
                  <p className="text-lg font-bold text-amber-400 mt-2">권당 ₩6,900</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 mb-6 border border-white/20">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>API 원가 (10권)</span>
                    <span className="font-bold">₩14,500</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>당신의 비용</span>
                    <span className="font-bold text-amber-400">₩69,000</span>
                  </div>
                  <Separator className="my-2 bg-white/20" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold">순이익 마진</span>
                    <span className="font-bold text-amber-400 text-lg">376%</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium">전자책 10권 생성 (1,500페이지)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium">권당 3,000원 할인</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium">무제한 수정 가능</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium">PDF/EPUB/DOCX 내보내기</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium">우선 지원</span>
                  </li>
                </ul>

                <Link href="/create">
                  <Button
                    size="lg"
                    className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-lg py-6"
                  >
                    10권 패키지 구매하기 →
                  </Button>
                </Link>

                <p className="text-center text-sm text-amber-400 mt-4 font-bold">
                  크몽 판매 시 예상 수익: 290,000원 - 69,000원 = 221,000원
                </p>
              </Card>
            </motion.div>
          </div>

          {/* 가격 비교 */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
              💡 다른 방법과 <span className="text-amber-400">비교해보세요</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 md:p-6 text-center bg-slate-900 text-white border border-slate-700">
                <div className="text-2xl md:text-4xl mb-2">📝</div>
                <div className="text-sm md:text-base font-bold mb-2">외주 작가</div>
                <div className="text-xl md:text-3xl font-bold text-white/70 mb-1">200만원</div>
                <div className="text-xs md:text-sm text-white/50">1권당</div>
              </Card>

              <Card className="p-4 md:p-6 text-center bg-slate-900 text-white border border-slate-700">
                <div className="text-2xl md:text-4xl mb-2">👨‍💻</div>
                <div className="text-sm md:text-base font-bold mb-2">프리랜서</div>
                <div className="text-xl md:text-3xl font-bold text-white/70 mb-1">100만원</div>
                <div className="text-xs md:text-sm text-white/50">1권당</div>
              </Card>

              <Card className="p-4 md:p-6 text-center bg-slate-900 text-white border border-slate-700">
                <div className="text-2xl md:text-4xl mb-2">🤖</div>
                <div className="text-sm md:text-base font-bold mb-2">직접 작성</div>
                <div className="text-xl md:text-3xl font-bold text-white/70 mb-1">3개월</div>
                <div className="text-xs md:text-sm text-white/50">시간 + 노력</div>
              </Card>

              <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-slate-700 to-slate-800 text-white border-4 border-amber-400 transform md:scale-110">
                <div className="text-2xl md:text-4xl mb-2">✨</div>
                <div className="text-sm md:text-base font-bold mb-2">AI Book Writer</div>
                <div className="text-xl md:text-3xl font-bold text-amber-400 mb-1">₩9,900</div>
                <div className="text-xs md:text-sm">1권 / 10분</div>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Card className="inline-block p-4 md:p-6 bg-slate-800 border-2 border-amber-400">
                <p className="text-lg md:text-2xl font-bold text-white">
                  → 크몽에서 1권만 팔아도 <span className="text-amber-400">19,100원 순이익</span>
                  <br />
                  10권 팔면? <span className="text-amber-400 text-2xl">221,000원!</span>
                </p>
              </Card>
            </div>
          </div>

          {/* ROI 계산기 */}
          <div className="max-w-3xl mx-auto mb-16">
            <Card className="p-8 md:p-10 bg-slate-800 text-white text-center border border-amber-400/30">
              <h3 className="text-2xl md:text-3xl font-bold mb-8">
                💰 실제 수익 시뮬레이션
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                  <div className="text-4xl mb-3">🎯</div>
                  <div className="text-xl font-bold mb-2">1권 패키지 구매</div>
                  <div className="space-y-2 text-left text-sm">
                    <div className="flex justify-between">
                      <span>구매 비용:</span>
                      <span className="font-bold">-₩9,900</span>
                    </div>
                    <div className="flex justify-between">
                      <span>크몽 판매 (평균):</span>
                      <span className="font-bold text-amber-300">+₩29,000</span>
                    </div>
                    <Separator className="my-2 bg-white/20" />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">순수익:</span>
                      <span className="font-bold text-amber-300">₩19,100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border-2 border-amber-400">
                  <div className="text-4xl mb-3">💎</div>
                  <div className="text-xl font-bold mb-2">10권 패키지 구매</div>
                  <div className="space-y-2 text-left text-sm">
                    <div className="flex justify-between">
                      <span>구매 비용:</span>
                      <span className="font-bold">-₩69,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>크몽 판매 (10권):</span>
                      <span className="font-bold text-amber-400">+₩290,000</span>
                    </div>
                    <Separator className="my-2 bg-white/20" />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">순수익:</span>
                      <span className="font-bold text-amber-400">₩221,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xl font-bold mt-8">
                투자 회수율: <span className="text-amber-400 text-3xl">320%</span>
              </p>
            </Card>
          </div>

          {/* 환불 보장 */}
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10 bg-slate-800 text-white text-center border border-amber-400/30">
              <Shield className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-amber-400" />
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                7일 무조건 환불 보장
              </h3>
              <p className="text-xl md:text-2xl mb-4">
                만족하지 못하시면
                <br />
                <span className="font-bold text-amber-400">100% 전액 환불</span>
              </p>
              <Separator className="my-6 bg-white/30" />
              <p className="text-lg md:text-xl">
                질문 없이 즉시 환불해드립니다.
                <br />
                품질에 자신 있기 때문입니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section - 도발적 질문 */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-12 text-white">
              🤔 솔직히 물어봅니다
            </h2>

            {/* 도발적 질문들 */}
            <div className="max-w-3xl mx-auto mb-12 space-y-6">
              {[
                "Q. 월 100만원 추가 수입 생기면 뭐 하실 건가요?",
                "Q. 작가라는 타이틀 갖고 싶지 않으세요?",
                "Q. 10분 투자가 그렇게 아까우세요?",
                "Q. 1만원이 그렇게 아까우세요?",
              ].map((question, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-4 md:p-6 bg-slate-800/50 border border-slate-700 shadow-md">
                    <p className="text-base md:text-xl font-semibold text-white">{question}</p>
                  </Card>
                </motion.div>
              ))}

              <div className="my-12">
                <p className="text-xl md:text-2xl font-semibold text-amber-400 mb-2">
                  아니면...
                </p>
              </div>

              <Card className="p-6 md:p-8 bg-slate-900/30 border-2 border-amber-400 shadow-lg">
                <p className="text-lg md:text-xl font-semibold mb-4 text-white">
                  Q. 그냥 구경만 하면서
                  <br />
                  <span className="text-amber-400">&ldquo;나도 할 수 있을 텐데&rdquo;</span>
                  <br />
                  혼자 생각만 하실 건가요?
                </p>
              </Card>
            </div>

            <Separator className="max-w-md mx-auto my-12 bg-slate-700" />

            {/* 최종 메시지 */}
            <div className="mb-12">
              <p className="text-3xl md:text-5xl font-bold mb-4 text-white">
                성공하면 <span className="text-amber-400">월 1억 작가</span>
              </p>
              <p className="text-3xl md:text-5xl font-bold mb-8 text-white">
                실패해도 <span className="text-amber-400">커피 두 잔 값</span>
              </p>
              <p className="text-2xl md:text-4xl font-bold text-amber-400">
                이런 투자, 안 하면 바보 아닙니까?
              </p>
            </div>

            {/* 최종 CTA */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/create">
                <Button
                  size="lg"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xl md:text-3xl px-12 md:px-20 py-8 md:py-12 rounded-full shadow-2xl"
                >
                  <span className="flex flex-col items-center">
                    <span>🚀 지금 10분 만에 작가 되기</span>
                    <span className="text-sm md:text-lg font-normal mt-2">
                      1권 9,900원 / 10권 69,000원
                    </span>
                  </span>
                </Button>
              </Link>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 text-xs md:text-sm text-white">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                신용카드 불필요
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                30초 만에 시작
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                언제든 취소 가능
              </span>
            </div>

            {/* 마지막 푸시 */}
            <div className="mt-16 max-w-2xl mx-auto">
              <Card className="p-6 md:p-8 bg-slate-900/80 backdrop-blur-lg border border-slate-700">
                <p className="text-xl md:text-2xl mb-6 font-bold text-white">
                  지금 시작하지 않으면,
                </p>
                <p className="text-3xl md:text-5xl font-bold text-amber-400">
                  1년 후에도 똑같은 자리에
                  <br />
                  있을 겁니다
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">AI Book Writer</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-white/70">
              <Link href="/terms" className="hover:text-amber-400 transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="hover:text-amber-400 transition-colors">
                문의하기
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-white/50">
            © 2024 AI Book Writer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
