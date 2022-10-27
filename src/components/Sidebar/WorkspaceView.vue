<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FsTreeNode } from '../../util/workspace';
import { ActionNode, BaseNode, Tree } from '../../util/basic/tree';
import { workspace } from '../../util/workspace'
import { editorBus } from '../../util/editor';
import { os } from '../../util/os'
import TreeView from '../common/Tree/TreeView.vue';
import { popup, PopupResult } from '../../util/popup';
import * as file from '../../util/fm'

// 这里是workspace的主要调用区
workspace.value.init()
const title = computed(() => workspace.value.title ? workspace.value.title : '-')
const srcTree = computed(() => workspace.value.fileTree)

const classFunc = (node: Tree<BaseNode>) => {
  return {
    'name-class': node.isLeaf(),
    'name-package': !node.isLeaf(),
  }
}

const focusPath = ref('')

const clickFile = async (item: Tree<FsTreeNode>) => {
  focusPath.value = item.inner.path
}

const dblClickFile = async (item: Tree<FsTreeNode>) => {
  if (!item.inner.isDir) {
    editorBus.value.openFile(item.inner.path)
  }
}

const editCallback = async (tree: Tree<BaseNode>, newTitle: string) => {
  await os.rename({ path: (tree.inner as FsTreeNode).path, newName: newTitle })
  workspace.value.reload()
}

const isActionsShow = ref(false)

const activeDir = (): Tree<FsTreeNode> | undefined => {
  let res: Tree<FsTreeNode> | undefined
  const path = focusPath.value
  if (!path) {
    if (srcTree.value) {
      res = srcTree.value
    }
    else {
      res = undefined
    }
  }
  else {
    const node = srcTree.value?.findDeep((x: Tree<FsTreeNode>) => x.inner.path == path)
    if (!node) {
      res = undefined
    }
    else if (node.isLeaf()) {
      res = node.parent
    }
    else {
      res = node
    }
  }
  return res
}

let newDir = false
const newFile = () => {
  const dir = activeDir()
  if (!dir) {
    return
  }
  newDir = false
  dir.tryCall(i => i.newSub())
}

const newFolder = () => {
  const dir = activeDir()
  if (!dir) {
    return
  }
  newDir = true
  dir.tryCall(i => i.newSub())
}

const refresh = () => {
  workspace.value.reload()
}

const createCb = (from: Tree<BaseNode>, newName: string) => {
  const path = file.path.join((from.inner as FsTreeNode).path, newName)
  if (!newDir) {
    os.fileCreate({ path: `${path}.bp`, })
  }
  else {
    os.folderCreate({ path, })
  }
  workspace.value.reload()
}

const deleteTree = async (tree: Tree<BaseNode>): Promise<void> => {
  const res = await popup.value.confirm(`Are you sure want to delete: "${tree.title}"`)
  if (res == PopupResult.Yes) {
    const path = (tree.inner as FsTreeNode).path
    console.log(`delete: ${path}`)
    await os.rm({ path, })
    workspace.value.reload()
  }
}

const renameTree = (tree: Tree<BaseNode>): void => {

}

const onContextMenu = (tree: Tree<BaseNode>): ActionNode<BaseNode>|null => {
  const nodeMenu = [
    { title: 'Rename', action: renameTree },
    { title: 'Delete', action: deleteTree },
  ]
  
  const rootMenu = [
  { title: 'Root', action: () => {} },
  ] as ActionNode<BaseNode>[]

  const isRoot = (tree.inner as FsTreeNode).path == srcTree.value!.inner.path

  return {
    title: '',
    children: isRoot ? rootMenu : nodeMenu,
    action: () => {}
  }
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
      :tree="srcTree" :class-func="classFunc"  :click="clickFile" :editable="true"
      :edit-cb="editCallback" :createCb='createCb' :dblclick="dblClickFile"
      :onContextMenu='onContextMenu'/>
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
  