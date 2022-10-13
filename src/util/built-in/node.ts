import { BPN, BPNType } from "../blueprint/node";
import { BPS, BPSType } from "../blueprint/slot";

export const makeSEPair = (nodeOfFunc: BPN) => {
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