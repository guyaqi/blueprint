
export const join = (...params: string[]) => {
  // const _sep = (await sep()).sep
  const sep = params.findIndex(param => param.indexOf('\\') >= 0) >= 0 ? '\\' : '/'

  let res = ''
  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    if (i !== params.length - 1) {
      res += param.endsWith(sep) ? param : (param + sep)
    }
    else {
      res += param
    }        
  }
  return res
}

export const postfixOf = (path: string) => {
  const pathArr = path.split(/[\\|/]/)
  const name = pathArr[pathArr.length-1]
  const dotIndex = name.indexOf('.')
  
  if (dotIndex < 0) {
    return ''
  }
  else {
    return name.slice(dotIndex+1)
  }
}