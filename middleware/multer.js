const multer = require('multer')
const errorResponse = require('../helper/errorResponse')

// const upload = multer({
//   limits: {
//     fileSize: 1000000 * 5 //5MB
//   },
//   fileFilter(req, file, cb) {
//     // check is image
//     // if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//     //   cb(new Error('Please upload file type of jpg | jpeg | png'))
//     // }
//     cb(null, true)
//   }
// })


function uploadFile(req, res, next) {
  const upload = multer({
    limits: {
      fileSize: 1000000 * 5 //5MB
    }
  }).single('Image')

  upload(req, res, (err) => {
    if (err) {
      errorResponse(res, err, 'POST')
      return
    }
    // everything is find
    next()
  })
}



module.exports = uploadFile