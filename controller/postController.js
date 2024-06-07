const responseJSON = require('../helper/responseJSON')
const { Post } = require('../models/')
const ResponseError = require('../helper/ResponseError')

const postController = {
  // Get one or all post
  getPost: async (req, res) => {
    try {
      let data = null
      // check id
      const { postId } = req.params

      // get one post or all post
      if (postId) {
        data = await Post.findOne({ where: { id: postId }, raw: true })
      } else {
        data = await Post.findAll({ raw: true })
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
      const { title, data } = req.body
      if (!title || !data) {
        throw new ResponseError(`Missing body: title: ${Boolean(title)}, data: ${Boolean(data)}`, 400)
      }
      // create post
      const post = await Post.create({
        title, data
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
      const { id, title, data } = req.body
      if (!id || !title || !data) {
        throw new ResponseError(`Missing body: id: ${Boolean(title)}, title: ${Boolean(title)}, data: ${Boolean(data)}`, 400)
      }
      // find post
      const post = await Post.findOne({ where: { id } })
      if (!post) {
        throw new ResponseError(`Can not find post with id: ${id}`, 404)
      }

      // update post
      post.title = title
      post.data = data
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