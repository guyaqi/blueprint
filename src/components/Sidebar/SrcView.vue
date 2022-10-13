<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import store from '../../store';
import { FsTreeNode } from '../../util/workspace';
import { BaseTreeNode, BaseTree } from '../../util/datastructure/tree';
import TreeItem from '../common/TreeItem.vue';
import { workspace } from '../../util/workspace'

// const service = computed(() => store.state.service)

// const fileTree = ref(null as null|BaseTree<FileTreeNode>)
// watch(service, async (val) => {
//   if (!val) {
//     return
//   }
//   fileTree.value = await service.value!.getBpFileTree()
//   // console.log(fileTree.value);
// })

// 这里是workspace的主要调用区
workspace.value.init()
const title = computed(() => workspace.value.title ? workspace.value.title : '-')
const srcTree = computed(() => workspace.value.fileTree?.child('src'))

const styleFunc = (node: BaseTree<BaseTreeNode>) => {
  const isStaff = node.title == 'Staff'
  return {
    'background-color': isStaff ? 'white' : undefined,
    'color': isStaff ? 'black' : undefined,
  }
}

const classFunc = (node: BaseTree<BaseTreeNode>) => {
  return {
    'name-class': node.isLeaf(),
    'name-package': !node.isLeaf(),
  }
}

const clickFileTree = async (item: BaseTree<FsTreeNode>) => {
  
  if (item.inner.isDir) {
    return
  }
  
  workspace.value?.openSrc(item.inner.path)
}

const titleFilter = (s: string) => s.endsWith('.json') ? s.slice(0, s.length - 5) : s
</script>
  
<template>
  <div class="src-view-root">
    <div class="head">{{ title }}</div>
    <div class="class-list" v-if="srcTree">
      <TreeItem v-for="item in srcTree.children"
        :tree="item" :class-func="classFunc" :style-func="styleFunc" :click="clickFileTree" :titleFilter="titleFilter" />
    </div>
  </div>

</template>
  
<style scoped lang="scss">
.src-view-root {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
}

.class-list {
  flex-grow: 1;
}
</style>
  