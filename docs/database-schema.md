# AI Book Writer SaaS - Database Schema 설계안

## 개요
이 문서는 AI Book Writer SaaS 플랫폼의 Supabase 데이터베이스 스키마 설계안을 제시합니다.

---

## 설계안 1: 단순 구조 (MVP)

### 장점
- 구현이 간단하고 빠름
- 초기 개발에 적합
- 마이그레이션이 쉬움

### 단점
- 확장성이 제한적
- 복잡한 쿼리 어려움
- 데이터 중복 가능

### 테이블 구조

#### 1. `users` (Supabase Auth 기본 테이블 확장)
```sql
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `books`
```sql
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  topic TEXT NOT NULL,
  description TEXT,

  -- Settings (JSON으로 저장)
  settings JSONB DEFAULT '{
    "aiModel": "gpt-4.1-nano",
    "language": "ko",
    "tone": "professional",
    "targetAudience": "일반 독자"
  }'::jsonb,

  -- Chapters (JSON 배열로 저장)
  chapters JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'published')),
  total_words INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_books_user_id ON public.books(user_id);
CREATE INDEX idx_books_status ON public.books(status);
CREATE INDEX idx_books_created_at ON public.books(created_at DESC);
```

### JSONB chapters 구조 예시
```json
[
  {
    "number": 1,
    "title": "챕터 제목",
    "content": "챕터 내용...",
    "keyPoints": ["포인트1", "포인트2"],
    "estimatedWords": 2500,
    "ahaMoment": "핵심 인사이트",
    "isGenerated": true
  }
]
```

---

## 설계안 2: 정규화 구조 (추천)

### 장점
- 데이터 정규화로 중복 최소화
- 챕터별 독립적인 관리 가능
- 복잡한 쿼리와 분석 용이
- 버전 관리 가능

### 단점
- 조인 쿼리가 많아짐
- 구현 복잡도 증가

### 테이블 구조

#### 1. `user_profiles`
```sql
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 0,
  total_books_created INTEGER DEFAULT 0,
  total_chapters_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
```

#### 2. `books`
```sql
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Basic Info
  title TEXT NOT NULL,
  subtitle TEXT,
  topic TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  -- Settings
  ai_model TEXT DEFAULT 'gpt-4.1-nano',
  language TEXT DEFAULT 'ko' CHECK (language IN ('ko', 'en', 'ja', 'zh')),
  tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'casual', 'academic', 'creative')),
  target_audience TEXT DEFAULT '일반 독자',

  -- Status & Progress
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'published', 'archived')),
  total_chapters INTEGER DEFAULT 0,
  generated_chapters INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  last_generated_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_books_user_id ON public.books(user_id);
CREATE INDEX idx_books_status ON public.books(status);
CREATE INDEX idx_books_created_at ON public.books(created_at DESC);
```

#### 3. `chapters`
```sql
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,

  -- Chapter Info
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,

  -- Metadata
  estimated_words INTEGER DEFAULT 2500,
  actual_words INTEGER DEFAULT 0,
  aha_moment TEXT,

  -- Status
  is_generated BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  generation_prompt TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_at TIMESTAMP WITH TIME ZONE,

  -- Unique constraint
  UNIQUE(book_id, number)
);

-- 인덱스
CREATE INDEX idx_chapters_book_id ON public.chapters(book_id);
CREATE INDEX idx_chapters_number ON public.chapters(book_id, number);
```

#### 4. `chapter_key_points`
```sql
CREATE TABLE public.chapter_key_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  point_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_key_points_chapter_id ON public.chapter_key_points(chapter_id);
```

#### 5. `generation_history` (선택사항 - 로깅용)
```sql
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,

  -- Generation Details
  generation_type TEXT CHECK (generation_type IN ('outline', 'chapter', 'regenerate')),
  ai_model TEXT NOT NULL,
  prompt_text TEXT,

  -- Tokens & Cost
  tokens_used INTEGER,
  estimated_cost DECIMAL(10, 6),

  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);
