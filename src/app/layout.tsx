import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "AI Book Writer - AI로 전자책 만들기",
  description: "GPT-4와 Claude를 활용한 AI 전자책 생성 플랫폼. 주제만 입력하면 AI가 자동으로 목차를 생성하고 각 챕터를 작성합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
