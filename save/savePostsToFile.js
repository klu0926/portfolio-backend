const fs = require('fs')
const path = require('path')
const { Post } = require('../models/')

async function savePostsToFile() {
  try {
    const posts = await Post.findAll({ raw: true })
    if (!posts) throw new Error('Can not find any post')

    // data string
    const postsString = JSON.stringify(posts)

    // save path
    const savePath = path.join(__dirname, '..', 'save', 'posts.json')

    // save posts to file
    fs.writeFile(savePath, postsString, 'utf8', (err) => {
      if (err) throw new Error(err)
      // exist process
      console.log('Posts saved to /save folder')
      process.exit()
    })

  } catch (err) {
    console.error('Error saving posts: ', err.message)
    process.exit(1)
  }
}
savePostsToFile()