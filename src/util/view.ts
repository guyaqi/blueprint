import { queuePostFlushCb, getCurrentInstance } from 'vue'

export function forceUpdate() {
  const instance = getCurrentInstance()
  queuePostFlushCb(instance!.update)
}