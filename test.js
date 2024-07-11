// const fs = require('fs')
// const path = require('path')


// const filePath = path.join(__dirname, 'public', 'images', 'tags')
// console.log('filePath:', filePath)

// let files = fs.readdirSync(filePath)
// files = files.filter(file => !file.startsWith('.'))
// files = files.map(file => file.split('.')[0])


// console.log('file:', files)


const otherList = [
  'blender', 'maya', 'photoshop', 'premiere',
  'unity', 'unreal', 'wordpress'
]

const codingList = [
  'aws', 'bootstrap', 'csharp', 'handlebar', 'javascript', 'mongodb', 'mySQL', 'node',
  'react', 'vite',
]

const tagList = [...otherList, ...codingList]


console.log(tagList)