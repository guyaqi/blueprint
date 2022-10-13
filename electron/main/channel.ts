import { WebContents, ipcMain, IpcMainEvent } from "electron"
import fs from 'fs'
import path from 'path'


/**
 * 
 * Utils
 * 
 */

const isDir = (path: string) => {
  try {
    return fs.statSync(path).isDirectory()
  }
  catch (err) {
    // console.log(`error isDir ======\n`, err)
    return false
  }
}

const isFile = (path: string) => {
  return fs.statSync(path).isFile()
}

type FsTreeNode = {
  title: string
  isDir: boolean
  path: string
  children?: FsTreeNode[]
}

export const _treeDir = (_path: string): FsTreeNode => {
  // console.log(`tree dir: ${_path}`)
  const stat = fs.statSync(_path)
  const pathArr = _path.split(path.sep)
  const fileName = pathArr[pathArr.length - 1]
  if (stat.isFile()) {
    return { title: fileName, isDir: false, 'path': _path }
  }
  else {
    // filter out dotfile
    const subList = fs.readdirSync(_path).filter(x => !x.startsWith('.')).map(x => path.join(_path, x))
    return { title: fileName, isDir: true,  'path': _path, children: subList.map(x => _treeDir(x)) }
  }
}


export const WORKSPACE_LOAD_CHANNEL = 'workspace-load'
const workspaceLoad = async (e: IpcMainEvent, path: string) => {
  if (!isDir(path)) {
    console.log('workspaceLoad failed')
    return
  }
  e.reply(WORKSPACE_LOAD_CHANNEL, _treeDir(path))
}


const FILE_LOAD_CHANNEL = 'file-load'
const fileLoad = async (e: IpcMainEvent, path: string) => {
  if (!isFile(path)) {
    throw new Error('fileLoad failed')
  }
  e.reply(FILE_LOAD_CHANNEL, {
    path,
    buffer: fs.readFileSync(path)
  })
}

const FILE_SAVE_CHANNEL = 'file-save'
const fileSave = async (e: IpcMainEvent, path: string, buf: Buffer) => {
  fs.writeFileSync(path, buf)
  // e.reply(FILE_SAVE_CHANNEL, true)
}

export function useChannels(webContents: WebContents) {

  ipcMain.on(WORKSPACE_LOAD_CHANNEL, workspaceLoad)

  ipcMain.on(FILE_LOAD_CHANNEL, fileLoad)

  ipcMain.on(FILE_SAVE_CHANNEL, fileSave)
}