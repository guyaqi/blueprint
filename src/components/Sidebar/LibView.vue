<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import store from '../../store';
import { BaseTree } from '../../util/datastructure/tree';
import TreeItem from '../common/TreeItem.vue'

// defineProps<{ msg: string }>()

// const count = ref(0)

// const libList = [
//   'Apache C++ Standard Library', 'ASL', 'Boost', 'BDE', 'Cinder', 'Cxxomfort',
//   'Dlib', 'EASTL', 'ffead-cpp', 'Folly', 'JUCE', 'libPhenom', 'LibSourcey', 'LibU', 'Loki', 'MiLi'
//   , 'openFrameworks', 'Qt', 'Reason', 'ROOT', 'STLport', 'STXXL', 'Ultimate++', 'Windows Template Library', 'Yomm11'
//   , 'EASTL' ]
// const workspaceHandler = ref(null as (null | FileSystemDirectoryHandle))

const siteTree = ref(null as (null | BaseTree))
const builtinTree = ref(null as (null | BaseTree))

const tabIndex = ref(0)

watch(computed(() => store.state.service), async (value) => {
  if (!value) {
    return
  }
  try {
    
    siteTree.value = BaseTree.parse({ name: 'site packages', children: value.rootSymbolList!.pkglist['site'] }, x => x.name, x => x.children)
    builtinTree.value = BaseTree.parse({ name: 'builtin packages', children: value.rootSymbolList!.pkglist['builtin'] }, x => x.name, x => x.children)
    // console.log(siteTree);
    // console.log(builtinTree);
    // console.log(builtinTree.value!.tree())
  }
  catch (err) {
    console.warn('读取lib列表失败')
    console.warn(err)
  }
  
})

const printHierarchy = () => {
  console.log(builtinTree.value!.tree())
}

</script>
  
<template>
  <div class="lib-view-root">
    <div class="head">
      <div class="mr-2 head-low">Library</div>
      <div class="head-tab" @click="tabIndex=0" :class="{'head-tab-active': tabIndex == 0}">site</div>
      <div class="head-tab" @click="tabIndex=1" :class="{'head-tab-active': tabIndex == 1}">built-in</div>
    </div>
    <div class="lib-list scroll-appearance">
      <div class="lib-list-content" v-if="siteTree" v-show="tabIndex == 0">
        <TreeItem v-for="item in siteTree.children" :tree="new BaseTree(item)" />
        <div v-for="item in []" class="simple-list-item">{{ item }}</div>
      </div>
      <div class="lib-list-content" v-if="builtinTree" v-show="tabIndex == 1">
        <div class="p-2">共载入{{builtinTree.children ? builtinTree.children.length : 0}}个包，超出显示限制(60)。出于性能考量，改用字符方式显示</div>
        <div class="p-2 text-tree">{{ builtinTree.tree() }}</div>
        <!-- <TreeItem v-for="item in builtinTree.children" :tree="new BaseTree(item)" />
        <div v-for="item in []" class="simple-list-item">{{ item }}</div> -->
      </div>
      <div class="lib-list-content" v-if="!siteTree">
        <div class="p-2">工作区未载入</div>
      </div>
    </div>
  </div>
  
</template>
  
<style scoped lang="scss">
.lib-view-root {
  height: 360px;
  display: flex;
  flex-flow: column;
}
.lib-list {
  flex-grow: 1;
  height: 360px;
  overflow: auto;
}
</style>
  