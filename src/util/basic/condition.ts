
enum FuncType {
  Asset,
  Target,
}

type AssetFunc = (n: any) => boolean
type TargetFunc = (n: any) => any

type FuncSequnce = {
  type: FuncType
  func: AssetFunc | TargetFunc
}

export class ConditionSet {
  // needFuncs: (AssetFunc)[] = []
  // targetFuncs: (TargetFunc)[] = []
  seq: FuncSequnce[] = []

  assert = <T_Src>(testFunc: (n: T_Src) => boolean) => {
    if (this._built) {
      throw new Error('can not add condition after built')
    }
    this.seq.push({
      type: FuncType.Asset,
      func: testFunc
    })
  }

  targetAssert = <T_Src, T_Dst>(targetFunc: (src: T_Src) => T_Dst, testFunc: (n: T_Dst) => boolean) => {
    if (this._built) {
      throw new Error('can not add condition after built')
    }
    this.seq.push({
      type: FuncType.Asset,
      func: (src) => testFunc(targetFunc(src))
    })
  }

  changeTarget = (targetFunc: (src: any) => any) => {
    if (this._built) {
      throw new Error('can not add condition after built')
    }
    this.seq.push({
      type: FuncType.Target,
      func: targetFunc
    })
  }

  _built = false
  build = () => {
    this._built = true
  }

  _target: any
  test = (n: any): boolean => {
    if (!this._built) {
      throw new Error('ConditionSet has not been built')
    }
    this._target = n
    for (const item of this.seq) {
      if (item.type == FuncType.Asset) {
        if (!item.func(this._target)) {
          return false
        }
      }
      else if (item.type == FuncType.Target) {
        this._target = item.func(this._target)
      }
    }
    return true
  }

  static makeTest<ST>(constructFunction: (cs: ConditionSet) => void): (n: ST) => boolean {
    const cs = new ConditionSet()
    constructFunction(cs)
    cs.build()
    return cs.test
  }
}