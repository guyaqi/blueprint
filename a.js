const fs = require('fs')

const isDir = (path) => {
  fs.stat(path, (err, data) => {
    console.log(err)
    console.log(data)
    return
  })
}

isDir(__dirname)