import { sequenceName } from "../name-tool";
import { shell } from "../shell/shell";
import { BPCtx } from "./context";
import { BPDType } from "./data";
import { BPN } from "./node";

// Blueprint Class
export class BPC {
  name: string

  members: BPDType[]
  functions: BPN[]

  constructor(name: string, members: BPDType[], functions: BPN[]) {
    this.name = name
    this.members = members
    this.functions = functions
  }

  newFunctionName(): string {
    return sequenceName(this.functions.map(x => x.name), 'function')
  }

  static fromObj(o: any): BPC {
    if (!o.name || !o.members || !o.functions) {
      shell.error('attr lost', 'BPC.fromObj')
    }
    const bpc = new BPC(o.name, o.members, o.functions.map((x: any) => BPN.fromObj(x)))
    return bpc
  }
}

export class BPCI {
  config: BPC
  contexts: BPCtx[] = []

  constructor(config: BPC) {
    this.config = config
  }

  static fromObj(o: any): BPCI {
    console.log(o);
    if (!o.config || !o.contexts) {
      shell.error('attr lost', 'BPCI.fromObj')
    }
    const bpci = new BPCI(BPC.fromObj(o.config))
    for (const item of o.contexts) {
      bpci.contexts.push(BPCtx.fromObj(item))
    }
    return bpci
  }
}