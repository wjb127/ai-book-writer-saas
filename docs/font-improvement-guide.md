# 폰트 개선 방안

AI Book Writer SaaS의 폰트를 개선하여 더 전문적이고 읽기 편한 UI를 만들기 위한 방안입니다.

## 현재 상태
- **기본 폰트**: Tailwind CSS 기본 시스템 폰트 스택 사용
- **문제점**:
  - 한글 가독성이 떨어질 수 있음
  - 브랜드 아이덴티티가 약함
  - 영문/한글 폰트 혼용 시 일관성 부족

---

## 방안 1: Google Fonts (무료, 추천)

### 추천 폰트 조합

#### 옵션 A: 모던하고 전문적인 느낌
- **한글**: Noto Sans KR (400, 500, 700)
- **영문/숫자**: Inter (400, 500, 600, 700)
- **특징**: 깔끔하고 현대적, 가독성 우수, 다국어 지원

#### 옵션 B: 친근하고 세련된 느낌
- **한글**: Pretendard (400, 500, 700)
- **영문/숫자**: Inter (400, 500, 600, 700)
- **특징**: 한국어에 최적화, 부드러운 곡선, 기술 스타트업 선호

#### 옵션 C: 고급스럽고 우아한 느낌
- **한글**: Noto Serif KR (400, 500, 700)
- **영문/숫자**: Playfair Display (400, 600, 700)
- **특징**: 전자책/출판 느낌, 클래식하고 신뢰감 있음

### 구현 방법
```typescript
// app/layout.tsx
import { Inter, Noto_Sans_KR } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap'
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

```css
/* globals.css */
@layer base {
  * {
    font-family: var(--font-noto-sans), var(--font-inter), system-ui, sans-serif;
  }
}
```

**장점:**
- ✅ 무료
- ✅ CDN 최적화
- ✅ Next.js 네이티브 지원
- ✅ 다양한 웨이트 선택 가능

**단점:**
- ❌ 초기 로딩 시 폰트 다운로드 필요
- ❌ FOUT(Flash of Unstyled Text) 가능성

---

## 방안 2: Pretendard (한국형 폰트, 강력 추천)

### 특징
- 한국 개발자가 만든 한글 최적화 폰트
- 시스템 폰트 느낌의 가독성
- Variable Font 지원으로 용량 최적화
- 많은 한국 스타트업이 사용

### 구현 방법

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '400 700'
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

**다운로드:**
https://github.com/orioncactus/pretendard

**장점:**
- ✅ 한글 가독성 최고
- ✅ Variable Font로 용량 최적화
- ✅ 라이선스 자유로움
- ✅ 전문적이고 모던한 느낌

**단점:**
- ❌ 수동 다운로드 필요
- ❌ 영문은 별도 폰트 필요

---

## 방안 3: 시스템 폰트 스택 최적화 (가장 빠름)

### 구현 방법

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'sans-serif'
        ]
      }
    }
  }
}
```

**장점:**
- ✅ 로딩 시간 0초
- ✅ 각 OS에 최적화된 폰트 사용
- ✅ 추가 리소스 불필요

**단점:**
- ❌ 기기별로 폰트가 다름
- ❌ 브랜드 일관성 부족

---

## 방안 4: 웹폰트 자체 호스팅 (고급)

### CDN 없이 직접 호스팅

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    {
      path: './fonts/CustomFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CustomFont-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/CustomFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
})
```

**장점:**
- ✅ 최고의 성능 (같은 도메인)
- ✅ 외부 의존성 없음
- ✅ 완벽한 컨트롤

**단점:**
- ❌ 초기 설정 복잡
- ❌ 폰트 파일 용량 관리 필요

---

## 추천 조합

### 🏆 최종 추천: Pretendard + Inter

```bash
# 1. Pretendard 다운로드
# https://github.com/orioncactus/pretendard/releases

# 2. public/fonts/ 폴더에 저장
```

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '400 700'
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

```css
/* app/globals.css */
@layer base {
  * {
    font-family: var(--font-pretendard), var(--font-inter), system-ui, sans-serif;
  }

  /* 숫자는 Inter 사용 (더 읽기 쉬움) */
  .font-numeric {
    font-family: var(--font-inter), system-ui, sans-serif;
    font-variant-numeric: tabular-nums;
  }
}
```

### 사용 예시

```tsx
<h1 className="font-sans">안녕하세요</h1>  {/* Pretendard */}
<p className="font-numeric">₩9,900</p>      {/* Inter, 숫자 정렬 */}
<code className="font-mono">code</code>     {/* 모노스페이스 */}
```

---

## 성능 최적화 팁

1. **Font Display 전략**
   - `swap`: 폰트 로딩 전 시스템 폰트 표시 (권장)
   - `optional`: 폰트 로딩 실패 시 시스템 폰트 사용
   - `block`: 폰트 로딩까지 텍스트 숨김 (비권장)

2. **Variable Font 사용**
   - 여러 웨이트를 하나의 파일로
   - 용량 50% 이상 절감

3. **서브셋 최적화**
   ```typescript
   const notoSansKR = Noto_Sans_KR({
     weight: ['400', '700'],
     subsets: ['latin'], // 또는 ['korean']
     display: 'swap',
     preload: true // 중요한 폰트는 preload
   })
   ```

4. **폰트 파일 압축**
   - WOFF2 포맷 사용 (WOFF보다 30% 작음)
   - Variable Font 우선 고려

---

## 구현 순서

1. ✅ Pretendard 다운로드 및 `/public/fonts/` 저장
2. ✅ `app/layout.tsx`에 폰트 로드 코드 추가
3. ✅ `tailwind.config.ts`에 폰트 패밀리 설정
4. ✅ `globals.css`에 기본 폰트 스타일 적용
5. ✅ 페이지별 테스트 및 조정
6. ✅ 성능 측정 (Lighthouse)

---

## 참고 자료

- Pretendard: https://github.com/orioncactus/pretendard
- Next.js Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Google Fonts: https://fonts.google.com
- Font Squirrel (웹폰트 생성기): https://www.fontsquirrel.com/tools/webfont-generator
