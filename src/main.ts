import { createApp } from 'vue'
import App from './App.vue'

import 'normalize.css'
import './style/main.scss'
import './style/layout.scss'
import './style/head.scss'
import './style/text.scss'
import './style/form.scss'
import './style/node.scss'

import { ipcRenderer } from 'electron'
import store from './store'

/**
 * If you enables use of Node.js API in the Renderer-process
 * ```
 * npm i -D vite-plugin-electron-renderer
 * ```
 * @see - https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
 */
// import './samples/node-api'

createApp(App)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
