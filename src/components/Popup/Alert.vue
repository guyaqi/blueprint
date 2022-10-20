<script setup lang="ts">
import { ref, reactive } from 'vue'
import { BPN, BPNInstance } from '../../util/blueprint/node';
import Func from '../GraphNode/Func.vue';
import { cloneDeep } from 'lodash'
import { BPS, BPSType, BPSInstance } from '../../util/blueprint/slot';
import { popup } from '../../util/popup';
import { computed } from '@vue/reactivity';
import { sequenceName } from '../../util/naming';
import BPDTypeSelect from '../common/BPDTypeSelect.vue';

const { msg, title } = defineProps<{ msg: string, title?: string }>()

const close = () => {
  popup.value.close()
  if (popup.value._alertResolve) {
    popup.value._alertResolve()
  }
}

const confirm = () => {
  close()
}

</script>
  
<template>
  <div class="popup-function">
    <div class="head">
      <div>{{ title ? title : 'Blueprint' }}</div>
      <div class="btn-action push-right" @click="close">
        <img src="../../assets/images/close.svg" alt="">
      </div>
    </div>

    <div class="form-group">
      <div class="form-row">
        <div class="form-col">
          {{ msg }}
        </div>
      </div>
    </div>

    <div class="form-group">
      <div class="form-row">
        <div class="form-col">
          <div class="form-btn" @click="confirm">Ok</div>
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