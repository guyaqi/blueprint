type UnknowDataType = any

export interface BaseNode {

  // 显示的节点名称
  title: string

  // 子节点列表
  children?: BaseNode[]
}

type TreeReqHandler = (reqName: string, data: any) => void

export class Tree<T extends BaseNode> {
  title: string;
  children?: Tree<T>[];
  parent?: Tree<T>;

  inner: T

  constructor(node: T) {
    this.inner = node
    this.title = node.title
    
    if (node.children) {
      this.children = []
      for (const childNode of node.children as T[]) {
        const child = new Tree(childNode)
        child.parent = this
        this.children.push(child)
      }
    }
  }

  root(): (Tree<T> | undefined) {
    let current: (Tree<T> | undefined) = this
    const LIMIT = 100
    for(let i=0;i<LIMIT;i++) {
      if (!current || !current.parent) {
        break
      }
      current = current.parent

      if (i == LIMIT-1) {
        throw new Error('tree.root recursion LIMIT reached')
      }
    }

    return current
  }

  hierarchy(): Tree<T>[] {
    const path = [] as Tree<T>[]
    let current: (Tree<T> | undefined) = this

    path.push(current)

    while (current.parent != undefined) {
      current = current.parent
      path.push(current)
    }

    return path
  }

  child(name: string): Tree<T> | null {
    const a = this.children?.filter(x => x.title == name)
    if (!a || a.length == 0) {
      return null
    }
    return a[0]
  }

  isLeaf() {
    return this.children === undefined
  }

  tree(): string {
    let res = ''
    res += `${this.title}\n`

    const children = this.children || []

    for (let i=0; i<children.length; i++) {
      const child = children[i]
      const childResult = child.tree()
      let childResultLines = childResult.split('\n')
      if (childResultLines[childResultLines.length - 1] == '') {
        childResultLines = childResultLines.slice(0, childResultLines.length - 1)
      }

      for (let j=0; j<childResultLines.length; j++) {
        const line = childResultLines[j]

        // 子项链接
        if (j == 0) {
          const connector = i == children.length - 1 ? '└─' : '├─'
          res += `${connector}${line}\n`
        }
        // 子项包括
        else {
          const containSymbol = i == children.length - 1 ? '  ': '│ '
          const tail = (
            i == children.length - 1 && j == childResultLines.length - 1
          ) ? '' : '\n'

          res += `${containSymbol}${line}${tail}`
        }
      }
    }
    

    return res
  }

  /**
   * 
   * Request
   * 
   */
  
  // _reqHandlers: TreeReqHandler[] = []
  // addRequestHandler(h: TreeReqHandler) {
  //   this._reqHandlers.push(h)
  // }
  // request(reqName: string, data?: any) {
  //   for(const item of this._reqHandlers) {
  //     item(reqName, data)
  //   }
  // }

  /**
   * Binding
   */
  private _bindInst?: any
  bindInst(_inst: any) {
    this._bindInst = _inst
  }
  tryCall(func: (i: any) => void) {
    if (this._bindInst) {
      func(this._bindInst)
    }
  }

  /**
   * 
   * FindDeep
   * 
   */
  findDeep(predict: (t: Tree<T>) => boolean): Tree<T> | undefined {
    if (predict(this)) {
      return this
    }
    if (this.children !== undefined) {
      for (const child of this.children) {
        const res = child.findDeep(predict)
        if (res !== undefined) {
          return res
        }
      }
    }
    return undefined
  }

  /**
   * 
   * Static
   * 
   */

  static _parseNode<ST extends BaseNode>(
    data: UnknowDataType,
    titleFunc: (o: UnknowDataType) => string,
    childrenFunc: (o: UnknowDataType) => (UnknowDataType[] | undefined)
  ): ST {
    const title = titleFunc(data)
    const rawChildren = childrenFunc(data)
    let children = undefined
    if (rawChildren) {
      children = rawChildren.map(x => this._parseNode(x, titleFunc, childrenFunc))
    }

    // console.log('==============')
    // console.log(data)
    return { title, children } as ST
  }

  static parse<ST extends BaseNode>(
    data: UnknowDataType,
    titleFunc: (o: UnknowDataType) => string,
    childrenFunc: (o: UnknowDataType) => (UnknowDataType[] | undefined)
  ): Tree<ST> {
    
    return new Tree(this._parseNode(data, titleFunc, childrenFunc))
  }
}

/**
 * Derives
 */
export interface ActionNode<T extends BaseNode> extends BaseNode {
  children?: ActionNode<T>[]
  action: (tree: Tree<T>) => void
}