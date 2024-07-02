const { Post } = require('../models')
const postsSave = require('./posts.json')

createPostsFromFile(postsSave)

async function createPostsFromFile(posts) {
  try {
    // find save json
    if (!posts) throw new Error('Can not find posts save file "posts.json"')

    // create posts 
    const postsCreatePromises = posts.map(post => {
      const { title, cover, description, tags, data, backgroundHex } = post
      // Post.create create promise, then return this promise 
      return Post.create({
        title,
        cover,
        description,
        tags,
        data,
        backgroundHex: backgroundHex || '#FFFFFF'
      })
    })

    await Promise.all(postsCreatePromises)

    // check current post in database
    const newPosts = await Post.findAll()

    // exist process
    console.log(`Posts created from save, currently you have ${newPosts.length} posts!`)
    process.exit()

  } catch (err) {
    console.error('Create Posts Error: ', err.message)
    process.exit(1)
  }
}

