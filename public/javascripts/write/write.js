import sweetAlert from '../helper/sweetAlert.js'
import quillControl from './quill.js'

const defaultPost = {
  title: 'New Post Title',
  data: {}
}

class Model {
  constructor() {
    this.url = 'http://localhost:3000'
    this.objectUrl = this.url + '/objects'
    this.postUrl = this.url + '/posts'
    this.objects = [] // s3 objects (file, folder)
    this.posts = []
    this.currentPost = null
    this.prefix = '' // folder path
    this.map = null
  }
  async fetchObjectsData() {
    try {
      const response = await fetch(this.objectUrl)
      this.objects = await response.json()
      console.log('data fetched')

    } catch (err) {
      alert('Can not fetch data')
    }
  }
  async postFile(form) {
    const formData = new FormData(form)
    return fetch(this.objectUrl, {
      method: 'POST',
      body: formData,
    })
  }
  async getAllPosts() {
    try {
      const response = await fetch(this.postUrl)
      const json = await response.json()
      if (!json.ok) throw new Error(json.message)
      this.posts = json.data // {title, data: string}

      // data to json
      this.posts.forEach(post => {
        post.data = JSON.parse(post.data)
      })
      console.log('posts fetched')
    } catch (err) {
      alert(err.message)
    }
  }
  async postPost(title, quillDelta) {
    try {
      if (!title) throw new Error('Missing title')
      if (!quillDelta) throw new Error('Missing quill delta')
      return fetch(this.postUrl, {
        method: 'POST',
        body: JSON.stringify({
          title,
          data: quillDelta
        }),
        headers: {
          "Content-Type": "application/json",
        }
      })
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }
  async putPost(id, title, quillDelta) {
    try {
      if (!id) throw new Error('Missing post id')
      if (!title) throw new Error('Missing post title')
      if (!quillDelta) throw new Error('Missing quill delta')
      return fetch(this.postUrl, {
        method: 'PUT',
        body: JSON.stringify({
          id,
          title,
          data: quillDelta
        }),
        headers: {
          "Content-Type": "application/json",
        }
      })
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }
  getDataType(type) {
    if (type === 'file') {
      return this.objects.filter(object => object.size > 0)
    } else if (type === 'folder') {
      return this.objects.filter(object => object.size === 0)
    } else {
      return this.objects
    }
  }
}

class View {
  constructor(quillControl) {
    this.quillControl = quillControl
    this.titleInput = document.querySelector('#title-input')
    this.postsSelect = document.querySelector('#posts-select')
    this.editorContainer = document.querySelector('#editor-container')
  }
  setEditorLoading(isLoading) {
    if (isLoading) {
      this.editorContainer.classList.remove('loading')
      this.editorContainer.classList.add('loading')
    } else {
      this.editorContainer.classList.remove('loading')
    }
  }
  renderPostSelect = (posts, onChangeHandler, currentPost) => {
    // takes in posts [] to render post select
    this.postsSelect.innerHTML = ''
    // add default option
    const defaultOption = document.createElement('option')
    defaultOption.innerText = 'Create New Post'
    defaultOption.value = 'new' // default value is new
    this.postsSelect.appendChild(defaultOption)

    // create option per post, set value as posts index
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const option = document.createElement('option')
      option.innerText = post.title
      option.value = posts[i].id // index
      this.postsSelect.appendChild(option)

      // select the current post is has one
      if (currentPost && Number(currentPost.id) === Number(posts[i].id)) {
        option.selected = true
      }
    }

    // add a onChange handler to the select itself
    this.postsSelect.onchange = (e) => onChangeHandler(e)
  }
  renderEditor = (title, delta) => {
    this.titleInput.value = title
    quillControl.setContents(delta)
  }
  // render the images in sweet alert's window (sweetImagesSelect)
  renderImageSelection = (urls, prefix = '') => {
    const filteredUrls = urls.filter(url => {
      const fileName = url.split('/').pop()
      if (url.includes(prefix + fileName)) return true
      return false
    })

    // images
    const imagesHtml = filteredUrls.map(link => {
      const title = link.split('/').pop()
      return (`
      <div class='image-select'>
            <img src="${link}" title="${title}">
      </div>
      `)
    }
    ).join('');
    const imagesContainer = document.createElement('div')
    imagesContainer.innerHTML = imagesHtml
    imagesContainer.classList.add('images-container')

    // append images to container div
    const imagesContainerDiv = document.querySelector('#images-container-div')
    imagesContainerDiv.innerHTML = ''
    imagesContainerDiv.appendChild(imagesContainer)
  }
  buttonLoading(button, loadingClass = 'loading-icon') {
    // take in a button element
    if (!button) {
      console.log('button loading: does not have a button')
      return
    }
    // button loading
    const buttonText = button.innerText
    button.innerText = ''
    button.classList.add(loadingClass)

    // cleanup function
    function resetButton() {
      button.classList.remove(loadingClass)
      button.innerText = buttonText
    }
    return resetButton
  }
}

class Controller {
  constructor(model, view, quillControl, sweetAlert) {
    this.model = model
    this.view = view
    this.quillControl = quillControl
    this.sweetAlert = sweetAlert
    this.delta = null // quill's editor data
    this.saveBtn = document.querySelector('#save')
    this.titleInput = document.querySelector('#title-input')
    this.init()
  }
  init() {
    // disable editor before data loaded
    this.toggleEditor()

    // editor default
    this.view.renderEditor(defaultPost.title, defaultPost.delta)

    // get posts 
    this.model.getAllPosts().then(() => {
      this.view.renderPostSelect(this.model.posts, this.postSelectHandler)
    })

    // get objects data
    this.model.fetchObjectsData().then(() => {
      // enable editor after data loaded
      this.toggleEditor()
    })

    // buttons handlers
    this.saveBtn.onclick = (e) => this.createAndSaveMixHandler(e)

    // quill handler setup
    this.quillControl.setToolbarHandler('image', this.quillImageHandler)

    // set up  sweetAlert did render handler
    this.sweetAlert.didRenderHandlers['SweetImageSelectionDidRender'] = this.SweetImageSelectionDidRender
  }
  async createHandler(e) {
    try {
      // loading button
      const resetButton = this.view.buttonLoading(e.target)

      // get title, data
      const title = this.titleInput.value
      const delta = this.quillControl.getContents()
      const response = await this.model.postPost(title, delta)
      const json = await response.json()
      if (!json.ok) throw new Error(json.message)

      // render post select
      await this.model.getAllPosts()
      this.view.renderPostSelect(this.model.posts, this.postSelectHandler)

      // select the newest post option
      const options = this.view.postsSelect.querySelectorAll('option')
      options.forEach(option => option.selected = false)
      options[options.length - 1].selected = true

      // button reset
      resetButton()
    } catch (err) {
      alert(err.message || err)
    }
  }
  async saveHandler(e) {
    try {
      // Get current post
      const currentPost = this.model.currentPost
      if (!currentPost) return

      // loading button
      const resetButton = this.view.buttonLoading(e.target)

      // get title, data
      const id = currentPost.id
      const title = this.titleInput.value
      const delta = this.quillControl.getContents()
      const response = await this.model.putPost(id, title, delta)
      const json = await response.json()
      if (!json.ok) throw new Error(json.message)

      // render post select
      await this.model.getAllPosts()
      this.view.renderPostSelect(this.model.posts, this.postSelectHandler, this.model.currentPost)

      // button reset
      resetButton()
    } catch (err) {
      alert(err.message || err)
    }
  }
  createAndSaveMixHandler = (e) => {
    if (this.model.currentPost) {
      this.saveHandler(e)
    } else {
      this.createHandler(e)
    }
  }
  toggleEditor() {
    if (this.quillControl.isEnable()) {
      this.quillControl.disable()
      this.view.setEditorLoading(true)
    } else {
      this.quillControl.enable()
      this.view.setEditorLoading(false)
    }
  }
  postSelectHandler = (e) => {
    const select = e.target
    const postId = select.value
    if (postId === 'new') {
      // this is a new post
      this.view.renderEditor(defaultPost.title, defaultPost.delta)
      this.model.currentPost = null
    } else {
      // load old post
      const post = this.model.posts.find(post => Number(post.id) === Number(postId))
      this.view.renderEditor(post.title, post.data)
      // set current post
      this.model.currentPost = post
    }
  }
  // Quill handlers
  // this function is call within Quill, use arrow function to get current scope's 'this'
  quillImageHandler = () => {
    const files = this.model.objects.filter(item => item.size > 0)
    const images = files.filter(file => file.url)
    const urls = images.map(image => image.url)
    this.sweetAlert.showImageSelection(urls)
  }
  // for SweetImageSelectionDidRender
  renderImageSelection = () => {
    const files = this.model.getDataType('file')
    const urls = files.map(file => file.url)

    this.view.renderImageSelection(urls, this.model.prefix)

    // image onclick handler
    const images = document.querySelectorAll('.image-select img')
    images.forEach(image => image.onclick = () => {
      quillControl.insertImage(image.src)
      sweetAlert.close()
    })
  }
  // SweetAlert did render 
  // this function is call within SweetAlert, use arrow function to get current scope's 'this'
  SweetImageSelectionDidRender = () => {
    const folders = this.model.getDataType('folder') // folders

    // render images
    this.renderImageSelection()

    // prefix-select
    const select = document.querySelector('#prefix-select')
    const defaultOption = document.createElement('option')
    defaultOption.value = ''
    defaultOption.textContent = 'All'
    select.appendChild(defaultOption)

    folders.forEach(folder => {
      const option = document.createElement('option')
      option.value = folder.key
      option.innerText = folder.key
      if (this.model.prefix === folder.key) {
        option.selected = true
      }
      select.appendChild(option)
    })
    select.onchange = () => {
      this.model.prefix = select.value
      this.renderImageSelection()
    }
    // upload button
    const uploadBtn = document.querySelector('#upload')
    uploadBtn.onclick = (e) => { postFile(e) }
    const postFile = async (e) => {
      try {
        e.preventDefault()
        const form = document.querySelector('#upload-form')
        const nameInput = form.querySelector('#name-input')
        const keyInput = form.querySelector('#key-input')
        const fileInput = form.querySelector('#file-input')

        if (!fileInput.value) throw new Error('No file to upload')
        if (!nameInput.value) throw new Error('No file name')
        keyInput.value = this.model.prefix + nameInput.value

        // upload button loading
        uploadBtn.innerText = ''
        uploadBtn.classList.add('loading-icon')
        // post file
        const response = await this.model.postFile(form)
        const json = await response.json()
        if (!json.ok) throw new Error(json.error)

        // render images
        await this.model.fetchObjectsData()
        this.renderImageSelection()

        // upload button reset
        uploadBtn.innerText = 'Upload'
        uploadBtn.classList.remove('loading-icon')
      } catch (err) {
        alert(err)
      }
    }
  }
}

const model = new Model()
const view = new View(quillControl)
new Controller(model, view, quillControl, sweetAlert)




