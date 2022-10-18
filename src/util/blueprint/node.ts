// 蓝图节点
import { randomName } from "../naming";
import { shell } from "../logger";
import { Point } from "./math";
import { BPS, BPSInstance, BPSType } from "./slot";

// Node

export enum BPNType {
  IMPORTANT_PROCESS,
  GETTER,
  FUNCTION,
  BUILTIN,
}

// config

export class BPN {
  type: BPNType
  name: string
  remark?: string
  slots: BPS[]
  options?: BPS[]

  constructor(type: BPNType, name: string, slots: BPS[], options?: BPS[]) {
    this.type = type
    this.name = name
    this.slots = slots
    this.options = options
  }

  static fromObj(o: any): BPN {
    if (o.type === undefined || o.name === undefined || o.slots === undefined) {
      shell.error('attr lost', 'BPN.fromObj')
    }
    const n = new BPN(o.type, o.name, o.slots.map((x: any) => BPS.fromObj(x)))
    n.remark = o.remark
    return n
  }

  static makeSEPair(nodeOfFunc: BPN){
    const start = new BPN(BPNType.IMPORTANT_PROCESS, 'Start', [
      new BPS(BPSType.PROCESS, '', true),
      ...nodeOfFunc.slots.filter(s => s.type == BPSType.DATA && !s.isOut).map(x => new BPS(BPSType.DATA, x.name, true))
    ])
    const end = new BPN(BPNType.IMPORTANT_PROCESS, 'End', [
      new BPS(BPSType.PROCESS, '', false),
      ...nodeOfFunc.slots.filter(s => s.type == BPSType.DATA && s.isOut).map(x => new BPS(BPSType.DATA, x.name, false))
    ])
    return { start, end }
  }
}

export class BPNInstance {
  config: BPN

  slots: BPSInstance[] = []

  position: Point = { x: 0, y: 0 }

  id: string = randomName('bpni-')

  constructor(config: BPN) {
    this.config = config
    for (const slotConfig of this.config.slots) {
      this.slots.push(new BPSInstance(slotConfig))
    }
  }

  get inslots(): Readonly<BPSInstance[]> {
    return this.slots.filter(x => !x.config.isOut)
  }

  get outslots(): Readonly<BPSInstance[]> {
    return this.slots.filter(x => x.config.isOut)
  }

  static fromObj(o: any): BPNInstance {
    if (o.config === undefined || o.slots === undefined || o.position === undefined || o.id === undefined) {
      shell.error('attr lost', 'BPNInstance.fromObj')
    }
    const i = new BPNInstance(BPN.fromObj(o.config))
    i.slots = o.slots.map((x: any) => BPSInstance.fromObj(x))
    i.position = o.position
    i.id = o.id
    return i
  }
}
