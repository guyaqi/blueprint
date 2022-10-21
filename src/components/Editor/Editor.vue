<script setup lang="ts">
import { editor, FileTab } from '../../util/editor';
import { ref, watch, computed, Ref } from 'vue'
import Graph from '../Graph/Graph.vue';
import Inspector from './Inspector.vue';
import TabView from './TabView.vue';
import TextEdit from './TextEdit.vue';

const tab: Ref<FileTab|undefined> = ref(undefined) //computed(() => editor.value.tab)
watch(computed(() => editor.value.tab), (val) => {
  tab.value = undefined
  setTimeout(() => {
    tab.value = val
  })
})

</script>
  
<template>
  <div class="editor">
    <Inspector />
    <div class="main">
      <div class="head">
        <TabView />
      </div>
      <Graph v-if="tab && tab.isBp && tab.context" :context="tab.context" />
      <TextEdit v-else-if="tab && !tab.isBp && tab.file" :tab="tab"/>
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

</style>
  