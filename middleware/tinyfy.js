const tiny = require('tinify')
tiny.key = process.env.TINY_PNG_KEY

async function tinyfy(req, res, next) {
  try {
    if (!req.file) throw new Error('req.file does not exist')
    if (!req.file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      next()
      return
    }

    const source = tiny.fromBuffer(req.file.buffer)
    const resizedBuffer = await source.resize().toBuffer()

    req.file.buffer = resizedBuffer
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = tinyfy