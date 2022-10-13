// import { Component } from "vue"
import moment from 'moment'
import HtmlLine from '../../components/Shell/HtmlLine.vue'

const urlMatcher = /(\s|^)[^\s]+:\/\/[^\s]+(\s|$)/

type logHandler = (log: ComponentInstance[]) => void

export type ComponentInstance = {
  component: string,
  props: any
}

export class Shell {
  lines = [] as ComponentInstance[]

  handlers = [] as logHandler[]

  private _dispath() {
    for (const handler of this.handlers) {
      handler(this.lines)
    }
  }
  
  logText(text:string) {
    const html = this.logTextToHtmlLine(text)
    this.lines.push({
      component: 'HtmlLine',
      props: { html, }
    })
    this._dispath()
  }

  debug(text: string, from?: string) {
    const txt = `${moment().format("YYYY-MM-DD HH:mm:ss")} - [DEBUG]${ from ? ` - ${from}` : '' } - ${text}`
    this.lines.push({
      component: 'HtmlLine',
      props: { html: txt, }
    })
    this._dispath()
  }

  error(text: string, from?: string) {
    const txt = `${moment().format("YYYY-MM-DD HH:mm:ss")} - [ERROR]${ from ? ` - ${from}` : '' } - ${text}`
    this.lines.push({
      component: 'HtmlLine',
      props: { html: txt, style: { 'color': 'crimson' } }
    })
    this._dispath()
  }
  

  onLog(handler: logHandler) {
    this.handlers.push(handler)
    // handler(this.lines)
  }

  
  private logTextToHtmlLine(text: string): string {
    if (typeof(text) != 'string') {
      return `logTextToHtmlLine can only output string, you provide\n================================\n${text}\n================================\n`
    }
    let result = ''
    let restIndex = 0

    const maxLoop = 100
    let loopTime = 0
    while (restIndex < text.length && loopTime < maxLoop) {
      const rest = text.slice(restIndex)
      
      // find url
      const match = rest.match(urlMatcher)
      const breakIndex = match?.index

      // find
      if (match !== null && breakIndex !== undefined) {
        const preText = text.slice(restIndex, restIndex+breakIndex)
        result += preText
        const url = match[0].trim()
        result += ` <a href="${url}" target="_blank">${url}</a> `
        restIndex = restIndex+breakIndex+match[0].length
      }
      else {
        result += text.slice(restIndex)
        restIndex = text.length
      }

      loopTime += 1
    }

    if (loopTime >= maxLoop) {
      console.error('Shell: max loop exceeded in textToHtml')
      return text
    }

    return result
  }
}

export const shell = new Shell()