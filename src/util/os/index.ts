import { randomInt } from "../naming"

const { ipcRenderer } = require("electron")

export namespace os {

  
  export const gChnlFunc = <T_Param, T_Return>(channel: string, pre?: (p: T_Param) => any, post?: any) => {

    const _promiseIndex = new Map<number, any>()

    ipcRenderer.on(channel, (e: any, serail: number, res) => {
      const solveFunc = _promiseIndex.get(serail)
      if (!solveFunc) {
        return
      }
      const _res = post ? post(res) : res
      solveFunc(_res)
      _promiseIndex.delete(serail)
    })

    const func = (param: T_Param): Promise<T_Return> => {
      const serail = randomInt()
      const _param = pre ? pre(param) : param
      ipcRenderer.send(channel, serail, _param)
      return new Promise((resolve, reject) => {
        _promiseIndex.set(serail, resolve)
      })
    }

    return func
  }
  

  export const greeting = gChnlFunc<{ name: string }, { msg: string }>(
    'greeting'
  )

  export const exec = gChnlFunc<{ cmd: string }, { stdout: string }>(
    'os-exec'
  )

  export const rename = gChnlFunc<{ path: string, newName: string }, void>(
    'file-rename'
  )

  export const fileCreate = gChnlFunc<{ path: string }, void>(
    'file-create'
  )

  export const rm = gChnlFunc<{ path: string }, void>(
    'file-delete'
  )

  export const folderCreate = gChnlFunc<{ path: string }, void>(
    'folder-create'
  )

  /**
   * 
   * ls
   * 
   */
  const CHANNEL_LS = 'os-ls'

  const _lsPromiseIndex = new Map<number, any>()

  ipcRenderer.on(CHANNEL_LS, (e: any, serail: number, children: string[]) => {
    const solveFunc = _lsPromiseIndex.get(serail)
    if (!solveFunc) {
      return
    }
    solveFunc(children)
    _lsPromiseIndex.delete(serail)
  })

  export const ls = (path: string): Promise<string[]> => {
    const serail = randomInt()
    ipcRenderer.send(CHANNEL_LS, serail, path)
    return new Promise((resolve, reject) => {
      _lsPromiseIndex.set(serail, resolve)
    })
  }
}
