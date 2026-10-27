import { CanvasFactory, getData } from 'pdf-parse/worker'
import { PDFParse } from 'pdf-parse'

const MAX_FILE_BYTES = 20 * 1024 * 1024
const MAX_TEXT_CHARACTERS = 750_000

// This uses the parser's bundled worker rather than a Next.js-generated chunk.
PDFParse.setWorker(getData())

export class ReportTextError extends Error {
  constructor(message: string, public readonly status: 400 | 413 | 415 | 422) {
    super(message)
  }
}

async function extractPdfText(file: File): Promise<string> {
  const parser = new PDFParse({
    data: new Uint8Array(await file.arrayBuffer()),
    CanvasFactory,
  })

  try {
    const result = await parser.getText()
    return result.text.replace(/\u0000/g, '').trim()
  } finally {
    await parser.destroy()
  }
}

export async function extractReportText(file: File): Promise<string> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  const isText = file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')

  if (!isPdf && !isText) {
    throw new ReportTextError('Only PDF and plain-text reports are supported.', 415)
  }
  if (file.size === 0) {
    throw new ReportTextError('That report is empty. Choose a file with report content.', 400)
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ReportTextError('Reports must be 20 MB or smaller.', 413)
  }

  let text: string
  try {
    text = isPdf ? await extractPdfText(file) : (await file.text()).trim()
  } catch (error) {
    console.error('[report-text] Text extraction failed:', error)
    throw new ReportTextError('We could not extract readable text from that PDF. Please upload a text-based PDF or a plain-text export.', 422)
  }

  if (!text) {
    throw new ReportTextError('No readable text was found in that report.', 422)
  }
  if (text.length > MAX_TEXT_CHARACTERS) {
    throw new ReportTextError('The extracted report text is too long to process safely. Please upload a shorter export.', 413)
  }

  return text
}
