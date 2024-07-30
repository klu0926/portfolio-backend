const router = require('express').Router()
const path = require('path')
const upload = require('../middleware/multer')
const tinyfy = require('../middleware/tinyfy')
const tagController = require('../controller/tagController')
const objectsController = require('../controller/objectsController')
const postController = require('../controller/postController')
const ResponseError = require('../helper/ResponseError')
const apiRouter = require('./api')

// fake login
router.use((req, res, next) => {
  req.session.user = 'user'
  next()
})

// Password Check
function auth(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login'); // Adjust the path accordingly
    return
  } else {
    next()
  }
}
// Pages (require auth)
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/login.html'));
})
router.get('/', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/bucket.html'));
})
router.get('/bucket', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/bucket.html'));
})
router.get('/posts', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/posts.html'));
})
router.get('/posts', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/posts.html'));
})
router.get('/write', auth, (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/write.html'));
})

// API
router.use('/api', apiRouter)

// 404
router.use((req, res) => {
  const error = new ResponseError('Resource does not exist', 404)
  res.status(error.statusCode).json({
    ok: false,
    error: error,
    message: error.message
  })
})

module.exports = router