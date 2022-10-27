<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue'
import { BPS } from '../../util/blueprint/slot';
import { BPN, BPNType } from '../../util/blueprint/node';
import { popup } from '../../util/popup'
import { editorBus, FileTab } from '../../util/editor'
import { BPCI } from '../../util/blueprint/struct';
import { BPCtx } from '../../util/blueprint/context'

const pp = defineProps<{ blueprint: BPCI, rootPath: string, context?: BPCtx }>()
const bpci = pp.blueprint
// blueprint: BPCI, context?: BPCtx
// console.warn(pp.blueprint)

// const bpci = pp.blueprint
const bpc = bpci.config


// const bpci = computed(() => inspector.value.blueprint)
// const bpc = computed(() => bpci.value?.config)


const addFunction = async () => {
  const name = bpc.newFunctionName()
  const toAdd = new BPN(BPNType.FUNCTION, name, BPS.makeProcessIOPair())

  await popup.value.editFunction(toAdd)
  bpc.functions.push(toAdd)
}

const openFunctionContext = (name: string) => {
  
  const path = `${pp.rootPath}>${name}`

  // 如果是新建的 function ，并不会有context，需要先创建一个
  if (pp.blueprint.contexts.findIndex(x => x.name == name) < 0) {

    const func = pp.blueprint.config.functions.find(x => x.name == name)

    if (!func) {
      throw new Error(`function: "${name}" is opened before create a context for it`)
    }

    const newCtx = BPCtx.fromFunction(func)

    pp.blueprint.contexts.push(newCtx)
  }

  editorBus.value.openFile(path)

  // 如果没有指定context，说明是从蓝图根文件打开
  // 从根文件打开子文件时关闭根文件（因为子文件也有Inspector导航）
  if (!pp.context) {
    const bus = editorBus.value
    const thisTabIndex = bus.findInTabs(pp.rootPath)
    bus.close(thisTabIndex)
  }
}

/* function scope */
const mouseInFunctionScope = ref(false)
</script>
  
<template>
  <div v-if="!bpci" class="disable"></div>
  <div v-else class="class-view">
    
    <div class="member-scope">
      <div class="head">
        <div><span class="name-member">members</span></div>
      </div>
      <div v-if="!bpc!.members.length" class="simple-list-item name-member">--</div>
      <div v-else class="scroll-appearance scope-list">
        <div>
          <div v-for="node in bpc!.members" class="simple-list-item name-member click hover-hl" @dblclick="openFunctionContext(node.name)">{{ node.name }}</div>
        </div>
      </div>
    </div>

    <div class="function-scope" @mouseenter="mouseInFunctionScope=true" @mouseleave="mouseInFunctionScope=false">
      <div class="head">
        <span class="name-function">function</span>
        <div class="btn-action push-right" @click="addFunction" v-show="mouseInFunctionScope">
          <img src="../../assets/images/add.svg" alt="">
        </div>
      </div>
      <div v-if="!bpc!.functions.length" class="simple-list-item name-function">--</div>
      <div v-else class="scroll-appearance scope-list">
        <div>
          <div v-for="node in bpc!.functions" class="simple-list-item name-function click hover-hl" @dblclick="openFunctionContext(node.name)">{{ node.name }}</div>
        </div>
      </div>
      
      <!-- <div class="simple-list-item name-function">main</div> -->
    </div>

    <div class="local-scope" v-if="pp.context">
      <div class="head"><span class="name-local">local</span></div>
      <div class="simple-list-item name-local">--</div>
    </div>
  </div>
</template>
  
<style scoped lang="scss">



.class-view {
  width: 240px;
  height: 100%;
  border-right: 2px solid #333;
  display: flex;
  flex-flow: column;
  position: relative;
}

.disable {
  width: 0;
  overflow: hidden;
}


.member-scope, .function-scope, .local-scope {
  flex-shrink: 0;
  flex-grow: 1;

  .scope-list {
    height: calc(100% - 32px);
  }
}

</style>
  