const router = require('express').Router()
const upload = require('../middleware/multer')
const tinyfy = require('../middleware/tinyfy')
const tagController = require('../controller/tagController')
const objectsController = require('../controller/objectsController')
const postController = require('../controller/postController')

// ----- OBJECTS (AWS S3) 
// get object
router.get('/objects', objectsController.getObjects)
// post object
router.post('/objects', upload, tinyfy, objectsController.postObject)
// Delete object
router.delete('/objects', objectsController.deleteObject)

// ------- POSTS (SQL) 
router.get('/posts/:postId', postController.getPost)
router.get('/posts', postController.getPost)
router.post('/posts', postController.postPost)
router.put('/posts', postController.putPost)
router.delete('/posts', postController.deletePost)
// post order
router.put('/posts/swap-order', postController.swapPostsOrder)

// ------ TAG
router.get('/tags/:tagId', tagController.getTag)
router.get('/tags', tagController.getTag)
router.post('/tags', tagController.createTag)
router.delete('/tags', tagController.deleteTag)
router.post('/post-tag', tagController.createPostTag)
router.delete('/post-tag', tagController.deletePostTag)


module.exports = router