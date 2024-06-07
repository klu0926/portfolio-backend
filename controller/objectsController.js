
const { Model } = require('sequelize')
const s3Client = require('../aws')
const bytes = require('bytes')
const getPublicUrl = require('../helper/getPublicUrl')


const objectsController = {
  // Query: prefix, delimiter
  getObjects: async (req, res, next) => {
    try {
      // Prefix = folder (eg: 'folderA/folderB/')
      const prefix = req.query.prefix || ''
      const delimiter = req.query.delimiter || ''

      const response = await s3Client.getAllObjects(prefix, delimiter)

      const contents = response.Contents.map(item => {
        return {
          type: item.Size === 0 ? 'folder' : 'file',
          key: item.Key,
          size: item.Size,
          url: s3Client.getObjectUrl(item.Key),
          bytes: bytes(item.Size, { decimalPlaces: 0, unitSeparator: ' ' }),
        }
      })
      res.send(contents)
    } catch (err) {
      next(err)
    }
  },
  // File
  // Body: Key
  postObject: async (req, res, next) => {
    try {
      const file = req.file
      let { Key } = req.body
      if (!file) throw new Error('Missing File')
      if (!Key) throw new Error('Missing Object Key')

      const newKey = Key + '.' + file.originalname.split('.').pop()
      const response = await s3Client.putObject(newKey, file)

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
  },
  // Body: Key
  deleteObject: async (req, res, next) => {
    try {
      const { Key } = req.body
      if (!Key) throw new Error('No Key')
      const response = await s3Client.deleteObject(Key)
      res.status(200).json({
        ok: true,
        message: 'Object deleted',
        response: response
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = objectsController