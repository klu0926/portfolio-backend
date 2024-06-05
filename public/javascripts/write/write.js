import sweetAlert from '../helper/sweetAlert.js'
import quillControl from './quill.js'

class Model {
  constructor() {
    this.url = 'http://localhost:3000'
    this.objectUrl = this.url + '/objects'
    this.data = [] // all data
    this.prefix = '' // folder path
    this.map = null
  }
  async fetchData() {
    try {
      const response = await fetch(this.objectUrl)
      this.data = await response.json()
      console.log('data fetched')

    } catch (err) {
      alert('Can not fetch data')
    }
  }
  async postFile(form) {
    const formData = new FormData(form)
    return fetch(this.objectUrl, {
      method: 'POST',
      body: formData
    })
  }
  getDataType(type) {
    if (type === 'file') {
      return this.data.filter(object => object.size > 0)
    } else if (type === 'folder') {
      return this.data.filter(object => object.size === 0)
    } else {
      return this.data
    }
  }
}

class View {
  constructor() {
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
}

class Controller {
  constructor(model, view, quillControl, sweetAlert) {
    this.model = model
    this.view = view
    this.quillControl = quillControl
    this.sweetAlert = sweetAlert
    this.delta = null // quill's editor data
    this.saveBtn = document.querySelector('#save')
    this.loadBtn = document.querySelector('#load')
    this.testBtn = document.querySelector('#test') // for testing
    this.init()
  }
  init() {
    // disable editor before data loaded
    this.toggleEditor()

    this.model.fetchData().then(() => {
      // enable editor after data loaded
      this.toggleEditor()
    })
    this.testBtn.onclick = () => this.testHandler()// test 
    this.saveBtn.onclick = () => this.saveHandler()
    this.loadBtn.onclick = () => this.loadHandler()

    // quill handler setup
    this.quillControl.setToolbarHandler('image', this.quillImageHandler)

    // set up  sweetAlert did render handler
    this.sweetAlert.didRenderHandlers['SweetImageSelectionDidRender'] = this.SweetImageSelectionDidRender

  }
  saveHandler() {
    this.delta = this.quillControl.getContents()
    console.log('saved')
  }
  loadHandler() {
    this.quillControl.setContents(this.delta)
    console.log('loaded')
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
  // Quill handlers
  // this function is call within Quill, use arrow function to get current scope's 'this'
  quillImageHandler = () => {
    const files = this.model.data.filter(item => item.size > 0)
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
        await this.model.fetchData()
        this.renderImageSelection()

        // upload button reset
        uploadBtn.innerText = 'Upload'
        uploadBtn.classList.remove('loading-icon')
      } catch (err) {
        alert(err)
      }
    }
  }
  testHandler() {
    console.log('test')
  }
}

const model = new Model()
const view = new View()
new Controller(model, view, quillControl, sweetAlert)




