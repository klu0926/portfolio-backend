const array = [
  {
    postId: 5,
    tagId: 1,
    createdAt: '2024-07-12T07:49:13.000Z',
    updatedAt: '2024-07-12T07:49:13.000Z'
  },
  {
    postId: 5,
    tagId: 2,
    createdAt: '2024-07-12T07:49:13.000Z',
    updatedAt: '2024-07-12T07:49:13.000Z'
  },
]


array.forEach(obj => {
  delete obj.createdAt
  delete obj.updatedAt
})

console.log(array)