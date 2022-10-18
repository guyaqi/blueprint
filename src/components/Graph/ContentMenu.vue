<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { onMounted, ref, watch } from 'vue'
import store from '../../store';
// import { context } from '../../util/blueprint/context';
import { Point } from '../../util/blueprint/math';
import { BPNInstance } from '../../util/blueprint/node';
import { symbol } from '../../util/blueprint/symbol'
import { workspace } from '../../util/workspace'
import { pyBridge } from '../../util/python'

const emit = defineEmits<{
  (event: 'close'): void
}>()


const flatSymbols = ref([] as symbol.FlatSymbol[])

const rootRef = ref(null as (null | HTMLElement))

// watch(computed(() => pyBridge.value._inited), value => {
//   if(!value) {
//     return
//   }
//   flatSymbols.value = value.getFlatSymbolList()
// })

onMounted(() => {
  pyBridge.value.init().then(() => {
    flatSymbols.value = pyBridge.value.getFlats()
  })
})

/**
 * 
 * 搜索相关
 * 
 */
const SEARCH_DISPLAY_LIMIT = 1000
// const searchText = ref('req.get')
// const searchText = ref('print')
const searchText = ref('join')
const forceShowAll = ref(false)
const searchResult = computed(() => {
  if (searchText.value === '') {
    return []
  }
  forceShowAll.value = false
  return symbol.search(searchText.value, flatSymbols.value)
})
const srClass = computed(() => searchResult.value.filter(x => symbol.isClass(x)))
const srFunction = computed(() => searchResult.value.filter(x => symbol.isFunction(x)))
const srVar = computed(() => searchResult.value.filter(x => symbol.isConst(x)))

const instantiate = (s: symbol.FlatSymbol) => {
  if (!rootRef.value) {
    return
  }

  const genPos: Point = {
    y: rootRef.value.offsetTop,
    x: rootRef.value.offsetLeft,
  }

  const node = new BPNInstance(symbol.toBPN(s))
  node.position = genPos

  workspace.value.oCtx!.nodes.push(node)

  emit('close')
}
</script>
  
<template>
  <div class="bp-menu" @click.stop @mousedown.stop ref="rootRef">
    <!-- <div class="title">
      根符号
    </div> -->
    <div class="search-row">
      <input type="text" class="search-box" v-model="searchText" placeholder="search symbols...">
    </div>
    <div v-if="workspace" class="search-option-scroll scroll-appearance">
      <div v-if="searchResult.length >= SEARCH_DISPLAY_LIMIT && !forceShowAll" class="simple-list-item">
        共{{searchResult.length}}条结果, <span class="text-link" @click="forceShowAll=true">展开显示</span>
      </div>
      <div v-if="searchResult.length < SEARCH_DISPLAY_LIMIT || forceShowAll" class="search-option-list">
        <div v-if="srClass.length">
          <div class="title name-class">> 类</div>
          <div v-for="item in srClass" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{item.from}}&nbsp;</span>
            <span class="name-class">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
          </div>
        </div>
        <div v-if="srFunction.length">
          <div class="title name-function">> 函数</div>
          <div v-for="item in srFunction" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{item.from}}&nbsp;</span>
            <span class="name-function">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
            <!-- <span>(</span>
            <span v-for="(iitem, index) in item.functionSignature">
              <span>{{ index == 0 ? '' : ', ' }}</span>
              <span>{{iitem.param}}</span>
              <span>{{ iitem.type == 'inspect._empty' ? '' : `, ${iitem.type}` }}</span>
            </span>
            <span>)</span> -->
          </div>
        </div>
        <div v-if="srVar.length">
          <div class="title name-constant">> 常量引用</div>
          <div v-for="item in srVar" class="simple-list-item click hover-hl" @click="instantiate(item)">
            <span class="name-package">{{item.from}}&nbsp;</span>
            <span class="name-constant">{{ item.name }}&nbsp;</span>
            <span>{{ item.desc }}</span>
            <!-- <span class="name-class">:&nbsp;{{ item.varType }}</span> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.bp-menu {
  width: 360px;
  height: 540px;
  background-color: #202020;
  z-index: 100;
  position: absolute;
  box-shadow: 0 0 2rem rgb(0 0 0 / 25%);
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  flex-flow: column;
}

.title {
  background-color: #333333;
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
}

.search-row {
  width: 100%;
  // padding: 8px;
  // border-bottom: 1px solid #666666;
}

.search-box {
  width: 100%;
  height: 2rem;
  // border-radius: 0.25rem;
  border: none;
  padding: 0 1rem;
  background-color: #666666;
  // outline: 2px solid #666666;
  outline: none;
  color: white;

  &::placeholder {
    color: #888;
  }
}

.search-option-scroll {
  flex-grow: 1;
}
</style>
  