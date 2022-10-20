import { Menu, ipcMain, WebContents, dialog } from 'electron'
import fs from 'fs'
import { WORKSPACE_LOAD_CHANNEL, _treeDir } from './channel' 

async function openWorkspace(webContents: WebContents) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
  if (canceled) {
    return
  }
  const wsPath = filePaths[0]
  // fs.readdir(wsPath)
  // localStorage.setItem('asdasd', wsPath)
  webContents.send(WORKSPACE_LOAD_CHANNEL, 0, {
    tree: _treeDir(wsPath)
  })
}

export function initMenu(webContents: WebContents) {
  
  
  const template = [
    {
      label: 'Workspace',
      submenu: [
        {
          label: 'open...',
          click: () => openWorkspace(webContents)
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'reload'
    }
  ]

  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu)
}
  
