<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue'
import store from '../../store';
import { BPS } from '../../util/blueprint/slot';
import { BPCtx } from '../../util/blueprint/context';
import { BPN, BPNType } from '../../util/blueprint/node';
import { popup } from '../../util/popup'
import { editor } from '../../util/editor'

const bpci = computed(() => editor.value.oBPCI)
const bpc = computed(() => bpci.value?.config)


const addFunction = async () => {
  const name = bpc.value!.newFunctionName()
  const toAdd = new BPN(BPNType.FUNCTION, name, BPS.makeProcessIOPair())

  await popup.value.editFunction(toAdd)
  bpc.value!.functions.push(toAdd)
}

const openFunctionContext = (node: BPN) => {
  editor.value.openCtx(node)
}
</script>
  
<template>
  <div v-if="!bpci" class="disable"></div>
  <div v-else class="class-view">
    
    <div class="member-scope">
      <div class="head">
        <div><span class="name-member">members</span></div>
      </div>
      <div class="simple-list-item name-member">--</div>
    </div>

    <div class="function-scope">
      <div class="head">
        <span class="name-function">function</span>
        <div class="btn-action push-right" @click="addFunction">
          <img src="../../assets/images/add.svg" alt="">
        </div>
      </div>
      <div v-if="!bpc!.functions.length" class="simple-list-item name-function">--</div>
      <div v-else class="scroll-appearance scope-list">
        <div>
          <div v-for="node in bpc!.functions" class="simple-list-item name-function click hover-hl" @click="openFunctionContext(node)">{{ node.name }}</div>
        </div>
      </div>
      
      <!-- <div class="simple-list-item name-function">main</div> -->
    </div>

    <div class="local-scope">
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
  height: 33.3%;

  .scope-list {
    height: calc(100% - 32px);
  }
}

</style>
  