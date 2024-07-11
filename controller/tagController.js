const { Tag, Post, PostTag } = require('../models')
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

      const attributesOption = {
        exclude: ['createdAt', 'updatedAt']
      }

      const includesArray = [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'title'],
          through: {
            model: PostTag,
            attributes: []
          }
        }
      ]

      if (tagId) {
        data = await Tag.findOne({
          where: { id: tagId },
          attributes: attributesOption,
          include: includesArray
        })
      } else {
        data = await Tag.findAll({
          attributes: attributesOption,
          include: includesArray
        })
      }
      if (!data) {
        throw new ResponseError('Fail to get Tag', 400)
      }

      // convert to json
      if (Array.isArray(data)) {
        data = data.map(post => post.toJSON())
      } else {
        data = data.toJSON()
      }

      // response
      res.status(200).json(responseJSON(true, 'GET', data, 'Successfully get tag'))
    } catch (err) {
      errorResponse(res, err, 'GET')
    }
  },
  createTag: async (req, res) => {
    try {
      const { name, icon } = req.body
      if (!name.trim()) {
        throw new ResponseError('Missing tag name', 400)
      }

      // check if tag exist
      const oldTag = await Tag.findOne({
        where: { name }, raw: true
      })
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
  },
  createPostTag: async (req, res) => {
    try {

      const { postId, tagId } = req.body
      let errorMessage = []

      // check postId & tagId
      if (!postId) {
        errorMessage.push('Missing PostId')
      }
      if (!tagId) {
        errorMessage.push('Missing TagId')
      }
      if (errorMessage.length > 0) {
        throw new ResponseError(errorMessage.join(' , '), 400)
      }

      // find post & tag
      const post = await Post.findOne({ where: { id: postId } })
      if (!post) {
        errorMessage.push(`Can not find post with post id: ${postId}`)
      }
      const tag = await Tag.findOne({ where: { id: tagId } })
      if (!tag) {
        errorMessage.push(`Can not find tag with tag id: ${tagId}`)
      }
      if (errorMessage.length > 0) {
        throw new ResponseError(errorMessage.join(' , '), 400)
      }

      // check if postTag exist
      const oldPostTag = await PostTag.findOne({
        where: {
          postId: Number(postId),
          tagId: Number(tagId)
        }
      })
      if (oldPostTag) {
        throw new ResponseError('Current post already has that tag', 400)
      }

      // create postTag
      const postTag = await PostTag.create({
        postId: Number(postId),
        tagId: Number(tagId)
      })

      // response
      res.status(200).json(responseJSON(true, 'POST', postTag, 'Successfully tag a post'))
    } catch (err) {
      errorResponse(res, err, 'POST')
    }
  },
  deletePostTag: async (req, res) => {
    try {
      const { postId, tagId } = req.body
      let errorMessage = []

      // check postId & tagId
      if (!postId) {
        errorMessage.push('Missing PostId')
      }
      if (!tagId) {
        errorMessage.push('Missing TagId')
      }
      if (errorMessage.length > 0) {
        throw new ResponseError(errorMessage.join(' , '), 400)
      }

      // find post & tag
      const post = await Post.findOne({ where: { id: postId } })
      if (!post) {
        errorMessage.push(`Can not find post with post id: ${postId}`)
      }
      const tag = await Tag.findOne({ where: { id: tagId } })
      if (!tag) {
        errorMessage.push(`Can not find tag with tag id: ${tagId}`)
      }
      if (errorMessage.length > 0) {
        throw new ResponseError(errorMessage.join(' , '), 400)
      }

      // find tagPost 
      const tagPost = await PostTag.findOne({
        where: {
          postId: Number(postId),
          tagId: Number(tagId)
        }
      })
      if (!tagPost) {
        throw new ResponseError('Can not find tagPost record to delete', 400)
      }

      // delete tagPost
      await tagPost.destroy()

      // response
      res.status(200).json(responseJSON(true, 'DELETE', null, 'Successfully delete a tagPost record'))

    } catch (err) {
      errorResponse(res, err, 'DELETE')

    }
  }
}


module.exports = tagController



