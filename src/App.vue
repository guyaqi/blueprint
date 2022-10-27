<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Logger from './components/Logger/Logger.vue';
import Sidebar from './components/Sidebar/Sidebar.vue';
import Editor from './components/Editor/Editor.vue';
import Menubar from './components/Menubar.vue';
import PopupRoot from './components/Popup/PopupRoot.vue';
import { onMounted, ref } from 'vue';
import { editorBus, inspector } from './util/editor'
import Statusbar from './components/Status/Statusbar.vue';

const { ipcRenderer } = require('electron');

const trySave = (e: KeyboardEvent) => {
  // const service = store.state.service

  // ctrl + s
	if(e.key == 's' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
    e.preventDefault();
    
		editorBus.value.saveCurrent()
    
		return false;
	}
  // ctrl + w
  if(e.key == 'w' && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
    e.preventDefault();
    
		editorBus.value.closeCurrent()
    
		return false;
	}

  // closeCurrent
}

const rootRef = ref(null as (null | HTMLElement))

onMounted(() => {
  window.addEventListener('keydown', trySave)
})

// ipcRenderer.on('workspace-open', () => {
//   store.dispatch('serviceConnect')
// })
</script>

<template>
  <div class="root" ref="rootRef">
    <PopupRoot />
    <div class="under-menubar">
      <Sidebar />
      <div class="right-sidebar">
        <Editor />
        <Logger />
      </div>
    </div>
    <Statusbar />
  </div>
</template>

<style scoped>
  .root {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-flow: column;
    overflow: hidden;
  }
  .under-menubar {
    flex-grow: 1;
    width: 100vw;
    height: calc(100% - 24px);
    background: var(--color-bg);

    display: flex;
  }

  .right-sidebar  {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    height: 100%;
  }
</style>
