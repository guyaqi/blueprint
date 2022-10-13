<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { chooseWorkspace, hasChild } from '../../util/workspace'

import { shell } from '../../util/shell/shell'
import store from '../../store';
import { BlueprintService } from '../../util/blueprint/service';


/**
 * 
 * 工作区操作相关代码
 * 
 */
const service = ref(null as (null | BlueprintService))

/**
 * 
 * 命令执行相关代码
 * 
 */
const executing = computed(() => !service.value ? false : (service.value.occupied))
const canExecute = computed(() => !executing.value)

setInterval(() => {
  // console.log(`connected: ${connected.value}`)
  // console.log(`connected: ${connected}`)
}, 1000)

const execute = async () => {
  if (!canExecute.value) {
    return
  }

  const command = 'default'
  const param = 'keyboard.mouse.WheelEvent'
  shell.logText(`命令执行: ${command} ${param}`)

  const res = await service.value!.execAny(command, param)
  if (res.success) {
    shell.logText(JSON.stringify(res.result!))
  }
  else {
    for (const line of res.error!) {
      shell.logText(line)
    }
  }
  
}
</script>
  
<template>
  <div class="shell-menu-root">
    <!-- <div class="btn-action" @click="connect" :class="{'disable': connected}">
      <img src="../../assets/images/connect.svg" >
    </div> -->
    <div class="btn-action" @click="execute" :class="{'disable': !canExecute}">
      <img src="../../assets/images/lightning.svg" >
    </div>
  </div>
</template>
  
<style scoped lang="scss">
.disable {
  filter: grayscale(100%);
  cursor: default !important;
  &:hover {
    background-color: transparent !important;
  }
}

.shell-menu-root {
  width: 32px;
  background-color: #333333;
  border-top: 1px solid #202124;
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: 6px 0;
}

</style>
  