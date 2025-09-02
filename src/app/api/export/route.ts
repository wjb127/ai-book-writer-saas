import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { outline, format } = await request.json()

    if (!outline || !format) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // PDF 생성 (간단한 예제)
    if (format === 'pdf') {
      const pdf = new jsPDF()
      const pageHeight = pdf.internal.pageSize.height
      const pageWidth = pdf.internal.pageSize.width
      const margin = 20
      const lineHeight = 7
      let yPosition = margin

      // 타이틀 페이지
      pdf.setFontSize(24)
      pdf.text(outline.title, pageWidth / 2, 50, { align: 'center' })
      pdf.setFontSize(12)
      pdf.text('AI Book Writer로 생성됨', pageWidth / 2, 70, { align: 'center' })
      pdf.addPage()

      // 목차
      yPosition = margin
      pdf.setFontSize(18)
      pdf.text('목차', margin, yPosition)
      yPosition += lineHeight * 2

      pdf.setFontSize(12)
      outline.chapters.forEach((chapter: any) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(`${chapter.number}. ${chapter.title}`, margin, yPosition)
        yPosition += lineHeight
      })

      pdf.addPage()

      // 각 챕터 내용
      outline.chapters.forEach((chapter: any) => {
        if (chapter.content) {
          pdf.addPage()
          yPosition = margin
          
          // 챕터 제목
          pdf.setFontSize(16)
          const titleLines = pdf.splitTextToSize(`Chapter ${chapter.number}: ${chapter.title}`, pageWidth - margin * 2)
          titleLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(line, margin, yPosition)
            yPosition += lineHeight * 1.5
          })
          
          yPosition += lineHeight

          // 챕터 내용
          pdf.setFontSize(11)
          const contentLines = pdf.splitTextToSize(
            chapter.content.replace(/[#*`]/g, '').replace(/\n\n/g, '\n'), 
            pageWidth - margin * 2
          )
          
          contentLines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(line, margin, yPosition)
            yPosition += lineHeight
          })
        }
      })

      // PDF를 Blob으로 변환
      const pdfBlob = pdf.output('blob')
      
      return new NextResponse(pdfBlob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${outline.title}.pdf"`
        }
      })
    }

    // EPUB, DOCX 등 다른 형식은 추가 구현 필요
    if (format === 'epub' || format === 'docx') {
      return NextResponse.json(
        { error: `${format.toUpperCase()} 형식은 준비 중입니다` },
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