<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { ref, watch } from 'vue'
import store from '../../store';
// import { context } from '../../util/blueprint/context';
import { Point } from '../../util/blueprint/math';
import { BPNInstance } from '../../util/blueprint/node';
import { flatSymbolToBPN } from '../../util/blueprint/python-import';
import { FlatSymbol, FlatSymbolType } from '../../util/blueprint/python-import'

const emit = defineEmits<{
  (event: 'close'): void
}>()

const service = computed(() => store.state.service)
const flatSymbols = ref([] as FlatSymbol[])

const rootRef = ref(null as (null | HTMLElement))

watch(service, value => {
  if(!value) {
    return
  }
  flatSymbols.value = value.getFlatSymbolList()
})

/**
 * 
 * 搜索相关
 * 
 */
const SEARCH_DISPLAY_LIMIT = 1000
const searchText = ref('req.get')
const forceShowAll = ref(false)
const searchResult = computed(() => {
  if (searchText.value === '') {
    return []
  }
  forceShowAll.value = false

  let match: FlatSymbol[]
  if (searchText.value.indexOf('.')>=0) {
    const arr = searchText.value.split('.')
    const srFrom = arr[0]
    const srName = arr[1]
    match = flatSymbols.value.filter(x => {
      return x.name.startsWith(srName) && x.from.includes(srFrom)
    })
  }
  else {
    match = flatSymbols.value.filter(x => x.name.startsWith(searchText.value))
  }
  
  match.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
  return match
})
const srClass = computed(() => searchResult.value.filter(x => x.type == FlatSymbolType.CLASS))
const srFunction = computed(() => searchResult.value.filter(x => x.type == FlatSymbolType.FUNCTION))
const srVar = computed(() => searchResult.value.filter(x => x.type == FlatSymbolType.CONSTANT))

const cBpI = (symbol: FlatSymbol) => {
  if (!rootRef.value) {
    return
  }

  const genPos: Point = {
    y: rootRef.value.offsetTop,
    x: rootRef.value.offsetLeft,
  }

  const node = new BPNInstance(flatSymbolToBPN(symbol))
  node.position = genPos

  service.value!.oCtx!.nodes.push(node)

  emit('close')
}
</script>
  
<template>
  <div class="bp-menu" @click.stop ref="rootRef">
    <!-- <div class="title">
      根符号
    </div> -->
    <div class="search-row">
      <input type="text" class="search-box" v-model="searchText" placeholder="search symbols...">
    </div>
    <div v-if="service" class="search-option-scroll scroll-appearance">
      <div v-if="searchResult.length >= SEARCH_DISPLAY_LIMIT && !forceShowAll" class="simple-list-item">
        共{{searchResult.length}}条结果, <span class="text-link" @click="forceShowAll=true">展开显示</span>
      </div>
      <div v-if="searchResult.length < SEARCH_DISPLAY_LIMIT || forceShowAll" class="search-option-list">
        <div v-if="srClass.length">
          <div class="title name-class">> 类</div>
          <div v-for="item in srClass" class="simple-list-item click hover-hl" @click="cBpI(item)">
            <span class="name-package">{{item.from}}&nbsp;</span>
            <span class="name-class">{{ item.name }}</span>
          </div>
        </div>
        <div v-if="srFunction.length">
          <div class="title name-function">> 函数</div>
          <div v-for="item in srFunction" class="simple-list-item click hover-hl" @click="cBpI(item)">
            <span class="name-package">{{item.from}}&nbsp;</span>
            <span class="name-function">{{ item.name }}</span>
            <span>(</span>
            <span v-for="(iitem, index) in item.functionSignature">
              <span>{{ index == 0 ? '' : ', ' }}</span>
              <span>{{iitem.param}}</span>
              <span>{{ iitem.type == 'inspect._empty' ? '' : `, ${iitem.type}` }}</span>
            </span>
            <span>)</span>
          </div>
        </div>
        <div v-if="srVar.length">
          <div class="title name-constant">> 常量引用</div>
          <div v-for="item in srVar" class="simple-list-item click hover-hl" @click="cBpI(item)">
            <span class="name-package">{{item.from}}&nbsp;</span>
            <span class="name-constant">{{ item.name }}:&nbsp;</span>
            <span class="name-class">{{ item.varType }}</span>
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
  