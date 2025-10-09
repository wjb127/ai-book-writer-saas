# AI Book Writer SaaS 상용화 기획안

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [핵심 기능 로드맵](#핵심-기능-로드맵)
3. [비즈니스 모델](#비즈니스-모델)
4. [기술 스택 및 아키텍처](#기술-스택-및-아키텍처)
5. [개발 우선순위 및 일정](#개발-우선순위-및-일정)
6. [성장 전략](#성장-전략)

---

## 프로젝트 개요

### 비전
AI 기술을 활용하여 누구나 쉽게 전자책을 만들고, 판매하고, 공유할 수 있는 **크리에이터 이코노미 플랫폼** 구축

### 타겟 고객
1. **1차 타겟**: 콘텐츠 크리에이터 (블로거, 유튜버, 인플루언서)
2. **2차 타겟**: 전문가/강사 (온라인 강의 제작자, 컨설턴트)
3. **3차 타겟**: 일반 사용자 (취미로 글쓰기 하는 사람, 자서전 작성자)

### 핵심 가치 제안
- ⚡ **빠른 제작**: 주제만 입력하면 AI가 30분 내 전자책 초안 완성
- 💰 **수익 창출**: 제작한 책을 마켓플레이스에서 판매 가능
- 🤝 **커뮤니티**: 작가들끼리 피드백, 협업, 네트워킹
- 📊 **데이터 기반 성장**: 실시간 판매/독자 분석 대시보드 제공

---

## 핵심 기능 로드맵

### Phase 1: MVP 완성 (1-2개월)

#### 1.1 인증 시스템 (필수)
**구현 범위**:
- [x] Supabase Auth 기반 이메일/비밀번호 로그인
- [x] 소셜 로그인 (Google, Kakao, Naver)
- [ ] 이메일 인증 및 비밀번호 재설정
- [ ] 프로필 관리 (닉네임, 프로필 사진, 자기소개)
- [ ] 작가 프로필 페이지 (공개 포트폴리오)

**DB 스키마**:
```sql
-- users 테이블 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  social_links JSONB,
  total_books INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 작가 등급 시스템
CREATE TYPE author_tier AS ENUM ('starter', 'creator', 'pro', 'master');
ALTER TABLE profiles ADD COLUMN tier author_tier DEFAULT 'starter';
```

**UI/UX**:
- `/login` - 로그인 페이지
- `/signup` - 회원가입 페이지
- `/profile/:username` - 공개 프로필
- `/dashboard/settings` - 프로필 설정

---

#### 1.2 결제 시스템 (토스페이먼츠)

**구현 범위**:
- [ ] 토스페이먼츠 결제위젯 v2 연동
- [ ] 구독 플랜 관리 (프리미엄, 프로)
- [ ] 크레딧 시스템 (AI 생성 횟수 차감)
- [ ] 결제 내역 조회
- [ ] 환불 처리 로직

**구독 플랜**:

| 플랜 | 가격 | AI 생성 | 스토리지 | 판매 수수료 | 기능 |
|------|------|---------|----------|-------------|------|
| **Free** | ₩0 | 3회/월 | 100MB | 30% | 기본 편집, 워터마크 |
| **Creator** | ₩9,900/월 | 50회/월 | 5GB | 15% | 고급 AI 모델, 무제한 수정 |
| **Pro** | ₩29,900/월 | 무제한 | 50GB | 10% | 우선 생성, 팀 협업, API 접근 |
| **Enterprise** | 협의 | 무제한 | 무제한 | 5% | 전담 매니저, 커스텀 AI |

**DB 스키마**:
```sql
-- 구독 정보
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  plan TEXT NOT NULL, -- 'free', 'creator', 'pro', 'enterprise'
  status TEXT NOT NULL, -- 'active', 'canceled', 'expired'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 내역
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  order_id TEXT UNIQUE NOT NULL, -- 토스 orderId
  payment_key TEXT, -- 토스 paymentKey
  amount INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'done', 'canceled', 'failed'
  method TEXT, -- 'card', 'transfer', 'phone'
  type TEXT NOT NULL, -- 'subscription', 'credit', 'book_purchase'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 크레딧 내역
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL, -- 양수: 충전, 음수: 사용
  balance INTEGER NOT NULL, -- 현재 잔액
  reason TEXT NOT NULL, -- 'purchase', 'generation', 'refund', 'bonus'
  related_id UUID, -- 관련된 book_id 또는 payment_id
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API 엔드포인트**:
```typescript
// 결제 관련 API
POST   /api/payments/checkout        // 결제 시작
POST   /api/payments/confirm         // 결제 승인 (토스 콜백)
POST   /api/payments/cancel          // 결제 취소
GET    /api/payments/history         // 결제 내역
POST   /api/subscriptions/subscribe  // 구독 시작
POST   /api/subscriptions/cancel     // 구독 취소
GET    /api/credits/balance          // 크레딧 잔액 조회
```

**UI 페이지**:
- `/pricing` - 요금제 페이지 (개선)
- `/dashboard/billing` - 결제 관리
- `/checkout` - 결제 페이지

---

#### 1.3 전자책 생성 개선

**현재 상태**:
- [x] 주제 기반 목차 생성
- [x] 챕터별 내용 생성
- [x] 마크다운 편집
- [x] PDF 내보내기

**추가 기능**:
- [ ] 책 저장/불러오기 (DB 연동)
- [ ] 버전 히스토리 (자동 저장)
- [ ] 협업 기능 (공동 저자 초대)
- [ ] AI 스타일 선택 (전문적/캐주얼/스토리텔링)
- [ ] 표지 디자인 생성 (AI 이미지 생성)
- [ ] EPUB/DOCX 내보내기 완성
- [ ] 다국어 번역 (영문 → 한글, 한글 → 영문)

**DB 스키마**:
```sql
-- 책 정보
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'deleted'
  genre TEXT, -- '자기계발', '비즈니스', '소설', '에세이'
  language TEXT DEFAULT 'ko',
  word_count INTEGER DEFAULT 0,
  settings JSONB, -- AI 설정, 톤앤매너 등
  is_for_sale BOOLEAN DEFAULT FALSE,
  price INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 챕터 정보
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- 마크다운
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, order_index)
);

-- 버전 히스토리
CREATE TABLE book_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL, -- 전체 책 데이터 스냅샷
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 협업 작가
CREATE TABLE book_collaborators (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL DEFAULT 'editor', -- 'owner', 'co-author', 'editor', 'viewer'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  PRIMARY KEY (book_id, user_id)
);
```

---

### Phase 2: 마켓플레이스 (2-3개월)

#### 2.1 책 거래소

**핵심 기능**:
- [ ] 책 등록/판매 (가격 설정, 미리보기 제공)
- [ ] 검색 및 필터링 (장르, 가격, 평점)
- [ ] 책 상세 페이지 (미리보기, 리뷰, 작가 정보)
- [ ] 구매 및 다운로드 시스템
- [ ] 리뷰 및 평점 시스템
- [ ] 베스트셀러 / 신간 / 추천 알고리즘
- [ ] 위시리스트 / 구매 내역

**DB 스키마**:
```sql
-- 책 판매 정보
ALTER TABLE books ADD COLUMN preview_chapters INTEGER[] DEFAULT ARRAY[1]; -- 미리보기 챕터
ALTER TABLE books ADD COLUMN sample_pdf_url TEXT; -- 샘플 PDF

-- 구매 내역
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id),
  book_id UUID REFERENCES books(id),
  price_paid INTEGER NOT NULL,
  download_url TEXT, -- S3 presigned URL
  download_count INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리뷰
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- 위시리스트
CREATE TABLE wishlists (
  user_id UUID REFERENCES profiles(id),
  book_id UUID REFERENCES books(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);
```

**수익 분배 로직**:
```typescript
// 판매 시 수익 분배
const calculateRevenue = (salePrice: number, authorTier: string) => {
  const platformFee = {
    starter: 0.30,  // 30%
    creator: 0.15,  // 15%
    pro: 0.10,      // 10%
    master: 0.05    // 5%
  }[authorTier];

  const authorRevenue = salePrice * (1 - platformFee);
  return { authorRevenue, platformFee: salePrice - authorRevenue };
};
```

**UI 페이지**:
- `/marketplace` - 마켓플레이스 홈
- `/marketplace/book/:id` - 책 상세
- `/marketplace/search?q=...` - 검색 결과
- `/dashboard/my-books` - 내 책 관리
- `/dashboard/sales` - 판매 내역

---

#### 2.2 커뮤니티

**핵심 기능**:
- [ ] 게시판 (자유, 질문, 팁, 홍보)
- [ ] 작가 팔로우 시스템
- [ ] 피드백 요청 게시판 (초안 공유 → 댓글로 피드백)
- [ ] 챌린지 (30일 글쓰기 챌린지 등)
- [ ] 작가 랭킹 (판매량, 평점, 활동도)
- [ ] 알림 시스템 (팔로우, 댓글, 좋아요)

**DB 스키마**:
```sql
-- 게시글
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL, -- 'discussion', 'question', 'showcase', 'feedback'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 댓글
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id), -- 대댓글
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 팔로우
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- 알림
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'follow', 'comment', 'like', 'purchase', 'review'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI 페이지**:
- `/community` - 커뮤니티 홈
- `/community/:category` - 카테고리별 게시판
- `/community/post/:id` - 게시글 상세
- `/authors/:username` - 작가 프로필
- `/dashboard/notifications` - 알림 센터

---

### Phase 3: 관리자 대시보드 (1-2개월)

#### 3.1 분석 대시보드

**핵심 지표 (AARRR)**:

**Acquisition (유입)**:
- 일별/주별/월별 신규 가입자 수
- 유입 채널별 분석 (검색, 소셜, 직접 유입)
- 랜딩 페이지 전환율

**Activation (활성화)**:
- 첫 책 생성 완료율
- 온보딩 완료율 (프로필 설정, 첫 AI 생성)
- 첫 24시간 내 행동 분석

**Retention (재방문)**:
- D1, D7, D30 리텐션율
- 코호트 분석 (가입 월별 리텐션)
- 주간 활성 사용자(WAU), 월간 활성 사용자(MAU)

**Revenue (수익)**:
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- 구독 전환율 (Free → Paid)
- 책 판매 수익 (거래액, 수수료)
- LTV (Lifetime Value) 예측

**Referral (추천)**:
- 추천 링크 클릭/가입 수
- 바이럴 계수 (K-factor)
- 소셜 공유 횟수

**DB 스키마**:
```sql
-- 이벤트 로깅
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  event_name TEXT NOT NULL,
  event_category TEXT,
  properties JSONB,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일별 집계
CREATE TABLE daily_stats (
  date DATE PRIMARY KEY,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  books_created INTEGER DEFAULT 0,
  books_published INTEGER DEFAULT 0,
  books_sold INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  avg_generation_time INTERVAL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 코호트 분석 뷰
CREATE MATERIALIZED VIEW cohort_retention AS
SELECT
  DATE_TRUNC('month', created_at) as cohort_month,
  user_id,
  DATE_TRUNC('month', last_active_at) as activity_month
FROM profiles;
```

**대시보드 UI**:
- `/admin` - 관리자 홈 (핵심 지표 한눈에)
- `/admin/analytics` - 상세 분석
- `/admin/users` - 사용자 관리
- `/admin/books` - 콘텐츠 관리
- `/admin/payments` - 결제 관리
- `/admin/reports` - 리포트 생성

**시각화 라이브러리**:
- Recharts 또는 Chart.js (그래프)
- React-Table (테이블)
- Date-fns (날짜 처리)

---

#### 3.2 운영 도구

**기능**:
- [ ] 사용자 검색 및 상세 정보
- [ ] 사용자 정지/복구 (어뷰징 대응)
- [ ] 책 검토 및 숨김 처리 (신고 대응)
- [ ] 결제 수동 처리 (환불, 크레딧 지급)
- [ ] 공지사항 작성
- [ ] 이메일 발송 (마케팅, 공지)
- [ ] 쿠폰 생성 및 관리

**DB 스키마**:
```sql
-- 관리자 권한
CREATE TABLE admin_roles (
  user_id UUID REFERENCES profiles(id),
  role TEXT NOT NULL, -- 'super_admin', 'moderator', 'support'
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- 신고
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL, -- 'book', 'post', 'comment', 'user'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 쿠폰
CREATE TABLE coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value INTEGER NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applicable_to TEXT, -- 'subscription', 'book_purchase', 'all'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 4: 고급 기능 (3-6개월)

#### 4.1 팀/기업 기능
- 팀 워크스페이스 (여러 작가 관리)
- 브랜드 템플릿 (회사 CI/CD 적용)
- API 접근 (자동화)
- SSO (Single Sign-On)

#### 4.2 AI 고도화
- 멀티모달 생성 (텍스트 + 이미지)
- 음성 생성 (오디오북 자동 제작)
- 스타일 학습 (작가 고유 톤 학습)
- 챗봇 편집 어시스턴트

#### 4.3 모바일 앱
- React Native 또는 Flutter
- 오프라인 읽기
- 푸시 알림

---

## 비즈니스 모델

### 수익 구조

1. **구독 수익** (70% 예상)
   - Creator: ₩9,900/월 × 1,000명 = ₩9,900,000
   - Pro: ₩29,900/월 × 200명 = ₩5,980,000
   - 월 예상: **₩15,880,000**

2. **거래 수수료** (25% 예상)
   - 평균 책 가격: ₩5,000
   - 월 거래량: 1,000건
   - 평균 수수료: 15%
   - 월 예상: **₩750,000**

3. **기타** (5% 예상)
   - 크레딧 판매
   - 광고 수익
   - 기업 컨설팅

**1년차 목표**:
- 유료 사용자: 1,500명
- 월 거래량: 2,000건
- **월 매출: ₩20,000,000**
- **연 매출: ₩240,000,000**

---

## 기술 스택 및 아키텍처

### 현재 스택 (유지)
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Hosting**: Vercel

### 추가 도입 필요
- **결제**: 토스페이먼츠 v2
- **파일 스토리지**: Supabase Storage 또는 AWS S3
- **이메일**: Resend 또는 SendGrid
- **모니터링**: Sentry (에러 추적), Vercel Analytics
- **큐 시스템**: Vercel Cron 또는 Inngest (장기 AI 작업)
- **검색**: PostgreSQL Full-Text Search 또는 Algolia
- **캐싱**: Vercel Edge Config 또는 Redis

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────┐
│                   사용자 (웹/모바일)                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Next.js (Vercel)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  App Router │  │  API Routes  │  │  Middleware│ │
│  │   (SSR)     │  │   (서버리스)  │  │   (Auth)   │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└───────┬──────────────────┬──────────────────┬───────┘
        │                  │                  │
┌───────▼────────┐ ┌──────▼─────────┐ ┌──────▼────────┐
│   Supabase     │ │  AI Services   │ │ 토스페이먼츠   │
│  (PostgreSQL)  │ │ - OpenAI       │ │  (결제)       │
│  - Auth        │ │ - Anthropic    │ └───────────────┘
│  - Storage     │ │ - Replicate    │
│  - Realtime    │ └────────────────┘
└────────────────┘
```

---

## 개발 우선순위 및 일정

### Sprint 1-2: 인증 및 기본 CRUD (2주)
- [ ] Supabase Auth 설정 (이메일, 소셜 로그인)
- [ ] 프로필 관리 페이지
- [ ] 책 저장/불러오기 DB 연동
- [ ] 기본 대시보드 레이아웃

### Sprint 3-4: 결제 시스템 (2주)
- [ ] 토스페이먼츠 연동
- [ ] 구독 플랜 선택 UI
- [ ] 크레딧 차감 로직
- [ ] 결제 내역 페이지

### Sprint 5-6: 책 생성 고도화 (2주)
- [ ] 표지 디자인 생성
- [ ] 버전 히스토리
- [ ] 협업 기능 (초대/권한)
- [ ] EPUB/DOCX 내보내기

### Sprint 7-8: 마켓플레이스 MVP (2주)
- [ ] 책 등록/판매 기능
- [ ] 검색 및 필터링
- [ ] 구매/다운로드 시스템
- [ ] 리뷰 시스템

### Sprint 9-10: 커뮤니티 기초 (2주)
- [ ] 게시판 CRUD
- [ ] 댓글 시스템
- [ ] 팔로우 기능
- [ ] 알림 시스템

### Sprint 11-12: 관리자 대시보드 (2주)
- [ ] 핵심 지표 대시보드
- [ ] 사용자/콘텐츠 관리
- [ ] 신고 처리 시스템
- [ ] 코호트 분석

### Sprint 13-14: 테스트 및 최적화 (2주)
- [ ] E2E 테스트 작성
- [ ] 성능 최적화 (이미지, 코드 스플리팅)
- [ ] SEO 최적화
- [ ] 버그 수정

**총 개발 기간: 3-4개월**

---

## 성장 전략

### 론칭 전 (Pre-Launch)
1. **베타 테스터 모집** (100명)
   - 인디 작가, 블로거 커뮤니티에서 모집
   - 피드백 수집 → 제품 개선
   - 얼리 어답터 할인 (평생 50% 할인)

2. **SEO 준비**
   - 블로그 콘텐츠 작성 (AI 글쓰기 팁, 전자책 제작 가이드)
   - 키워드 리서치 (전자책 만들기, AI 글쓰기 등)

3. **SNS 빌드업**
   - 인스타그램, X(트위터)에서 제작 과정 공유
   - #IndieAuthor #작가 #전자책 해시태그 활용

### 론칭 초기 (Month 1-3)
1. **Product Hunt 런칭**
   - 해외 시장 진출 (영문 버전)
   - Indie Hackers, Reddit r/SideProject 홍보

2. **파트너십**
   - 브런치, 네이버 블로그 작가들과 협업
   - 온라인 강의 플랫폼 (인프런, 패스트캠퍼스) 제휴

3. **콘텐츠 마케팅**
   - "AI로 30분 만에 책 쓰기" 유튜브 튜토리얼
   - 성공 사례 인터뷰 시리즈

### 성장 단계 (Month 4-12)
1. **바이럴 루프 구축**
   - 추천 프로그램 (친구 초대 시 크레딧 지급)
   - 작가 프로필에 "Powered by AI Book Writer" 배지

2. **유료 광고**
   - 구글 검색 광고 (전자책 제작 관련 키워드)
   - 페이스북/인스타그램 타겟 광고

3. **커뮤니티 육성**
   - 월간 챌린지 (30일 글쓰기)
   - 오프라인 작가 밋업

---

## 위험 요소 및 대응

### 위험 1: AI 비용 급증
**대응**:
- 크레딧 시스템으로 사용량 제한
- 캐싱으로 중복 요청 방지
- 저가 모델(GPT-3.5, Claude Haiku) 우선 제공

### 위험 2: 저품질 콘텐츠 범람
**대응**:
- 판매 전 자동 품질 검수 (최소 단어 수, 표절 검사)
- 사용자 신고 시스템
- 평점 낮은 책 노출 제한

### 위험 3: 경쟁 서비스 출현
**대응**:
- **차별화**: 마켓플레이스 + 커뮤니티 결합 (단순 생성 도구 이상)
- **네트워크 효과**: 작가 커뮤니티가 강력한 해자(Moat)
- **데이터 우위**: 사용자 데이터로 AI 개인화

---

## 다음 액션 아이템

### 즉시 시작 (이번 주)
1. [ ] Supabase 프로젝트 설정 및 DB 스키마 생성
2. [ ] 토스페이먼츠 개발자 계정 생성 및 테스트 키 발급
3. [ ] 프로젝트 구조 리팩토링 (기능별 폴더 분리)
4. [ ] Git 브랜치 전략 수립 (main, dev, feature/*)

### 이번 달 목표
1. [ ] Phase 1 (인증 + 결제) 완료
2. [ ] 베타 테스터 50명 모집
3. [ ] 랜딩 페이지 개선 (전환율 최적화)

### 3개월 목표
1. [ ] MVP 완성 (마켓플레이스 포함)
2. [ ] 정식 런칭
3. [ ] 첫 100명 유료 사용자 확보

---

## 결론

AI Book Writer는 단순한 AI 글쓰기 도구를 넘어, **작가 경제(Creator Economy)를 활성화하는 플랫폼**으로 성장할 잠재력이 있습니다.

**핵심 성공 요인**:
1. **빠른 MVP 출시**: 3-4개월 내 핵심 기능 완성
2. **커뮤니티 우선**: 작가들이 모이는 이유 제공
3. **데이터 기반 의사결정**: 분석 대시보드로 지속 개선

**최종 비전**: "누구나 작가가 될 수 있는 세상" 🚀
