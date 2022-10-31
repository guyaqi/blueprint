<script setup lang="ts">
import { computed, ref } from 'vue'
import { popup, PopupWindow }  from '../../util/popup'
import FunctionEditor from './FunctionEditor.vue'
import Alert from './Alert.vue';
import Confirm from './Confirm.vue';
import Msg from './Msg.vue';
</script>
  
<template>
  <div class="popup-root" :class="{ 'mask': popup.windowShown != PopupWindow.None }">
    <FunctionEditor v-if="popup.windowShown == PopupWindow.FunctionEditor" :node="popup.currentBPN!" />
    <Alert v-else-if="popup.windowShown == PopupWindow.Alert" :msg="popup.alertMsg" :title="popup.alertTitle" />
    <Confirm v-else-if="popup.windowShown == PopupWindow.Confirm" :msg="popup.confirmMsg" :title="popup.confirmTitle" />

    <Msg />
  </div>
</template>
  
<style scoped lang="scss">

.popup-root {
  width: 100%;
  height: 100%;
  z-index: 1000;
  position: absolute;
  
  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none;
}

.mask {
  background-color: #0008;
  pointer-events: auto;
}
</style>
  