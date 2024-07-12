const fs = require('fs')
const path = require('path')

createDataFromBackup()

async function createDataFromBackup() {
  try {
    const folderPath = path.join(__dirname, '..', 'save', 'backup')

    const files = fs.readdirSync(folderPath)
    if (!files) throw new Error('No files in backup folder')

    // create promises from file
    const promises = []
    files.forEach(file => {
      const filePath = path.join(folderPath, file)

      // get json data
      const string = fs.readFileSync(filePath, { encoding: 'utf8' })
      const dataArray = JSON.parse(string)

      // remove id from json
      dataArray.forEach(data => {
        delete data.id
        delete data.updatedAt
        delete data.createdAt
      })

      // find model
      const modelName = file.split('.').shift()
      const model = require('../models')[modelName]
      if (!model) throw new Error(`Can not find model with name ${modelName}`)

      //return promise
      promises.push(model.bulkCreate(dataArray))
    })

    // create all 
    await Promise.all(promises)
    console.log(`Data create for: ${files}`)
  } catch (err) {
    console.error(err)
    console.error('Fail to create data from backup')
  } finally {
    process.exit(0)
  }
}



