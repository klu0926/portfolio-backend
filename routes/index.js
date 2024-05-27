const router = require('express').Router()
const path = require('path')
const { s3Controller } = require('../aws')
const upload = require('../middleware/multer')
const tinyfy = require('../middleware/tinyfy')

// get All
router.get('/', async (req, res) => {
  const filePath = path.resolve('./public', 'display.html')
  res.sendFile(filePath)
})
router.get('/objects', async (req, res) => {
  try {
    const response = await s3Controller.getAllObjects()
    res.send(response.Contents)
  } catch (err) {
    next(err)
  }
})

// upload (POST/PUT)
router.get('/upload', (req, res) => {
  const filePath = path.resolve('./public', 'upload.html')
  res.sendFile(filePath)
})
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