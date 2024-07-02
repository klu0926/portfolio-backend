const { Tag } = require('../models')
const errorResponse = require('../helper/errorResponse')
const ResponseError = require('../helper/ResponseError')
const responseJSON = require('../helper/responseJSON')

// get tag --
// create tag --
// delete tag 
// tag a post
// remove tag from post

const tagController = {
  getTag: async (req, res) => {
    try {
      // tag Id
      const { tagId } = req.params

      // get one tag or all tags
      let data = null
      if (tagId) {
        data = await Tag.findOne({ where: { id: tagId }, raw: true })
      } else {
        data = await Tag.findAll({ raw: true })
      }
      if (!data) {
        throw new ResponseError('Fail to get Tag', 400)
      }
      // response
      res.status(200).json(responseJSON(true, 'GET', data, 'Successfully get tag'))
    } catch (err) {
      errorResponse(res, err, 'GET')
    }
  },
  createTag: async (req, res) => {
    try {
      // name
      const { name, icon } = req.body
      if (!name.trim()) {
        throw new ResponseError('Missing tag name', 400)
      }

      // check if tag exist
      const oldTag = await Tag.findOne({ where: { name }, raw: true })
      if (oldTag) {
        throw new ResponseError(`Tag: ${oldTag.name} already exist`, 400)
      }

      // create tag
      const newTag = await Tag.create({
        name,
        icon,
      })

      // response
      res.status(201).json(responseJSON(true, 'POST', newTag, `Successfully create new Tag: ${newTag.name}`))
    } catch (err) {
      errorResponse(res, err, 'POST')
    }
  },
  deleteTag: async (req, res) => {
    try {
      // tag id
      const { id } = req.body

      if (!id) {
        throw new ResponseError('Missing tag id', 400)
      }

      // check if tag exist
      const tag = await Tag.findOne({ where: { id } })
      if (!tag) {
        throw new ResponseError(`Tag id: ${id} do not exist`, 400)
      }
      // delete tag
      await Tag.destroy({ where: { id } })

      // response
      res.status(200).json(responseJSON(true, 'DELETE', null, 'Successfully deleted tag'))
    } catch (err) {
      errorResponse(res, err, 'DELETE')
    }
  }

}


module.exports = tagController



