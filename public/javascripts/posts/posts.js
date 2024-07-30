import dayjs from 'dayjs'
import sweetAlert from '../helper/sweetAlert.js'
import getUrl from '../helper/getHostUrl.js'

// ---------- Model
class Model {
  constructor() {
    this.url = getUrl()
    this.postUrl = this.url + '/posts'
    this.swapUrl = this.url + '/posts' + '/swap-order'
    this.posts = []
  }
  async fetchPosts() {
    try {
      const response = await fetch(this.postUrl)
      const json = await response.json()
      if (!json.ok) {
        throw new Error(json.err)
      }
      this.posts = json.data
    } catch (err) {
      sweetAlert.error('fetch post error:', err.message)
    }
  }
  async swapPostsOrder(postId1, postId2) {
    try {
      if (!postId1 || !postId2) {
        throw new Error(`Swap post missing ids: postId1: ${postId1}, postId2: ${postId2}`)
      }
      const response = await fetch(this.swapUrl, {
        headers: {
          "Content-Type": "application/json"
        },
        method: 'PUT',
        body: JSON.stringify({
          postId1,
          postId2
        })
      })
      const json = await response.json()
      if (!json.ok) {
        throw new Error(json.err)
      }
    } catch (err) {
      sweetAlert.error('swap post order error:', err.message)
    }
  }
  async deletePost(id) {
    if (!id) throw new Error('Missing post id')
    return fetch(this.postUrl, {
      method: 'Delete',
      body: JSON.stringify({
        id,
      }),
      headers: {
        "Content-Type": "application/json",
      }
    })
  }
}

// ---------- VIEW
class View {
  constructor() {
    this.tableBody = document.querySelector('#table-body')
  }
  renderPostsTable(posts) {
    let postsRows = posts.map((post, index) => {

      const url = window.location.href
      const base = new URL(url).origin
      const postUrl = base + '/write.html' + '?' + 'postId=' + post.id

      return `
      <tr class='post-row' draggable="true" data-post-id=${post.id}>
        <th class='post-td' scope="row">
        <span>${index + 1}</span>
        </td>
        <td class='post-td'>
        <a href='${postUrl}' target='_blank'>${post.title}</a>
        </td>
        <td class='post-td'>${post.id}</th>
        <td class='post-td'>${dayjs(post.createdAt).format('MMM D, YYYY  h:mm A	')}</td>
         <td class='post-td'><button class="btn btn-danger delete" data-id='${post.id}'>delete</button></th>
      </tr>`
    });
    this.tableBody.innerHTML = postsRows.join('')
  }
}

// ---------- CONTROLLER
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.swapPosts = []
  }
  async init() {
    await this.fetchData()
    this.renderPostsTable()
  }
  // All data fetching
  async fetchData() {
    await this.model.fetchPosts()
  }
  // posts table
  renderPostsTable() {
    this.view.renderPostsTable(this.model.posts)
    this.postsTableHandlerSetup()
  }
  postsTableHandlerSetup = () => {
    // posts table handlers 
    const postRows = document.querySelectorAll('.post-row')
    postRows.forEach(row => {
      row.addEventListener('dragstart', this.dragStart_handler)
      row.addEventListener('dragend', this.dragEnd_handler)
      row.addEventListener('dragenter', this.dragEnter_handler)
      row.addEventListener('dragleave', this.dragLeave_handler)
      row.addEventListener('mouseenter', this.mouseEnter_handler)
      row.addEventListener('mouseleave', this.mouseLeave_handler)

      // drop event
      // 'dragover' needs to be handle in order to trigger 'drop' event
      row.addEventListener('dragover', this.dragOver_handler)
      row.addEventListener('drop', this.drop_handler)

      // delete button
      const deleteBtn = row.querySelector('.delete')
      deleteBtn.addEventListener('click', this.deletePostHandler)
    })


  }
  dragStart_handler = (e) => {
    e.target.classList.add('table-primary')
    this.swapPosts[0] = e.target.dataset.postId
  }
  dragEnd_handler = (e) => {
    e.target.classList.remove('table-primary')
    // check if both swapPost exist, swap
  }
  dragOver_handler = (e) => {
    // this is require for drop even to trigger
    e.preventDefault()
  }
  drop_handler = async (e) => {
    e.preventDefault()
    // get posts ids
    const post1Id = this.swapPosts[0]
    const post2Id = e.target.parentNode.dataset.postId

    if (!post1Id || !post2Id) return

    // swap post
    await this.model.swapPostsOrder(post1Id, post2Id)

    // get posts
    await this.model.fetchPosts()

    // render table 
    this.renderPostsTable()
  }
  dragEnter_handler = (e) => {
    e.preventDefault()
    e.target.parentNode.classList.add('table-primary')
  }
  dragLeave_handler = (e) => {
    e.preventDefault()
    e.target.parentNode.classList.remove('table-primary')
  }
  mouseEnter_handler = (e) => {
    e.target.classList.add('table-secondary')
  }
  mouseLeave_handler = (e) => {
    e.target.classList.remove('table-secondary')
  }
  async swapPostOrderHandler(postId1, postId2) {
    await this.model.swapPostsOrder(postId1, postId2)
    await this.model.fetchPosts()
    this.view.renderPostsTable()
  }
  deletePostHandler = async (e) => {
    try {
      const result = await sweetAlert.confirm('Delete Post?')

      if (result.isConfirmed) {
        const postId = e.target.dataset.id
        const response = await this.model.deletePost(postId)
        const json = await response.json()
        if (!json.ok) throw new Error(json.err)
        await sweetAlert.success('Post Deleted')
        window.location.reload()
      }

    } catch (err) {
      sweetAlert.error('Fail to Delete', err.message)
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const model = new Model()
  const view = new View()
  const controller = new Controller(model, view)
  controller.init()
})