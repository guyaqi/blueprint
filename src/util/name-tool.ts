

export function randomName(prefix?: string, postfix?: string): string {
  return `${prefix?prefix:''}${Math.random().toString(36).slice(-8)}${postfix?postfix:''}`
}

export function sequenceName(seq: string[], prefix?: string, postfix?: string): string {
  for (let i=0;i<seq.length+2;i++) {
    const name = `${prefix?prefix:''}${i+1}${postfix?postfix:''}`
    if(!seq.includes(name)) {
      return name
    }
  }
  throw new Error(`sequenceNaming failed seq: ${seq} prefix: ${prefix} postfix: ${postfix}`)
}