```

---

## 설계안 3: 하이브리드 구조 (확장성 + 성능)

### 장점
- 정규화와 비정규화의 균형
- 빠른 조회 성능
- 유연한 확장 가능

### 단점
- 데이터 동기화 필요
- 복잡도가 높음

### 테이블 구조

설계안 2의 모든 테이블 + 추가 테이블:

#### 추가: `book_snapshots` (캐싱용)
```sql
CREATE TABLE public.book_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,

  -- Denormalized Data (빠른 조회용)
  full_data JSONB NOT NULL, -- 전체 책 데이터 (chapters 포함)

  -- Metadata
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Latest snapshot per book
  UNIQUE(book_id, version)
);

CREATE INDEX idx_snapshots_book_id ON public.book_snapshots(book_id);
```

#### 추가: `exports` (내보내기 기록)
```sql
CREATE TABLE public.exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,

  -- Export Details
  format TEXT CHECK (format IN ('pdf', 'epub', 'docx', 'markdown')),
  file_url TEXT,
  file_size_bytes BIGINT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_exports_user_id ON public.exports(user_id);
CREATE INDEX idx_exports_book_id ON public.exports(book_id);
```

---

## Row Level Security (RLS) 정책

모든 테이블에 RLS 적용 권장:

```sql
-- 1. Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- 2. 사용자는 자신의 책만 조회/수정 가능
CREATE POLICY "Users can view own books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Chapters는 book의 소유자만 접근 가능
CREATE POLICY "Users can view own chapters"
  ON public.chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify own chapters"
  ON public.chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );
```

---

## 함수 및 트리거

### 1. updated_at 자동 갱신
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. 챕터 수 자동 업데이트
```sql
CREATE OR REPLACE FUNCTION update_book_chapter_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET
    total_chapters = (
      SELECT COUNT(*) FROM public.chapters WHERE book_id = NEW.book_id
    ),
    generated_chapters = (
      SELECT COUNT(*) FROM public.chapters
      WHERE book_id = NEW.book_id AND is_generated = TRUE
    ),
    total_words = (
      SELECT COALESCE(SUM(actual_words), 0)
      FROM public.chapters WHERE book_id = NEW.book_id
    )
  WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_stats_on_chapter_change
  AFTER INSERT OR UPDATE OR DELETE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_book_chapter_count();
```

---

## 마이그레이션 순서

### Phase 1: 기본 테이블 생성
1. `user_profiles`
2. `books`
3. RLS 정책 적용

### Phase 2: 정규화 (선택)
4. `chapters`
5. `chapter_key_points`
6. 트리거 및 함수 생성

### Phase 3: 확장 기능
7. `generation_history`
8. `exports`
9. `book_snapshots`

---

## 권장사항

### 초기 MVP (1-2주)
- **설계안 1 (단순 구조)** 사용
- localStorage → Supabase 마이그레이션
- 빠른 출시에 집중

### 프로덕션 준비 (1-2개월)
- **설계안 2 (정규화 구조)** 로 전환
- 데이터 마이그레이션 스크립트 작성
- RLS 정책 완전 구현

### 스케일업 단계 (3개월+)
- **설계안 3 (하이브리드)** 로 확장
- 성능 최적화
- 분석 및 로깅 강화

---

## 쿼리 예시

### 설계안 1 (단순)
```typescript
// 책 목록 조회
const { data: books } = await supabase
  .from('books')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// 책 저장
const { data } = await supabase
  .from('books')
  .upsert({
    id: bookId,
    user_id: userId,
    title: outline.title,
    chapters: outline.chapters
  })
```

### 설계안 2 (정규화)
```typescript
// 책과 챕터 함께 조회
const { data: book } = await supabase
  .from('books')
  .select(`
    *,
    chapters (
      *,
      chapter_key_points (*)
    )
  `)
  .eq('id', bookId)
  .single()

// 챕터 생성
const { data: chapter } = await supabase
  .from('chapters')
  .insert({
    book_id: bookId,
    number: 1,
    title: '챕터 제목',
    content: '내용...'
  })
  .select()
  .single()
```

---

## 다음 단계

1. 어떤 설계안을 선택할지 결정
2. Supabase 프로젝트에서 SQL 실행
3. TypeScript 타입 정의 생성
4. API 라우트에서 localStorage → Supabase 전환
5. 데이터 마이그레이션 도구 개발 (필요시)

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL JSON/JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
