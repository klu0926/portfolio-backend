const multer = require('multer')
const upload = multer({
  limits: {
    fileSize: 1000000 //1MB
  },
  fileFilter(req, file, cb) {
    // check is image
    // if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    //   cb(new Error('Please upload file type of jpg | jpeg | png'))
    // }
    cb(null, true)
  }
})

module.exports = upload