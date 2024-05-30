// Model
class Model {
  constructor() {
    this.url = 'http://localhost:3000/objects'
    this.data = [] // all data
    this.prefix = '' // folder path
  }
  async fetchData() {
    const response = await fetch(this.url)
    this.data = await response.json()
    console.log('data:', this.data)
  }
  async uploadObject(form) {
    const formData = new FormData(form)
    await fetch(this.url, {
      method: 'POST',
      body: formData
    })
  }
  getObjectURL(prefix, delimiter) {
    return `${this.url}?prefix=${prefix || ''}&delimiter=${delimiter || ''}`
  }
  getDataType(type) {
    return this.data.filter(item => item.type === type)
  }
  getKeyPrefix(key) {
    const paths = key.split('/')
    let prefix = ''
    for (let i = 0; i < paths.length - 1; i++) {
      prefix = `${prefix}${paths[i]}/`
    }
    return prefix
  }
  createFolderMap() {
    const folders = this.getDataType('folder')
    const map = new Map()

    folders.forEach(folder => {
      const paths = folder.key.split('/')
      let prefix = ''
      for (let i = 0; i < paths.length - 1; i++) {
        prefix = `${prefix}${paths[i]}/`
        map.set(paths[i], prefix)
      }
    })
    return map
  }
  setCurrentPrefix(prefix) {
    this.prefix = prefix
  }
}

// View
class View {
  constructor(model, controller) {
    this.model = model
    this.controller = controller
    this.table = document.querySelector('#bucket-table')
    this.tableBody = document.querySelector('#table-body')
  }
  renderTableBody() {
    // clean up
    this.tableBody.innerHTML = ''

    // add loading
    const loadingRow = document.createElement('tr')
    const loadingTd = document.createElement('td')
    loadingTd.innerText = 'Loading...'
    loadingTd.colSpan = 4
    loadingTd.classList = ['text-center']
    loadingRow.appendChild(loadingTd)
    this.tableBody.appendChild(loadingRow)

    // filter object with prefix 
    const allFiles = this.model.getDataType('file')
    const regex = new RegExp(`^${this.model.prefix}[^/]+/?$`);
    const files = allFiles.filter(item => regex.test(item.key))

    // remove loading
    loadingRow.remove()

    // if contents is empty
    if (files.length === 0) {
      const row = document.createElement('tr')
      const td = document.createElement('td')
      td.innerText = 'no file'
      td.colSpan = 1000
      td.classList = ['text-center']
      row.appendChild(td)
      this.tableBody.appendChild(row)
      return
    }

    // Generate table row
    for (const file of files) {
      const row = document.createElement('tr')
      // Key
      const keyCol = document.createElement('td')
      const keyLink = document.createElement('a')
      keyCol.appendChild(keyLink)
      keyLink.innerText = file.key
      keyLink.target = '_blank'
      keyLink.href = file.url
      row.appendChild(keyCol)

      // type
      const typeCol = document.createElement('td')
      typeCol.innerText = file.type
      row.appendChild(typeCol)

      // Size
      const sizeCol = document.createElement('td')
      sizeCol.innerText = file.bytes || ''
      row.appendChild(sizeCol)

      // delete
      const deleteCol = document.createElement('td')
      const deleteButton = document.createElement('button')
      deleteButton.innerText = 'Delete'
      deleteButton.classList.add('btn', 'btn-danger')
      deleteButton.onclick = (e) => {
        this.controller.deleteObjectButtonFnc(e.target, file.key)
      }
      deleteCol.appendChild(deleteButton)
      row.appendChild(deleteCol)

      // append to table-body
      this.tableBody.appendChild(row)
    }
  }
  createFolderMapLinks(folderMap) {
    const div = document.createElement('div')

    function appendFolderLink(key, prefix) {
      const link = document.createElement('a')
      link.href = '#'
      link.innerText = key
      link.classList.add('folder-link')

      // link on click 
      link.onclick = function (e) {
        e.preventDefault()
        // controller
        view.controller.switchFolderButtonFunc(prefix)
      }
      // color current prefix link
      if (prefix === view.model.prefix) {
        link.classList.add('text-danger')
      }

      const span = document.createElement('span')
      span.innerText = ' / '
      div.appendChild(link)
      div.appendChild(span)
    }

    // Root folder
    appendFolderLink('Root', '')

    // Other folders
    for (const [key, prefix] of folderMap.entries()) {
      appendFolderLink(key, prefix)
    }
    return div
  }
  async renderFolderMap() {
    const folderMapContainer = document.querySelector('#folder-map-container')
    folderMapContainer.innerHTML = ''

    // filter content type
    const folders = this.model.getDataType('folder')

    // create folders map
    const foldersMap = this.model.createFolderMap(folders)
    const foldersMapDiv = this.createFolderMapLinks(foldersMap)
    // insert 
    folderMapContainer.appendChild(foldersMapDiv)

  }
  resetUploadForm() {
    const keyInput = document.querySelector('#key-input')
    const fileInput = document.querySelector('#file-input')
    const button = document.querySelector('#upload')
    keyInput.value = ''
    fileInput.value = null
    button.innerHTML = ''
    button.innerText = 'Upload'
  }
}

// Controller
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
  async init() {
    await this.fetchAndRender()
    // set upload button
    const upload = document.querySelector('#upload')
    upload.onclick = (e) => {
      e.preventDefault()
      this.uploadButtonFuc()
    }
  }
  async fetchAndRender() {
    await this.model.fetchData()
    this.view.renderTableBody()
    this.view.renderFolderMap()
  }
  async deleteObjectButtonFnc(button, Key) {
    const isConfirm = confirm(`Do you want to delete ${Key}?`)
    if (isConfirm) {
      // show loading icon
      button.innerHTML = ''
      const loading = document.createElement('div')
      loading.classList.add('loading-icon')
      button.appendChild(loading)

      // DELETE
      await fetch(this.model.url, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Key })
      })
      this.fetchAndRender()
    }
  }
  async uploadButtonFuc() {
    try {
      const form = document.querySelector('#upload-form')
      const nameInput = document.querySelector('#name-input')
      const keyInput = document.querySelector('#key-input') // hidden
      const fileInput = document.querySelector('#file-input')
      const upload = document.querySelector('#upload')

      if (!form) throw new Error('Missing upload form')
      if (!nameInput.value?.trim()) throw new Error('Missing Key')
      if (!fileInput.files) throw new Error('Missing File')

      // add prefix to key
      keyInput.value = this.model.prefix + nameInput.value

      // loading icon
      upload.innerHTML = ''
      const loading = document.createElement('div')
      loading.classList.add('loading-icon')
      upload.appendChild(loading)

      // POST 
      await this.model.uploadObject(form)
      this.view.resetUploadForm()
      this.fetchAndRender()

    } catch (err) {
      alert(err)
    }
  }
  switchFolderButtonFunc(prefix) {
    controller.model.setCurrentPrefix(prefix)
    controller.view.renderTableBody()
    controller.view.renderFolderMap()
  }
}

const model = new Model()
const view = new View()
const controller = new Controller()
view.model = model
view.controller = controller
controller.model = model
controller.view = view
controller.init()