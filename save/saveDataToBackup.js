const fs = require('fs')
const path = require('path')
const { Post, PostTag } = require('../models')

// save posts
async function saveDataToFile(modelName) {
  try {
    if (!modelName) throw new Error('Missing model name')

    const model = require('../models')[modelName]
    if (!model) throw new Error(`Can not find model ${modelName}`)

    const data = await model.findAll({ raw: true })
    if (!data) throw new Error(`Can not find any ${modelName} data`)

    // data string
    const string = JSON.stringify(data)

    // save path
    const savePath = path.join(__dirname, '..', 'save', 'backup', `${modelName}.json`)

    // save posts to file
    fs.writeFileSync(savePath, string, 'utf8')
    console.log(`${modelName} saved to /save folder`)
  } catch (err) {
    console.error(`Error saving ${modelName}: `, err.message)
  }
}

async function init() {
  await saveDataToFile('Post')
  await saveDataToFile('PostTag')
  process.exit(1)
}

init()



