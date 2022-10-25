<script setup lang="ts">
import { editorBus, FileTab, FileType } from '../../util/editor';
import { ref, watch, computed, Ref } from 'vue'
import Graph from '../Graph/Graph.vue';
import Inspector from './Inspector.vue';
import TabView from './TabView.vue';
import TextEdit from './TextEditor.vue';
import Unsupport from './Unsupport.vue';
import BlueprintCanvas from './BlueprintCanvas.vue';
import BlueprintInspector from './BlueprintInspector.vue'

const tab: Ref<FileTab|undefined> = ref(undefined) //computed(() => editor.value.tab)
watch(computed(() => editorBus.value.tab), (val) => {
  tab.value = undefined
  setTimeout(() => {
    tab.value = val
  })
})

</script>
  
<template>
  <div class="editor">
    <div class="main">
      <div class="head">
        <TabView />
      </div>
      <div class="fill" v-if="tab">
        <Unsupport v-if="tab.fileType == FileType.Unsupported" />
        <TextEdit v-else-if="tab.fileType == FileType.TextView" :tab="tab"/>
        <BlueprintCanvas v-else-if="tab.fileType == FileType.BpCanvas" :tab="tab"/>
        <BlueprintInspector v-else-if="tab.fileType == FileType.BpInspect" :tab="tab"/>
      </div>
      
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.editor {
  flex-grow: 1;
  display: flex;
  height: calc(100% - 240px);
  background-color: #202124;
}

.init-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}


.main {
  flex-grow: 1;
  height: 100%;
}

.fill {
  height: calc(100% - 32px);
}

</style>
  