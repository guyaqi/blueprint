<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Graph from '../Graph/Graph.vue';
import Inspector from './Inspector.vue';

// const workspaceHandler = computed(() => store.state.workspaceHandler)

// watch(workspaceHandler, async val => {
//   if (val) {
//     // console.log(val.entries()/)
//     for await (const item of (val as any).entries()) {
//       console.log(item)
//     }
//   }
// })

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
        <!-- <div class="head-tab">
          <div class="name-class">DB Connection</div>
          <div>.</div>
          <div class="name-function">Connect</div>
        </div> -->
        <div class="head-tab head-tab-active">
          <div class="name-class">PublicIp</div>
          <div>.</div>
          <div class="name-function">main</div>
          <img class="head-icon close-icon" src="../../assets/images/tips_close.svg" alt="">
        </div>
      </div>
      <Graph />
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.editor {
  flex-grow: 1;
  display: flex;
  // align-items: center;
  // justify-content: center;
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

.close-icon {
  margin-right: -8px;
  margin-left: 8px;
}
</style>
  