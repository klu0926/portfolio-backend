async function getPosts() {
  const response = await fetch('http://localhost:3000/posts')
  const json = await response.json()
  console.log(json.data)
  return json.data
}

async function deletePost(id) {
  const response = await fetch('http://localhost:3000/posts', {
    method: 'DELETE',
    body: JSON.stringify({
      id
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}


async function deleteAllPost() {
  const posts = await getPosts()
  const promises = posts.map(post => {
    return deletePost(post.id)
  })
  await Promise.all(promises)
  console.log('All deleted')
}


deleteAllPost()