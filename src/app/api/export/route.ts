import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx'
import Epub from 'epub-gen-memory'
import fs from 'fs'
import path from 'path'

// 텍스트를 줄바꿈하는 헬퍼 함수
function wrapText(text: string, maxWidth: number, fontSize: number, font: PDFFont): string[] {
  const lines: string[] = []
  const paragraphs = text.split('\n')

  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) {
      lines.push('')
      return
    }

    const words = paragraph.split(' ')
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)

      if (width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }
  })

  return lines
}

export async function POST(request: NextRequest) {
  try {
    const { outline, format } = await request.json()

    if (!outline || !format) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // PDF 생성 (한글 지원)
    if (format === 'pdf') {
      // PDF 문서 생성
      const pdfDoc = await PDFDocument.create()

      // 한글 폰트 로드
      pdfDoc.registerFontkit(fontkit)
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NanumGothic-Regular.ttf')
      const fontBytes = fs.readFileSync(fontPath)
      const koreanFont = await pdfDoc.embedFont(fontBytes)

      const pageWidth = 595 // A4 width in points
      const pageHeight = 842 // A4 height in points
      const margin = 50
      const lineHeight = 20
      const maxWidth = pageWidth - margin * 2

      // 타이틀 페이지
      let page = pdfDoc.addPage([pageWidth, pageHeight])
      page.drawText(outline.title, {
        x: pageWidth / 2 - (outline.title.length * 12) / 2,
        y: pageHeight - 200,
        size: 24,
        font: koreanFont,
        color: rgb(0, 0, 0),
      })
      page.drawText('AI Book Writer로 생성됨', {
        x: pageWidth / 2 - 80,
        y: pageHeight - 240,
        size: 12,
        font: koreanFont,
        color: rgb(0.5, 0.5, 0.5),
      })

      // 목차 페이지
      page = pdfDoc.addPage([pageWidth, pageHeight])
      let yPosition = pageHeight - margin

      page.drawText('목차', {
        x: margin,
        y: yPosition,
        size: 18,
        font: koreanFont,
        color: rgb(0, 0, 0),
      })
      yPosition -= lineHeight * 2

      outline.chapters.forEach((chapter: any) => {
        if (yPosition < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          yPosition = pageHeight - margin
        }

        const tocLine = `${chapter.number}. ${chapter.title}`
        page.drawText(tocLine, {
          x: margin,
          y: yPosition,
          size: 12,
          font: koreanFont,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
      })

      // 각 챕터 내용
      outline.chapters.forEach((chapter: any) => {
        if (chapter.content) {
          page = pdfDoc.addPage([pageWidth, pageHeight])
          yPosition = pageHeight - margin

          // 챕터 제목
          const chapterTitle = `Chapter ${chapter.number}: ${chapter.title}`
          const titleLines = wrapText(chapterTitle, maxWidth, 16, koreanFont)

          titleLines.forEach((line: string) => {
            if (yPosition < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight])
              yPosition = pageHeight - margin
            }
            page.drawText(line, {
              x: margin,
              y: yPosition,
              size: 16,
              font: koreanFont,
              color: rgb(0, 0, 0),
            })
            yPosition -= lineHeight * 1.5
          })

          yPosition -= lineHeight

          // 챕터 내용 (마크다운 제거)
          const cleanContent = chapter.content
            .replace(/^#{1,6}\s+/gm, '') // 헤딩 제거
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold 제거
            .replace(/\*(.*?)\*/g, '$1') // Italic 제거
            .replace(/`(.*?)`/g, '$1') // Code 제거
            .replace(/^\s*[-*+]\s+/gm, '• ') // 리스트를 bullet point로
            .replace(/^\s*\d+\.\s+/gm, (match: string) => match) // 번호 리스트 유지

          const contentLines = wrapText(cleanContent, maxWidth, 11, koreanFont)

          contentLines.forEach((line: string) => {
            if (yPosition < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight])
              yPosition = pageHeight - margin
            }
            page.drawText(line, {
              x: margin,
              y: yPosition,
              size: 11,
              font: koreanFont,
              color: rgb(0, 0, 0),
            })
            yPosition -= lineHeight * 0.8
          })
        }
      })

      // PDF 저장
      const pdfBytes = await pdfDoc.save()

      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(outline.title)}.pdf"`
        }
      })
    }

    // DOCX 생성
    if (format === 'docx') {
      const sections = []

      // 타이틀 페이지
      sections.push(
        new Paragraph({
          text: outline.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: 'AI Book Writer로 생성됨',
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 }
        })
      )

      // 목차
      sections.push(
        new Paragraph({
          text: '목차',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      )

      outline.chapters.forEach((chapter: any) => {
        sections.push(
          new Paragraph({
            text: `${chapter.number}. ${chapter.title}`,
            spacing: { after: 100 }
          })
        )
      })

      // 각 챕터 내용
      outline.chapters.forEach((chapter: any) => {
        if (chapter.content) {
          // 챕터 제목
          sections.push(
            new Paragraph({
              text: `Chapter ${chapter.number}: ${chapter.title}`,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 }
            })
          )

          // 챕터 내용을 단락으로 나누기
          const paragraphs = chapter.content.split('\n\n')
          paragraphs.forEach((para: string) => {
            const cleanText = para.replace(/[#*`]/g, '').trim()
            if (cleanText) {
              sections.push(
                new Paragraph({
                  children: [new TextRun(cleanText)],
                  spacing: { after: 200 }
                })
              )
            }
          })
        }
      })

      const doc = new Document({
        sections: [{
          properties: {},
          children: sections
        }]
      })

      const buffer = await Packer.toBuffer(doc)

      return new NextResponse(Buffer.from(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(outline.title)}.docx"`
        }
      })
    }

    // EPUB 생성
    if (format === 'epub') {
      // EPUB 형식은 현재 개발 중입니다
      // 대신 DOCX를 사용해주세요
      return NextResponse.json(
        { error: 'EPUB 형식은 현재 준비 중입니다. PDF 또는 DOCX 형식을 사용해주세요.' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: '지원하지 않는 형식입니다' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: '내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}