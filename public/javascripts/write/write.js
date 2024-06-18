import sweetAlert from '../helper/sweetAlert.js'
import quillControl from './quill.js'

const defaultPost = {
  title: 'New Post',
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
  async deletePost(id) {
    try {
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
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }
  async deleteObject(Key) {
    try {
      if (!Key) throw new Error('Missing object key')
      // fetch delete
      return fetch(this.objectUrl, {
        method: 'DELETE',
        body: JSON.stringify({
          Key
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
    this.notifyTimeoutId = null
  }
  setEditorLoading(isLoading) {
    if (isLoading) {
      this.editorContainer.classList.remove('loading')
      this.editorContainer.classList.add('loading')
    } else {
      this.editorContainer.classList.remove('loading')
    }
  }
  renderPostSelect = (posts, currentPost) => {
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
  }
  renderEditor = (title, delta) => {
    this.titleInput.value = title
    quillControl.setContents(delta)
  }
  // render the images in sweet alert's window (sweetImagesSelect)
  renderImageSelection = (files, prefix = '') => {
    // images container 
    const imagesContainerDiv = document.querySelector('#images-container-div')
    imagesContainerDiv.innerHTML = ''

    // get file urls (filter out folders)
    const filterFiles = files.filter(file => {
      const url = file.url
      const fileName = url.split('/').pop()
      if (url.includes(prefix + fileName)) return true
      return false
    })

    // has image
    if (filterFiles.length > 0) {
      // images
      const imagesHtml = filterFiles.map(file => {
        const key = file.key
        const link = file.url
        const title = link.split('/').pop()
        return (`
      <div class='image-select' data-key='${key}'>
            <button type='button' class='delete btn btn-danger'>x</button>
            <img src="${link}" title="${title}">
      </div>
      `)
      }
      ).join('');
      const imagesContainer = document.createElement('div')
      imagesContainer.innerHTML = imagesHtml
      imagesContainer.classList.add('images-container')

      // append images to container div
      imagesContainerDiv.appendChild(imagesContainer)
      return
    }

    // no images
    const noImageText = document.createElement('p')
    noImageText.innerText = 'No Images'
    noImageText.classList.add('text-center', 'mt-3')
    imagesContainerDiv.appendChild(noImageText)
  }
  buttonLoading(button, loadingClass = 'loading-icon') {
    // take in a button element
    if (!button) {
      console.log('button loading: does not have a button')
      return
    }
    // button loading
    const buttonInnerHTML = button.innerHTML
    button.innerHTML = ''
    button.classList.add(loadingClass)

    // cleanup function
    function resetButton() {
      button.classList.remove(loadingClass)
      button.innerHTML = buttonInnerHTML
    }
    return resetButton
  }
  notify(text, time = 1500) {
    const oldNotify = document.querySelector('#notify')
    if (oldNotify) {
      oldNotify.remove()
    }

    const notify = document.createElement('div')
    notify.id = 'notify'
    document.body.appendChild(notify)

    // if is currently showing
    if (this.notifyTimeoutId) {
      clearTimeout(this.notifyTimeoutId)
      this.notifyTimeoutId = null
    }

    // set notify 
    notify.innerText = text
    notify.classList.remove('show')
    notify.classList.add('show')

    this.notifyTimeoutId = setTimeout(() => {
      notify.classList.remove('show')
      this.notifyTimeoutId = null
    }, time)
  }
  toolbarButtonsRender(isNewPost = false) {
    // init some visual setup
    // toolbar
    const toolbar = document.querySelector('.ql-toolbar')

    // buttons div
    const oldButtonsDiv = document.querySelector('.buttons-div')
    if (oldButtonsDiv) {
      oldButtonsDiv.remove()
    }
    const buttonsDiv = document.createElement('div')
    buttonsDiv.classList.add('buttons-div')
    toolbar.appendChild(buttonsDiv)


    // delete post button to toolbar
    if (!isNewPost) {
      const deleteBtn = document.createElement('button')
      deleteBtn.id = 'delete-post'
      deleteBtn.classList.add('btn')
      deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`
      buttonsDiv.appendChild(deleteBtn)
    }

    // save button to  toolbar
    const saveBtn = document.createElement('button')
    saveBtn.id = 'save'
    saveBtn.classList.add('btn')
    saveBtn.innerHTML = `<i class="fa-regular fa-floppy-disk"></i>`
    buttonsDiv.appendChild(saveBtn)
  }
}

class Controller {
  constructor(model, view, quillControl, sweetAlert) {
    this.model = model
    this.view = view
    this.quillControl = quillControl
    this.sweetAlert = sweetAlert
    this.delta = null // quill's editor data
    this.titleInput = document.querySelector('#title-input')
    this.init()
  }
  init() {
    // disable editor before data loaded
    this.toggleEditor()

    // get posts 
    this.model.getAllPosts().then(() => {
      this.view.renderPostSelect(this.model.posts)
      const select = document.querySelector('#posts-select')
      select.onchange = this.postSelectHandler
    })

    // get objects data
    this.model.fetchObjectsData().then(() => {
      // enable editor after data loaded
      this.toggleEditor()
    })

    // toolbar buttons (save / delete )
    this.view.toolbarButtonsRender(true)

    // select post and render editor content
    this.postSelectHandler()

    // -- shortcut handlers
    // ctrl + s
    document.addEventListener('keydown', (e) => {
      if (e.metaKey && e.key === 's') {
        e.preventDefault()
        console.log('saved')
        // save
        this.saveHandler()
      }
    })

    // quill handler setup
    this.quillControl.setToolbarHandler('image', this.quillImageHandler)

    // set up  sweetAlert did render handler
    this.sweetAlert.didRenderHandlers['SweetImageSelectionDidRender'] = this.SweetImageSelectionDidRender
  }
  buttonsHandlerSetup() {
    // buttons handlers

    // save (create) post 
    const saveBtn = document.querySelector('#save')
    if (saveBtn) {
      saveBtn.onclick = (e) => this.createAndSaveMixHandler(e)
    }

    // delete post
    const deleteBtn = document.querySelector('#delete-post')
    if (deleteBtn) {
      const postId = document.querySelector('#posts-select')?.value
      if (!postId || postId == 'new') return
      deleteBtn.onclick = () => {
        this.deletePostHandler(postId)
      }
    }
  }
  // create post (save)
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
      this.view.renderPostSelect(this.model.posts)

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
  // save post (save)
  async saveHandler() {
    try {
      // Get current post
      const currentPost = this.model.currentPost
      if (!currentPost) return

      // loading button
      const saveButton = document.querySelector('#save')
      const resetButton = this.view.buttonLoading(saveButton)

      // get title, data
      const id = currentPost.id
      const title = this.titleInput.value
      const delta = this.quillControl.getContents()
      const response = await this.model.putPost(id, title, delta)
      const json = await response.json()
      if (!json.ok) throw new Error(json.message)

      // render post select
      await this.model.getAllPosts()
      this.view.renderPostSelect(this.model.posts, this.model.currentPost)

      // button reset
      resetButton()

      // notify saved
      this.view.notify('Saved')
    } catch (err) {
      alert(err.message || err)
    }
  }
  async deletePostHandler(postId) {
    try {
      if (!postId) throw new Error('Post Id is missing')

      const result = await sweetAlert.confirm('Do you want to delete post?')
      if (!result.isConfirmed) return

      const response = await this.model.deletePost(postId)
      const json = await response.json()

      if (!json.ok) throw new Error(json.error)
      location.reload()


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
  postSelectHandler = () => {
    const select = document.querySelector('#posts-select')
    const postId = select.value

    if (postId === 'new') {
      // this is a new post
      this.view.renderEditor(defaultPost.title, defaultPost.data)

      // set current post
      this.model.currentPost = null
    } else {
      // load old post
      const post = this.model.posts.find(post => Number(post.id) === Number(postId))
      this.view.renderEditor(post.title, post.data)
      // set current post
      this.model.currentPost = post
    }

    // button handler setup
    this.view.toolbarButtonsRender(postId === 'new')
    this.buttonsHandlerSetup()
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

    // create image select html
    this.view.renderImageSelection(files, this.model.prefix)

    // image onclick handler
    const images = document.querySelectorAll('.image-select img')
    images.forEach(image => image.onclick = () => {
      quillControl.insertImage(image.src)
      sweetAlert.close()
    })

    // delete button handler
    const deletes = document.querySelectorAll('.delete')
    deletes.forEach(d => {
      d.onclick = async () => {
        try {
          // get key from parent .image-select
          const imageSelect = d.parentElement
          const key = imageSelect.dataset['key']

          // confirm
          const isConfirm = confirm(`Delete object key: ${key}?`)
          if (isConfirm) {
            sweetAlert.loading('deleting...')
            await this.model.deleteObject(key)

            // reload data
            await this.model.fetchObjectsData()

            // open image select
            this.quillImageHandler()
            //this.renderImageSelection()
          }
        } catch (err) {
          alert(err)
          this.sweetAlert.closeNow()
        }
      }
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
const controller = new Controller(model, view, quillControl, sweetAlert)

