
export class PythonVersion {
  inner: number[]

  compare(target: PythonVersion): number {
    if (this.inner[0] < target.inner[0]) {
      return -1
    }
    else if (this.inner[0] > target.inner[0]) {
      return 1
    }
    else if (this.inner[1] < target.inner[1]) {
      return -1
    }
    else if (this.inner[1] > target.inner[1]) {
      return 1
    }
    else if (this.inner[2] < target.inner[2]) {
      return -1
    }
    else if (this.inner[2] > target.inner[2]) {
      return 1
    }
    else {
      return 0
    }
  }

  constructor(version: number[]) {
    this.inner = [version[0], version[1] || 0, version[2] || 0]
  }
}