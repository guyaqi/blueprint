import { WebContents, ipcMain, IpcMainEvent } from "electron"
import fs from 'fs'
import { readdirSync, readFileSync } from "original-fs";
import path from 'path'
import child_process from 'child_process'

export const WORKSPACE_LOAD_CHANNEL = 'workspace-load'

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
    return false
  }
}

const isFile = (path: string) => {
  try {
    return fs.statSync(path).isFile()
  }
  catch (err) {
    return false
  }
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

/**
 * 
 * 信道
 * 
 */




type HttpOptions = {

}

const HTTP_CHANNEL = 'http-request'
const httpRequest = async (e: IpcMainEvent, batch: number, url: any, init: any) => {
  const responce = await fetch(url, init)
  const text = await responce.text()
  e.reply(HTTP_CHANNEL, batch, text)
}


function addClientChannel(channel: string, cb: (e: IpcMainEvent, channel: string, serial: number, data: any) => any) {
  ipcMain.on(channel, (e, s, d) => cb(e, channel, s, d))
}

export function useChannels(webContents: WebContents) {

  // ipcMain.on(WORKSPACE_LOAD_CHANNEL, workspaceLoad)

  ipcMain.on(HTTP_CHANNEL, httpRequest)

  
  
  // const workspaceLoad = async (e: IpcMainEvent, path: string) => {
  //   if (!isDir(path)) {
  //     console.log('workspaceLoad failed')
  //     return
  //   }
  //   e.reply(WORKSPACE_LOAD_CHANNEL, _treeDir(path))
  // }

  //   const FILE_SAVE_CHANNEL = 'file-save'
  // const fileSave = async (e: IpcMainEvent, path: string, buf: Buffer) => {
  //   fs.writeFileSync(path, buf)
  // }

  addClientChannel('file-save', (e, c, s, d: { path: string, buffer: Buffer }) => {
    fs.writeFileSync(d.path, d.buffer)
    e.reply(c, s, {

    })
  })


  addClientChannel('workspace-load', (e, c, s, d: { path: string }) => {
    if (!isDir(d.path)) {
      console.log('workspaceLoad failed')
      return
    }
    e.reply(c, s, {
      tree: _treeDir(d.path)
    })
  })

  addClientChannel('file-load', (e, c, s, d: { path: string }) => {
    e.reply(c, s, {
      path: d.path,
      buffer: isFile(d.path) ? readFileSync(d.path) : []
    })
  })
  
  addClientChannel('os-ls', (e, c, s, path: string) => {
    const res = isDir(path) ? readdirSync(path) : []
    e.reply(c, s, res)
  })

  addClientChannel('greeting', (e, c, s, d: { name: string }) => {
    e.reply(c, s, {
      msg: `Hello, ${d.name}`
    })
  })

  addClientChannel('path-sep', (e, c, s, d) => {
    e.reply(c, s, {
      sep: path.sep
    })
  })

  addClientChannel('os-exec', (e, c, s, d: { cmd: string }) => {
    console.log(`exec: ${d.cmd}`)
    const buffer = child_process.execSync(d.cmd, {
      maxBuffer: 32 * 1024 * 1024
    })
    const decoder = new TextDecoder()
    const text = decoder.decode(buffer)
    e.reply(c, s, {
      stdout: text
    })
  })

  addClientChannel('file-rename', (e, c, s, d: { path: string, newName: string }) => {
    
    const pathArr = d.path.split(/[\\|/]/).filter(x => x!='')
    const newPathArr = pathArr.slice(0, pathArr.length - 1).concat([d.newName])
    const newPath = newPathArr.join(path.sep)
    console.log(`rename ${d.path} to ${newPath}`)
    fs.renameSync(d.path, newPath)
    e.reply(c, s, null)
  })

  addClientChannel('file-create', (e, c, s, d: { path: string }) => {
    console.log(`create ${d.path}`)
    const a = fs.openSync(d.path, 'wx')
    fs.closeSync(a)
    e.reply(c, s, null)
  })

  addClientChannel('file-delete', (e, c, s, d: { path: string }) => {
    console.log(`delete ${d.path}`)
    fs.rmSync(d.path, {
      force: true,
      recursive: true
    })
    e.reply(c, s, null)
  })

  addClientChannel('folder-create', (e, c, s, d: { path: string }) => {
    console.log(`create ${d.path}`)
    fs.mkdirSync(d.path)
    e.reply(c, s, null)
  })
}