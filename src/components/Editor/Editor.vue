<script setup lang="ts">
import { editor } from '../../util/editor';
import { ref, watch, computed } from 'vue'
import Graph from '../Graph/Graph.vue';
import Inspector from './Inspector.vue';
import TabView from './TabView.vue';
import TextEdit from './TextEdit.vue';

// const workspaceHandler = computed(() => store.state.workspaceHandler)

// watch(workspaceHandler, async val => {
//   if (val) {
//     // console.log(val.entries()/)
//     for await (const item of (val as any).entries()) {
//       console.log(item)
//     }
//   }
// })
const tab = computed(() => editor.value.tab)

</script>
  
<template>
  <div class="editor">
    <!-- <div v-if="!workspaceHandler" class="init-page">
      <Button @click="btnInit">Init workspace</Button>
    </div>
    <div v-else>Hello</div> -->
    <Inspector />
    <div class="main">
      <div class="head">
        <TabView />
      </div>
      <Graph v-if="tab && tab.isBp && tab.context" :context="tab.context" />
      <TextEdit v-else-if="tab && !tab.isBp && tab.file" :title="tab.title" :file="tab.file" />
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
  