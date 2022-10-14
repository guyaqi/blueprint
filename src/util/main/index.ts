import { BaseTreeNode } from "../datastructure/tree"
import { os } from "../os"
import { TextFile } from "../os/file"
import python from "../python"

type PyFlatModuleProfile = {
  name: string
  isPkg: boolean
}

class PyHierarchyNode implements BaseTreeNode {
  title: string
  isPkg: boolean
  children?: PyHierarchyNode[]

  constructor(title: string, isPkg: boolean, children?: PyHierarchyNode[]) {
    this.title = title
    this.isPkg = isPkg
    this.children = children
  }

  toFlat(): PyFlatModuleProfile[] {
    let res: PyFlatModuleProfile[] = []
    res.push({ name: this.title, isPkg: this.isPkg })
    if (this.isPkg) {
      for (const child of this.children!) {
        for (const item of child.toFlat()) {
          res.push({ ...item, name: `${this.title}.${item.name}` })
        }
        // res = res.concat(child.toFlat())
      }
    }
    return res
  }
}



const treeResolve = async (path: string): Promise<PyHierarchyNode> => {
  const isFile = path.endsWith('.pyi')
  const pathArr = path.split(/[\\/]/)
  if (isFile) {
    const fname = pathArr[pathArr.length-1]
    const modname = fname.slice(0, fname.length-'.pyi'.length)
    return new PyHierarchyNode(modname, false)
  }
  else {
    const modname = pathArr[pathArr.length-1]
    let children = await os.ls(path)
    children = children.filter(x => x != '__init__.pyi')
    const fpChildren = children.map(x => os.path.join(path, x))
    const nodeChildren = []
    for (const fpChild of fpChildren) {
      nodeChildren.push(await treeResolve(fpChild))
    }
    return new PyHierarchyNode(modname, true, nodeChildren)
  }
}

const resolveDetail = async (rootPath: string, modProfile: PyFlatModuleProfile) => {
  let modNameArr = modProfile.name.split('.')
  modNameArr = modNameArr.slice(1)
  let _fp = os.path.join(rootPath, ...modNameArr)
  const fp = modProfile.isPkg ? os.path.join(_fp, '__init__.pyi') : `${_fp}.pyi`

  const f = await os.read({ path: fp })
  const textFile = TextFile.from(f)
  const srcText = textFile.text

  // console.log(fp);
  
  // match symbolNoCondition
  const symbolNoCondition = []
  // 
  let ma1 = srcText.matchAll(/\n__all__\s*\=\s*\[([\s\S]*?)\]/g)
  let m1 = ''
  for (const item of ma1) {
    m1 = item[1]
  }

  let ma2 = m1.matchAll(/".+?"/g)
  const res: string[] = []
  for (const item of ma2) {
    for (const ii of item) {
      res.push(ii)
    }
  }
}

export const main = async () => {
  const stdlibDir = await os.path.join(process.env.PUBLIC!, 'python', 'typeshed', 'stdlib')

  const examPackage = await os.path.join(stdlibDir, 'http')

  const res = await treeResolve(examPackage)

  const flat = res.toFlat()

  // resolveDetail(examPackage, flat[0])
  resolveDetail(examPackage, flat[1])
  // for (const item of flat) {
  //   
  // }
  

  // python exec test
  // const stdout = await python.value.exec(await os.path.join(process.env.PUBLIC!, 'python', 'src', 'hello.py'))
  // console.log(stdout)
}