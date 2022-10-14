// 蓝图节点的插槽

import { randomName } from "../naming"
import { shell } from "../logger"
import { BPDType } from "./data"
import { Point } from "./math"

export enum BPSType {
  // Empty,
  PROCESS,
  DATA,
  LITERIAL
}

export class BPS {
  type: BPSType
  name: string
  isOut: boolean

  // when type == BPSType.DATA
  dataType?: BPDType

  constructor(type: BPSType, name: string, isOut: boolean, dataType?: BPDType) {
    this.type = type
    this.name = name
    this.isOut = isOut
    this.dataType = dataType
  }

  static makeProcessIOPair(): BPS[] {
    return [
      new BPS(BPSType.PROCESS, '', false),
      new BPS(BPSType.PROCESS, '', true),
    ]
  }

  static fromObj(o: any): BPS {
    if (o.type === undefined || o.name === undefined || o.isOut === undefined) {
      shell.error(`attr lost: ${JSON.stringify(o)}`, 'BPS.fromObj')
    }
    const s = new BPS(o.type, o.name, o.isOut, o.dataType)
    return s
  }
}

export class BPSInstance {
  config: BPS

  position: Point = { x: 0, y: 0 }

  id: string = randomName('bpsi-')

  constructor(config: BPS) {
    this.config = config
  }

  static fromObj(o: any): BPSInstance {
    if (o.config === undefined || o.position === undefined || o.id === undefined) {
      shell.error('attr lost', 'BPSInstance.fromObj')
    }
    const i = new BPSInstance(BPS.fromObj(o.config))
    i.position = o.position
    i.id = o.id
    return i
  }
}
