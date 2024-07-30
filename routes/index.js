const router = require('express').Router()
const path = require('path')
const loginController = require('../controller/loginController')
const ResponseError = require('../helper/ResponseError')
const apiRouter = require('./api')


// Authentication
function auth(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
    return
  } else {
    next()
  }
}

// API
router.use('/api', apiRouter)

// Login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/login.html'));
})
router.post('/api/login', loginController.postLogin)

// Auth (Blocking all below)
router.use(auth)

// Pages (require auth)
router.get('/', (req, res) => {
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