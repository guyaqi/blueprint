// import { shell } from '../logger'
// // import { hasChild } from '../workspace'
// import { BPCtx } from './context'
// import { RootSymbol, SymbolNode } from './python-import'
// import { BPC, BPCI } from './struct'
// import { BaseTree, BaseTreeNode } from '../datastructure/tree'
// import lodash from 'lodash'
// import { BPN } from './node'
// // import { FlatSymbol, FlatSymbolType } from './symbol'

// const BLUEPRINT_SCHEME = 'blueprint://'
// const RESULT_FILE = 'result.json'

// export type ExecResult = {
//   success: boolean
//   error?: string[]
//   result?: object
//   batch: number
// }


// export class BlueprintService {

//   static readonly POSTFIX_DIR = '.bp'
//   static readonly POSTFIX_FILE = '.bp.json'

//   /**
//    * 
//    * 文件系统
//    * 
//    */
//   wsHdl: FileSystemDirectoryHandle
//   rootHdl: FileSystemFileHandle
//   cacheHdl: FileSystemDirectoryHandle

//   /**
//    * 
//    * 命令执行相关
//    * 
//    */

//   occupied: boolean = false

//   async getResult(): Promise<ExecResult|null> {
//     try {
//       const resHdl = await this.cacheHdl.getFileHandle(RESULT_FILE)
//       const file = await resHdl.getFile()
//       const text = await file.text()
//       const obj = JSON.parse(text)
//       return obj
//     }
//     catch (e) {
//       return null
//     }
//   }

//   async execAny(command: string, param: string): Promise<ExecResult> {
//     const batch = Math.ceil(Math.random()*10000000000)

//     const that = this
//     this.occupied = true

//     const o = {
//       batch,
//       command,
//       param,
//     }
//     console.log(o);
    
//     const s = JSON.stringify(o)
//     console.log(s);

//     const a = encodeURI(s)
//     console.log(a);

//     const b = window.btoa(a)
//     console.log(b);

//     const url = `blueprint://${b}`
//     console.log(url); 

//     window.location.href = url

//     const res = await new Promise<object>((resolve, reject) => {
//       const intervalId = window.setInterval(async () => {
//         console.log(1);
        
//         const result = await this.getResult()

//         // console.log('==============');
//         // console.log(result);
//         // console.log(result?.batch);
//         // console.log(batch);

//         if (result && result.batch && result.batch == batch) {

//           window.clearInterval(intervalId)
//           that.occupied = false
//           resolve(result)
//         }
//       }, 500)
//     })

//     return res as ExecResult
//   }

//   /**
//    * 
//    * 根符号相关
//    * 
//    */
//   rootSymbolList: (RootSymbol | null) = null
//   dynamicSymbolList: SymbolNode[] = []

//   // 缓存进localstorage
//   _cacheRootSymbol(obj: object) {
//     localStorage.setItem('resolve_root_result', JSON.stringify(obj))
//   }

//   // 直接调用这个函数会刷新缓存
//   async _getRootSymbol() {
//     const res = await this.execAny('resolve_root', '')
//     if (!res.success) {
//       shell.logText('获取包列表时发生错误')
//       for (const line of res.error!) {
//         shell.logText(line)
//       }
//       return null
//     }
//     this._cacheRootSymbol(res.result!)
//     return res.result! as RootSymbol
//   }

//   // 初始化，根据情况调用（可能读取缓存）
//   private async initRootSymbol() {
//     let res = localStorage.getItem('resolve_root_result')
//     // res = null
//     if (res != null) {
//       this.rootSymbolList = JSON.parse(res)
//     }
//     else {
//       this.rootSymbolList = await this._getRootSymbol()
//     }
//   }

//   getFlatSymbolList(): FlatSymbol[] {
//     if (!this.rootSymbolList) {
//       return []
//     }
//     const fullSymbolList: SymbolNode[] = this.rootSymbolList.root_symbols.concat(this.dynamicSymbolList)

//     const flatList = [] as FlatSymbol[]

//     // console.log(fullSymbolList.filter(x => x.name == 'os')[0])

//     for (const symbolNode of fullSymbolList) {
//       if (symbolNode.var_list) {
//         for (const varItem of symbolNode.var_list) {
//           flatList.push({
//             type: FlatSymbolType.CONSTANT,
//             from: symbolNode.name,
//             name: varItem.name,
//             // varType: varItem.type
//           })
//         }
//       }
//       if (symbolNode.function_list) {
//         for (const varItem of symbolNode.function_list) {
//           flatList.push({
//             type: FlatSymbolType.FUNCTION,
//             from: symbolNode.name,
//             name: varItem.name,
//             // functionSignature: varItem.signature
//           })
//         }
//       }
//       if (symbolNode.class_list) {
//         for (const varItem of symbolNode.class_list) {
//           flatList.push({
//             type: FlatSymbolType.CLASS,
//             from: symbolNode.name,
//             name: varItem,
//           })
//         }
//       }
//     }
    
//     return flatList
//   }

//   /**
//    * 
//    * 构造方法
//    * 
//    */
//   private constructor(
//     wsHdl: FileSystemDirectoryHandle,
//     rootHdl: FileSystemFileHandle,
//     cacheHdl: FileSystemDirectoryHandle,
//   ) {
//     this.wsHdl = wsHdl
//     this.rootHdl = rootHdl
//     this.cacheHdl = cacheHdl
//   }

//   static async from(wsHdl: FileSystemDirectoryHandle): Promise<BlueprintService | null> {
//     let rootHdl: FileSystemFileHandle
//     let cacheHdl: FileSystemDirectoryHandle

//     try {
//       rootHdl = await wsHdl.getFileHandle('blueprint.py')
//     }
//     catch (e) {
//       return null
//     }

//     try {
//       cacheHdl = await wsHdl.getDirectoryHandle('cache')
//     }
//     catch (e) {
//       return null
//     }

//     const service = new BlueprintService(
//       wsHdl,
//       rootHdl,
//       cacheHdl
//     )

//     await service.initRootSymbol()

//     return service
//   }

//   static async fake(): Promise<BlueprintService> {
//     const service = new BlueprintService(
//       null as any,
//       null as any,
//       null as any
//     )

//     await service.initRootSymbol()
    
//     return service
//   }

// }