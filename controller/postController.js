const responseJSON = require('../helper/responseJSON')
const { Post, Tag, PostTag } = require('../models/')
const ResponseError = require('../helper/ResponseError')

const postController = {
  // Get one or all post
  getPost: async (req, res) => {
    try {
      let data = null

      const { postId } = req.params

      // get one post or all post
      const includesArray = [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: {
            model: PostTag,
            attributes: []
          }
        }
      ]

      if (postId) {
        data = await Post.findOne({
          where: { id: postId },
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          include: includesArray,
        })
      } else {
        data = await Post.findAll({
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          include: includesArray,
        })
      }
      if (!data) {
        throw new ResponseError('Fail to get Post', 400)
      }

      // convert to json
      if (Array.isArray(data)) {
        data = data.map(post => post.toJSON())
      } else {
        data = data.toJSON()
      }

      // If find one post fail
      if (postId && !data) {
        throw new ResponseError(`Fail to get post id: ${postId}`, 400)
      }
      // response
      res.status(200).json(responseJSON(true, 'GET', data, 'Successfully get post'))
    } catch (err) {
      console.error(err)
      res.status(err.status || 500).json(responseJSON(false, 'GET', null, err.message, err))
    }
  },
  postPost: async (req, res) => {
    try {
      // check body
      const { title, data, cover, description, background } = req.body
      const fields = { title, data, cover, description } // ignore tags for now
      const errorItems = []

      Object.keys(fields).forEach(key => {
        if (!fields[key]) errorItems.push(key)
      })
      if (errorItems.length !== 0) {
        throw new ResponseError(`Missing fields: ${errorItems.join(',')}`, 400)
      }

      // create post
      const post = await Post.create({
        title,
        cover,
        description,
        data: JSON.stringify(data),
        backgroundHex: background || '#FFFFFF'
      })

      // response
      res.status(201).json(responseJSON(true, 'POST', post, 'Successfully created new post'))
    } catch (err) {
      console.error(err)
      res.status(err.statusCode || 500).json(responseJSON(false, 'POST', null, err.message, err))
    }
  },
  putPost: async (req, res) => {
    try {
      // check body
      const { id, data } = req.body

      if (!id) {
        throw new ResponseError('Missing put post id', 400)
      }

      // find post
      const post = await Post.findOne({ where: { id } })
      if (!post) {
        throw new ResponseError(`Can not find post with id: ${id}`, 400)
      }

      // update post
      if (data.title) post.title = data.title
      if (data.cover) post.cover = data.cover
      if (data.description) post.description = data.description
      post.data = JSON.stringify(data.data) // allow empty data
      if (data.background) post.backgroundHex = data.background
      await post.save()

      // response
      res.status(201).json(responseJSON(true, 'PUT', post, 'Successfully updated post'))
    } catch (err) {
      console.error(err)
      res.status(err.statusCode || 500).json(responseJSON(false, 'PUT', null, err.message, err))
    }
  },
  deletePost: async (req, res) => {
    try {
      // check id
      const { id } = req.body
      if (!id) {
        throw new ResponseError('Missing post id', 400)
      }
      // try to get post
      const post = await Post.findOne({ where: { id } })
      if (!post) {
        throw new ResponseError(`Post not found with id: ${id}`, 404)
      }
      // delete post
      await Post.destroy({ where: { id } })

      // response
      res.status(200).json(responseJSON(true, 'DELETE', null, 'Successfully deleted post'))
    } catch (err) {
      console.error(err)
      res.status(err.statusCode || 500).json(responseJSON(false, 'DELETE', err.message, err))
    }
  }
}

module.exports = postController