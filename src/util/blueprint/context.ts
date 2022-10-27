import { shell } from "../logger"
import { BPLInstance, BPLType } from "./link"
import { BPN, BPNInstance, BPNType } from "./node"
import { BPSInstance, BPSType } from "./slot"
import { flatten } from 'lodash'
import { BPDInstance } from "./data"

export class BPCtx {

  name: string

  /**
   *
   */
  constructor(name: string) {
    this.name = name
  }

  locals: BPDInstance[] = []

  /**
   * 
   * 关于节点
   * 
   */
  nodes: BPNInstance[] = []

  get functionNodes(): Readonly<BPNInstance[]> {
    return this.nodes.filter(x => x.config.type == BPNType.FUNCTION)
  }

  get importantProcessNodes(): Readonly<BPNInstance[]> {
    return this.nodes.filter(x => x.config.type == BPNType.IMPORTANT_PROCESS)
  }

  static fromFunction(node: BPN) {
    const sePair = BPN.makeSEPair(node)
    
    const ctx = new BPCtx(node.name)
    
    const starti = new BPNInstance(sePair.start)
    starti.position = {x: 100, y: 100}

    const endi = new BPNInstance(sePair.end)

    endi.position = { x: 100, y: 300 }
    
    ctx.nodes.push(starti)
    ctx.nodes.push(endi)

    return ctx
  }


  /**
   * 
   * 关于连接
   * 
   */
  _links = [] as BPLInstance[]
  pendingLink = null as (null | BPLInstance)

  get links(): BPLInstance[] {
    if (!this.pendingLink) {
      return this._links
    }
    return this._links.concat(this.pendingLink)
  }

  removeLink(link: BPLInstance) {
    const index = this._links.indexOf(link)
    if (index < 0) {
      console.error('没有找到指定的link')
      return
    }
    this._links.splice(index, 1)
  }

  clickSlot(bpsi: BPSInstance) {
    if (!this.pendingLink) {
      this.pendingLink = new BPLInstance(BPLType.LINE, bpsi, { x: 100, y: 100 })
    }
    else {
      this._links.push(new BPLInstance(BPLType.LINE, bpsi, this.pendingLink.from))
      this.pendingLink = null
    }
    // this._links.push()
  }

  static fromObj(o: any): BPCtx {
    if (!o.name || !o.nodes || !o._links) {
      shell.error(`attr lost: ${o}`, 'BPCtx.fromObj')
    }
    const ctx = new BPCtx(o.name)
    ctx.nodes = o.nodes.map((x: any) => BPNInstance.fromObj(x))

    
    ctx._links = o._links.map((x: any) => BPLInstance.fromObj(x))

    // remaping: 重新将links中使用的slot改换回nodes中的，否则移动node将不会自动移动link
    let allslot: BPSInstance[] = []
    // const allslot = flatten(ctx.nodes.map(n => n.slots))
    for(const node of ctx.nodes) {
      for (const slot of node.slots) {
        allslot.push(slot)
        if (slot.config.type == BPSType.AUTO_LIST) {
          for (const subslot of slot.sub) {
            allslot.push(subslot)
          }
        }
      }
    }

    for (const link of ctx._links) {
      for (const slot of allslot) {
        if (link.from.id == slot.id) {
          link.from = slot
        }
        if ((link.to as BPSInstance).id == slot.id) {
          link.to = slot
        }
      }
    }

    return ctx
  }
}

