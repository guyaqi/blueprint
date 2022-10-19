<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import store from '../../store';
import { FsTreeNode } from '../../util/workspace';
import { BaseTreeNode, BaseTree } from '../../util/datastructure/tree';
import TreeItem from '../common/TreeItem.vue';
import { workspace } from '../../util/workspace'
import editor from '../../util/editor';
import { os } from '../../util/os'

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
const srcTree = computed(() => workspace.value.fileTree)

// const styleFunc = (node: BaseTree<BaseTreeNode>) => {
//   const activate = (node as BaseTree<FsTreeNode>).inner.path === workspace.value.focusPath
//   return {
//     'background-color': activate ? '#ffffff44' : undefined,
//   }
// }

const classFunc = (node: BaseTree<BaseTreeNode>) => {
  return {
    'name-class': node.isLeaf(),
    'name-package': !node.isLeaf(),
  }
}

const clickFileTree = async (item: BaseTree<FsTreeNode>) => {
  
  workspace.value.focusPath = item.inner.path
  if (!item.inner.isDir) {
    editor.value.openFile(item.inner.path)
  }
}

const titleFilter = (tree: BaseTree<BaseTreeNode>) => {
  return tree.title.endsWith('.json') ? tree.title.slice(0, tree.title.length - 5) : tree.title
}

const edieCallback = async (tree: BaseTree<BaseTreeNode>, newTitle: string) => {
  await os.rename({ path: (tree.inner as FsTreeNode).path, newName: newTitle })
  workspace.value.reload()
}

const isActionsShow = ref(false)

const newFile = () => {

}

const newFolder = () => {
  
}

const refresh = () => {
  
}
</script>
  
<template>
  <div class="src-view-root" @mouseenter="isActionsShow=true" @mouseleave="isActionsShow=false">
    <div class="head">
      <div>{{ title }}</div>
      <div class="file-actions" v-show="isActionsShow">
        <img class="btn-action mr-1" src="../../assets/images/new_file.svg" alt="" @click="newFile">
        <img class="btn-action mr-1" src="../../assets/images/new_folder.svg" alt="" @click="newFolder">
        <img class="btn-action" src="../../assets/images/refresh.svg" alt="" @click="refresh">
      </div>
    </div>
    <div class="class-list" v-if="srcTree" tabindex="0">
      <TreeItem v-for="item in srcTree.children"
        :tree="item" :class-func="classFunc"  :click="clickFileTree" :editable="true" :edit-cb="edieCallback"/>
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
  border: 1px solid transparent;
  &:focus {

    border: 1px solid dodgerblue;
    // background-color: red;
  }
}

.file-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}
</style>
  