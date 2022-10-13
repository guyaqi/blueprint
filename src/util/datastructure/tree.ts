type UnknowDataType = any

export interface BaseTreeNode {

  // 显示的节点名称
  title: string

  // 子节点列表
  children?: BaseTreeNode[]
}

export class BaseTree<T extends BaseTreeNode> {
  title: string;
  children?: BaseTree<T>[];
  parent?: BaseTree<T>;

  inner: T

  constructor(node: T) {
    this.inner = node
    this.title = node.title
    
    if (node.children) {
      this.children = []
      for (const childNode of node.children as T[]) {
        this.children.push(new BaseTree(childNode))
      }
    }
  }

  root(): (BaseTree<T> | undefined) {
    let current: (BaseTree<T> | undefined) = this
    while (current.parent != undefined) {
      current = current.parent
    }

    return current
  }

  hierarchy(): BaseTree<T>[] {
    const path = [] as BaseTree<T>[]
    let current: (BaseTree<T> | undefined) = this

    path.push(current)

    while (current.parent != undefined) {
      current = current.parent
      path.push(current)
    }

    return path
  }

  child(name: string): BaseTree<T> | null {
    const a = this.children?.filter(x => x.title == name)
    if (!a || a.length == 0) {
      return null
    }
    return a[0]
  }

  isLeaf() {
    return !this.children || this.children.length == 0
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
  

  static _parseNode<ST extends BaseTreeNode>(
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

  static parse<ST extends BaseTreeNode>(
    data: UnknowDataType,
    titleFunc: (o: UnknowDataType) => string,
    childrenFunc: (o: UnknowDataType) => (UnknowDataType[] | undefined)
  ): BaseTree<ST> {
    
    return new BaseTree(this._parseNode(data, titleFunc, childrenFunc))
  }
}