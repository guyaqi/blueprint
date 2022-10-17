import { BaseTreeNode } from "../datastructure/tree"
import { os } from "../os"
import { TextFile } from "../os/file"
import pyBridge from "../python"

export const main = async () => {
  
  await pyBridge.value.test()
}