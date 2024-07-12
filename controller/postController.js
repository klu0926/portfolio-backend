const responseJSON = require('../helper/responseJSON')
const { Post, Tag, PostTag } = require('../models/')
const ResponseError = require('../helper/ResponseError')
const errorResponse = require('../helper/errorResponse')

const postController = {
  // Get one or all post
  getPost: async (req, res) => {
    try {
      let data = null
      const { postId } = req.params

      // get one post or all post
      const includeOption = [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: {
            model: PostTag,
            attributes: []
          },
          order: [['name', 'ASC']],

        }
      ]

      if (postId) {
        data = await Post.findOne({
          where: { id: postId },
          attributes: {
            exclude: ['updatedAt']
          },
          include: includeOption,
        })
      } else {
        data = await Post.findAll({
          attributes: {
            exclude: ['updatedAt']
          },
          order: [['order', 'ASC']], // sort with post.order
          include: includeOption,
        })
      }
      if (!data) {
        throw new ResponseError('Fail to get Post', 400)
      }

      // convert to json
      if (Array.isArray(data)) {
        data = data.map(post => {
          post.meta = JSON.parse(post.meta)
          return post.toJSON()
        })
      } else {
        data.meta = JSON.parse(data.meta)
        data = data.toJSON()
      }

      // If find one post fail
      if (postId && !data) {
        throw new ResponseError(`Fail to get post id: ${postId}`, 400)
      }

      // sort tags
      if (postId && data) {
        data.tags.sort((a, b) => a.name.localeCompare(b.name));
      } else if (data) {
        data.forEach(post => {
          post.tags.sort((a, b) => a.name.localeCompare(b.name));
        });
      }

      // response
      res.status(200).json(responseJSON(true, 'GET', data, 'Successfully get post'))
    } catch (err) {
      errorResponse(res, err, 'GET')
    }
  },
  postPost: async (req, res) => {
    try {
      // check body
      const { title, group, data, cover, description, background, meta } = req.body
      const requireFields = { title, group, data, cover, description }
      const errorItems = []

      Object.keys(requireFields).forEach(key => {
        if (!requireFields[key]) errorItems.push(key)
      })
      if (errorItems.length !== 0) {
        throw new ResponseError(`Missing required fields: ${errorItems.join(',')}`, 400)
      }

      // find max order
      const maxOrderPost = await Post.findOne({ order: [['order', 'DESC']] });
      const maxOrder = maxOrderPost ? maxOrderPost.order : 0

      // create post
      const post = await Post.create({
        group,
        title,
        cover,
        description,
        data: JSON.stringify(data),
        backgroundHex: background || '#FFFFFF',
        order: maxOrder + 1,
        meta: JSON.stringify(meta) || null
      })

      // response
      res.status(201).json(responseJSON(true, 'POST', post, 'Successfully created new post'))
    } catch (err) {
      errorResponse(res, err, 'POST')
    }
  },
  putPost: async (req, res) => {
    try {
      // check body
      const postId = req.body?.id
      const bodyData = req.body?.data

      if (!postId) {
        throw new ResponseError('Missing put post id', 400)
      }
      if (!bodyData) {
        throw new ResponseError('Missing put post body data', 400)
      }

      // check require fields
      const { title, group, data, cover, description, background, meta } = bodyData
      const requireFields = { title, group, data, cover, description }
      const errorItems = []
      Object.keys(requireFields).forEach(key => {
        if (!requireFields[key]) errorItems.push(key)
      })
      if (errorItems.length !== 0) {
        throw new ResponseError(`Missing required fields: ${errorItems.join(',')}`, 400)
      }

      // find post
      const post = await Post.findOne({ where: { id: postId } })
      if (!post) {
        throw new ResponseError(`Can not find post with id: ${postId}`, 400)
      }

      // update post
      if (title) post.title = title
      if (group) post.group = group
      if (cover) post.cover = cover
      if (description) post.description = description
      post.data = JSON.stringify(data) // allow empty data
      if (background) post.backgroundHex = background
      if (meta) post.meta = JSON.stringify(meta)
      await post.save()

      // response
      res.status(201).json(responseJSON(true, 'PUT', post, 'Successfully updated post'))
    } catch (err) {
      errorResponse(res, err, 'PUT')
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
      errorResponse(res, err, 'DELETE')
    }
  },
  swapPostsOrder: async (req, res) => {
    try {
      const { postId1, postId2 } = req.body
      const post1 = await Post.findByPk(postId1)
      const post2 = await Post.findByPk(postId2)

      // check both post exist
      let errorMessages = []
      if (!post1) {
        errorMessages.push(`Can not find first post with id: ${postId1}`)
      }
      if (!post2) {
        errorMessages.push(`Can not find second post with id: ${postId2}`)
      }
      if (errorMessages.length > 0) {
        throw new ResponseError(errorMessages.join(' , '), 400)
      }

      // swap order
      const tempOrder = post1.order
      post1.order = post2.order
      post2.order = tempOrder
      await post1.save()
      await post2.save()

      // response
      const data = [
        post1.toJSON(),
        post2.toJSON()
      ]
      res.status(200).json(responseJSON(true, 'PUT', data, 'Successfully swap post oder'))
    } catch (err) {
      errorResponse(res, err, 'DELETE')
    }
  }
}

module.exports = postController