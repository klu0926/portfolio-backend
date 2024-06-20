const router = require('express').Router()
const path = require('path')
const upload = require('../middleware/multer')
const tinyfy = require('../middleware/tinyfy')
const objectsController = require('../controller/objectsController')
const postController = require('../controller/postController')
const ResponseError = require('../helper/ResponseError')

// PAGES
// S3 Objects
router.get('/', (req, res) => {
  const filePath = path.resolve('./public/dist', 'bucket.html')
  res.sendFile(filePath)
})
// Quill Editor
router.get('/write', (req, res) => {
  const filePath = path.resolve('./public/dist', 'write.html')
  res.sendFile(filePath)
})



// OBJECTS (AWS S3) 
// get object
router.get('/objects', objectsController.getObjects)
// post object
router.post('/objects', upload.single('Image'), tinyfy, objectsController.postObject)
// Delete object
router.delete('/objects', objectsController.deleteObject)

// POSTS (SQL) 
router.get('/posts', postController.getPost)
router.get('/posts/:postId', postController.getPost)
router.post('/posts', postController.postPost)
router.put('/posts', postController.putPost)
router.delete('/posts', postController.deletePost)

// 404
router.use((req, res) => {
  const error = new ResponseError('Page does not exist', 404)
  res.status(error.statusCode).json({
    ok: false,
    error: error,
    message: error.message
  })
})

module.exports = router