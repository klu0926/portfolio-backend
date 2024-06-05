const router = require('express').Router()
const path = require('path')
const { s3Controller } = require('../aws')
const upload = require('../middleware/multer')
const tinyfy = require('../middleware/tinyfy')
const bytes = require('bytes')
const getPublicUrl = require('../helper/getPublicUrl')

// pages
router.get('/', async (req, res) => {
  const filePath = path.resolve('./public', 'bucket.html')
  res.sendFile(filePath)
})
router.get('/write', async (req, res) => {
  const filePath = path.resolve('./public', 'write.html')
  res.sendFile(filePath)
})


// get object
router.get('/objects', async (req, res, next) => {
  try {
    // Prefix = folder (eg: 'folderA/folderB/')
    const prefix = req.query.prefix || ''
    const delimiter = req.query.delimiter || ''

    const response = await s3Controller.getAllObjects(prefix, delimiter)

    const contents = response.Contents.map(item => {
      return {
        type: item.Size === 0 ? 'folder' : 'file',
        key: item.Key,
        size: item.Size,
        url: s3Controller.getObjectUrl(item.Key),
        bytes: bytes(item.Size, { decimalPlaces: 0, unitSeparator: ' ' }),
      }
    })
    res.send(contents)
  } catch (err) {
    next(err)
  }
})

// post file
router.post('/objects', upload.single('Image'), tinyfy, async (req, res, next) => {
  try {
    const file = req.file
    let { Key } = req.body
    if (!file) throw new Error('Missing File')
    if (!Key) throw new Error('Missing Object Key')


    const newKey = Key + '.' + file.originalname.split('.').pop()
    const response = await s3Controller.putObject(newKey, file)

    // return public url 
    res.status(201).json({
      ok: true,
      message: 'Object created',
      response: response,
      url: getPublicUrl(newKey)
    })
  } catch (err) {
    next(err)
  }
})

// post folder
router.post('/folders', async (req, res, next) => {
  try {
    let { Key } = req.body
    if (!Key) throw new Error('Missing Object Key')

    console.log('post folder key:', Key)

    const response = await s3Controller.putFolder(Key)

    res.status(201).json({
      ok: true,
      message: 'Folder created',
      response: response
    })
  } catch (err) {
    next(err)
  }
})

// Delete
router.delete('/objects', async (req, res, next) => {
  try {
    const { Key } = req.body
    if (!Key) throw new Error('No Key')
    const response = await s3Controller.deleteObject(Key)
    res.status(200).json({
      ok: true,
      message: 'Object deleted',
      response: response
    })
  } catch (err) {
    next(err)
  }
})
module.exports = router