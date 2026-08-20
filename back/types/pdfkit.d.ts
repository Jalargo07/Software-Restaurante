declare module 'pdfkit' {
  import { EventEmitter } from 'events'

  interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify'
    width?: number
    height?: number
    columns?: number
    columnGap?: number
    indent?: number
    paragraphGap?: number
    lineGap?: number
    wordSpacing?: number
    characterSpacing?: number
    fill?: boolean
    stroke?: boolean
    link?: string
    underline?: boolean
    strike?: boolean
    oblique?: boolean | number
    baseline?: number | 'svg-middle' | 'middle' | 'svg-central' | 'bottom' | 'ideographic' | 'alphabetic' | 'mathematical' | 'top' | 'hanging'
    continued?: boolean
    document?: any
  }

  interface DocumentInfo {
    Title?: string
    Author?: string
    Subject?: string
    Keywords?: string
    CreationDate?: Date
    ModDate?: Date
  }

  interface PDFDocumentOptions {
    autoFirstPage?: boolean
    bufferPages?: boolean
    compress?: boolean
    info?: DocumentInfo
    margin?: number
    size?: string | [number, number]
    layout?: 'portrait' | 'landscape'
  }

  class PDFDocument extends EventEmitter {
    constructor(options?: PDFDocumentOptions)
    pipe(destination: NodeJS.WritableStream): this
    fontSize(size: number): this
    text(text: string, options?: TextOptions): this
    text(text: string, x: number, y: number): this
    text(text: string, x: number, y: number, options: TextOptions): this
    moveDown(): this
    moveTo(x: number, y: number): this
    lineTo(x: number, y: number): this
    stroke(): this
    addPage(options?: any): this
    end(): void
    output(options?: any): any
  }

  export = PDFDocument
}
