import { os } from "../os"

export namespace pythonExecLocal {
  export const ExecName: string = 'python.exe'

  let _executablePath: string
  const _getExecutablePath = async (): Promise<string> => {
    const pythonIsInDir = async (path: string): Promise<boolean> => {
      const children = await os.ls(path)
      return children.findIndex(x => x == pythonExecLocal.ExecName) >= 0
    }

    let pathList = process.env.PATH!.split(';')
    pathList = Array.from(new Set(pathList))
    for (const item of pathList) {
      if (await pythonIsInDir(item)) {
        return os.path.join(item, pythonExecLocal.ExecName)
      }
    }
    return ''
  }
  export const getExecutablePath = async (): Promise<string> => {
    if (!_executablePath) {
      _executablePath = await _getExecutablePath()
    }
    return _executablePath
  }

  export const exec = async (scriptPath: string): Promise<string> => {
    const { stdout, } = await os.exec({cmd: `${await getExecutablePath()} ${scriptPath}`})
    return stdout
  }

  export const execTool = async (toolName: string, param: string): Promise<any> => {
    const toolPath = os.path.join(process.env.PUBLIC!, 'python', 'src', `${toolName}.py`)
    // await python.value.init()
    const stdout = await exec(`${toolPath} ${param}`)
    try {
      const res = JSON.parse(stdout)
      return res
    }
    catch (err) {
      console.error('error when execTool')
      console.error(err)
      return ''
    }
  }
}
