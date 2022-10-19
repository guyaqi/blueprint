<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import store from '../../store';
import { FsTreeNode } from '../../util/workspace';
import { BaseTreeNode, BaseTree } from '../../util/datastructure/tree';
import TreeItem from '../common/Tree/TreeItem.vue';
import { workspace } from '../../util/workspace'
import editor from '../../util/editor';
import { os } from '../../util/os'
import TreeView from '../common/Tree/TreeView.vue';

// 这里是workspace的主要调用区
workspace.value.init()
const title = computed(() => workspace.value.title ? workspace.value.title : '-')
const srcTree = computed(() => workspace.value.fileTree)

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

const editCallback = async (tree: BaseTree<BaseTreeNode>, newTitle: string) => {
  await os.rename({ path: (tree.inner as FsTreeNode).path, newName: newTitle })
  workspace.value.reload()
}

const isActionsShow = ref(false)

const activeDir = (): BaseTree<FsTreeNode> | undefined => {
  const path = workspace.value.focusPath
  if (!path) {
    return undefined
  }
  const node = srcTree.value?.findDeep(x => (x as BaseTree<FsTreeNode>).inner.path == path)
  if (!node) {
    return undefined
  }
  if (node.isLeaf()) {
    return node.parent
  }
  else {
    return node
  }
}

const newFile = () => {
  const dir = activeDir()
  console.log('active: ', dir)
  dir?.request('newfile')
}

const newFolder = () => {
  const dir = activeDir()
  console.log('active: ', dir)
  dir?.request('newfolder')
}

const refresh = () => {
  workspace.value.reload()
}

const requestFinishCb = (reqName: string, node: BaseTreeNode) => {
  // console.log(reqName, )
  const path = (node as FsTreeNode).path
  if (reqName == 'newfile') {
    os.fileCreate({ path: `${path}.bp`, })
  }
  else {
    os.folderCreate({ path, })
  }
  workspace.value.reload()
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

    <TreeView v-if="srcTree"
      :tree="srcTree" :class-func="classFunc"  :click="clickFileTree" :editable="true" :edit-cb="editCallback" :requestFinishCb='requestFinishCb'/>
  </div>

</template>
  
<style scoped lang="scss">
.src-view-root {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  
}


.file-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}
</style>
  