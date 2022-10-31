import { shell } from "../logger";
import { Point } from "./math";
import { BPSInstance } from "./slot";

export enum BPLType {
  LINE,
  CURVE,
}

export class BPLInstance {
  type: BPLType
  from: BPSInstance

  // 画完的线to是BPSInstance，正在画是Point
  to: (BPSInstance | Point)

  constructor(type: BPLType, from: BPSInstance, to: BPSInstance | Point) {
    this.type = type
    this.from = from
    this.to = to
  }

  get pathString() {
    
    if (this.type == BPLType.LINE) {
      const p1 = this.from.position
      const p2 = this.to instanceof BPSInstance ? this.to.position : this.to
      return `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`
    }
    else {
      throw new Error('unspported BPLType')
    }
  }

  static fromObj(o: any): BPLInstance {
    if (o.type === undefined || o.from === undefined || o.to === undefined) {
      shell.error('attr lost', 'BPLInstance.fromObj')
    }
    const i = new BPLInstance(o.type, BPSInstance.fromObj(o.from), BPSInstance.fromObj(o.to))
    return i
  }
}