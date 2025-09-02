'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Download, 
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI 기반 콘텐츠 생성',
      description: 'GPT-4와 Claude를 활용한 고품질 콘텐츠 자동 생성'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '빠른 제작',
      description: '몇 분 만에 전체 전자책 초안 완성'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: '체계적인 구성',
      description: 'AI가 자동으로 목차와 챕터 구성'
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: '다양한 형식 지원',
      description: 'PDF, EPUB 등 다양한 형식으로 내보내기'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: '실시간 편집',
      description: 'AI 생성 콘텐츠를 즉시 수정 가능'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '안전한 저장',
      description: 'Supabase를 통한 안전한 데이터 관리'
    }
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₩9,900',
      period: '/월',
      features: [
        '월 5권 제작',
        'GPT-3.5 기본 모델',
        '기본 템플릿',
        'PDF 내보내기',
        '이메일 지원'
      ],
      highlighted: false
    },
    {
      name: 'Professional',
      price: '₩29,900',
      period: '/월',
      features: [
        '월 20권 제작',
        'GPT-4 & Claude 선택',
        '프리미엄 템플릿',
        'PDF & EPUB 내보내기',
        '우선 지원',
        '사용자 정의 스타일'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '문의',
      period: '',
      features: [
        '무제한 제작',
        '모든 AI 모델 접근',
        '커스텀 템플릿',
        '모든 형식 내보내기',
        '전담 지원',
        'API 접근',
        '팀 협업 기능'
      ],
      highlighted: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">AI Book Writer</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/demo">
              <Button variant="ghost">데모</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>시작하기</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI로 전자책 제작의 새로운 시대
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI가 당신의 아이디어를
            <br />전자책으로 만들어드립니다
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            주제와 내용만 입력하면 AI가 체계적인 목차를 생성하고,
            <br />각 챕터를 자동으로 작성합니다. 몇 분 만에 완성되는 전자책!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="group">
                무료 체험하기
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="outline">
                바로 시작하기
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 max-w-6xl mx-auto"
        >
          <Card className="overflow-hidden shadow-2xl border-muted">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-background rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <h3 className="font-semibold">주제 입력</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    전자책 주제와 간단한 설명 입력
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <h3 className="font-semibold">AI 생성</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    목차 자동 생성 및 챕터별 콘텐츠 작성
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <h3 className="font-semibold">내보내기</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    PDF, EPUB 등 원하는 형식으로 다운로드
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            강력한 AI 기능으로 쉽고 빠르게
          </h2>
          <p className="text-muted-foreground text-lg">
            최신 AI 기술을 활용하여 전문가 수준의 전자책을 제작하세요
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            합리적인 가격으로 시작하세요
          </h2>
          <p className="text-muted-foreground text-lg">
            필요에 맞는 플랜을 선택하고 언제든지 업그레이드하세요
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`h-full ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}>
                <CardHeader>
                  {plan.highlighted && (
                    <Badge className="w-fit mb-2">인기</Badge>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6" 
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.price === '문의' ? '문의하기' : '시작하기'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-primary rounded-3xl p-12 text-center text-primary-foreground"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 AI로 전자책을 만들어보세요
          </h2>
          <p className="text-lg mb-8 opacity-90">
            무료 체험으로 AI 전자책 제작의 놀라운 경험을 시작하세요
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" variant="secondary">
                무료 체험
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                회원가입
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-semibold">AI Book Writer</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                문의하기
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2024 AI Book Writer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
