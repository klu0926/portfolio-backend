const router = require('express').Router()
const path = require('path')
const { s3Controller } = require('../aws')
const upload = require('../middleware/multer')
const tinyfy = require('../middleware/tinyfy')
const bytes = require('bytes')

// get All Page
router.get('/', async (req, res) => {
  const filePath = path.resolve('./public', 'bucket.html')
  res.sendFile(filePath)
})
// get folder
router.get('/objects/', async (req, res, next) => {
  try {
    // Prefix = folder (eg: 'folderA/folderB/')
    const prefix = req.query.prefix || ''
    const response = await s3Controller.getAllObjects(prefix)

    const contents = response.Contents.map(item => {
      return {
        type: item.Size === 0 ? 'folder' : 'file',
        key: item.Key,
        size: item.Size,
        url: s3Controller.getObjectUrl(item.Key),
        bytes: bytes(item.Size)
      }
    })
    console.log('contents:', contents)
    res.send(contents)
  } catch (err) {
    next(err)
  }
})

// upload page
router.get('/upload', (req, res) => {
  const filePath = path.resolve('./public', 'upload.html')
  res.sendFile(filePath)
})
// upload 
router.post('/upload', upload.single('Image'), tinyfy, async (req, res, next) => {
  try {
    const file = req.file
    let { Key } = req.body
    if (!file) throw new Error('Missing File')
    if (!Key) throw new Error('Missing Object Key')

    const newKey = Key + '.' + file.originalname.split('.')[1]
    const response = await s3Controller.putObject(newKey, file.buffer)
    res.status(201).json({
      ok: true,
      message: 'Object created',
      response: response
    })
  } catch (err) {
    next(err)
  }
})

// Delete




router.get('/:key', (req, res) => {
  const { key } = req.params
  const url = s3Controller.getObjectUrl(key)
  res.send(url)
})

module.exports = router