<script setup lang="ts">
import { ref, reactive } from 'vue'
import { BPN, BPNInstance } from '../../util/blueprint/node';
import Func from '../GraphNode/Func.vue';
import { cloneDeep } from 'lodash'
import { BPS, BPSType, BPSInstance } from '../../util/blueprint/slot';
import { popup } from '../../util/popup';
import { computed } from '@vue/reactivity';
import { sequenceName } from '../../util/name-tool';
import BPDTypeSelect from '../common/BPDTypeSelect.vue';

const { node, } = defineProps<{ node: BPN }>()

const nodeClone = ref(cloneDeep(node))
const inDataSlot = computed(() => nodeClone.value.slots.filter(x => !x.isOut && x.type == BPSType.DATA))
const outDataSlot = computed(() => nodeClone.value.slots.filter(x => x.isOut && x.type == BPSType.DATA))
const preview = ref(new BPNInstance(nodeClone.value))


// const name = ref(node.name)
// watch(name, val => {
//   node.name = val
// })

const addParam = () => {
  const newName = sequenceName(inDataSlot.value.map(x => x.name), 'param')
  const bps = new BPS(BPSType.DATA, newName, false, 0)
  const bpsi = new BPSInstance(bps)
  nodeClone.value.slots.push(bps)
  preview.value.slots.push(bpsi)
}

const addReturn = () => {
  const newName = sequenceName(outDataSlot.value.map(x => x.name), 'return')
  const bps = new BPS(BPSType.DATA, newName, true, 0)
  const bpsi = new BPSInstance(bps)
  nodeClone.value.slots.push(bps)
  preview.value.slots.push(bpsi)
  // preview.value = new BPNInstance(nodeClone.value)
}

const close = () => {
  popup.value.close()
}

const confirm = () => {
  node.name = nodeClone.value.name
  node.slots = nodeClone.value.slots
  close()
}

</script>
  
<template>
  <div class="popup-function">
    <div class="head">
      <div>Function Signature</div>
      <div class="btn-action push-right" @click="close">
        <img src="../../assets/images/close.svg" alt="">
      </div>
      
    </div>
    <div class="form-row form-group">
      <div class="form-col">
        <div class="form-label">Name</div>
      </div>
      <div class="form-col">
        <input type="text" class="form-input" v-model="nodeClone.name">
      </div>
    </div>

    <div class="form-group">
      <div class="form-row aic">
        <div class="form-label">Params</div>
        <div class="btn-action push-right" @click="addParam">
          <img src="../../assets/images/add.svg" alt="">
        </div>
      </div>
      <div> 
        <div class="form-row" v-for="(item, index) in inDataSlot">
          <div class="form-label aic">[{{ index }}]</div>
          <div class="form-col">
            <input type="text" class="form-input" v-model="item.name">
          </div>
          <div class="form-col">
            <BPDTypeSelect :slot="item" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <div class="form-row aic">
        <div class="form-label">Returns</div>
        <div class="btn-action push-right" @click="addReturn">
          <img src="../../assets/images/add.svg" alt="">
        </div>
      </div>
      <div> 
        <div class="form-row" v-for="(item, index) in outDataSlot">
          <div class="form-label aic">[{{ index }}]</div>
          <div class="form-col">
            <input type="text" class="form-input" v-model="item.name">
          </div>
          <div class="form-col">
            <BPDTypeSelect :slot="item" />
          </div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-row">
        <div class="form-col">
          <div class="form-label tac">Preview</div>
          <Func :instance="preview" :preview="true" class="center-block mb-2" />
        </div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-row">
        <div class="form-col">
          <div class="form-btn" @click="confirm">Confirm</div>
        </div>
      </div>
    </div>

  </div>
</template>
  
<style scoped lang="scss">
.popup-function {
  width: 360px;
  // height: 540px;
  background-color: #202020;
  border-radius: 0.25rem;
  overflow: hidden;
}
</style>
  