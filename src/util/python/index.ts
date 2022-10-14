import { ref } from "vue"
import { os } from "../os"
const { shell } = require('electron')

class Python {

  readonly PythonExecName: string = 'python.exe'
  pythonFullpath: string = ''

  
  private async findPythonExecutable(): Promise<string> {
    const pythonIsInDir = async (path: string): Promise<boolean> => {
      const children = await os.ls(path)
      return children.findIndex(x => x == this.PythonExecName) >= 0
    }

    let pathList = process.env.PATH!.split(';')
    pathList = Array.from(new Set(pathList))
    for (const item of pathList) {
      if (await pythonIsInDir(item)) {
        return os.path.join(item, this.PythonExecName)
      }
    }
    return ''
  }

  // readonly exec = (scriptPath: string) => {
  //   const command = `${this.pythonFullpath} ${scriptPath}`
  //   console.log(command)
  //   await shell.openPath(command)
  // }

  // readonly exec = os.gChnlFunc<{ scriptPath: string }, { stdout: string }>(
  //   'python-exec',
  //   (x => ({scriptPath: `${this.pythonFullpath} ${x.scriptPath}`}))
  // )
  async exec(scriptPath: string): Promise<string> {
    await this.init()
    const { stdout, } = await os.exec({cmd: `${this.pythonFullpath} ${scriptPath}`})
    return stdout
  }

  _inited: boolean = false
  async init() {
    if (this._inited) {
      return
    }
    this._inited = true
    this.pythonFullpath = await this.findPythonExecutable()
  }
}

export const python = ref(new Python())
export default python