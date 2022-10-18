import { BPN, BPNType } from "./node";
import { BPS, BPSType } from "./slot";
import { BPSymbol, BPSymbolType } from "./symbol";

// class BuiltinNode {
//   symbol: BPSymbol
//   node: BPN
// }

class StringConatant extends BPSymbol {

  /**
   *
   */
  constructor() {
    super(
      'String',
      '',
      BPSymbolType.BP_BUILTIN,
      'create string constant'
    );
    this.alias = ['string']
  }

  override toBPN(): BPN {
    return new BPN(
      BPNType.BUILTIN,
      this.name,
      [
        new BPS(BPSType.LITERIAL, '', false),
        new BPS(BPSType.DATA, '', true)
      ]
    )
  }
}

export const builtins: BPSymbol[] = [
  new StringConatant()
]