import sweetAlert from '../helper/sweetAlert.js'
import { quillControl } from './quill.js'

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
    } catch (err) {
      alert('Can not fetch data')
    }
  }
}

class View {
  constructor() {

  }
  renderImageSelections(data) {
    const files = data.filter(item => item.size > 0)
    const images = files.filter(file => file.url)
    const urls = images.map(image => image.url)

    sweetAlert.showImageSelection(urls)

    console.log('images:', images)
  }
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.delta = null // quill's editor data
    this.saveBtn = document.querySelector('#save')
    this.loadBtn = document.querySelector('#load')
    this.toggleBtn = document.querySelector('#toggle')
    this.testBtn = document.querySelector('#test') // for testing
    this.init()
  }
  init() {
    console.log('loading data...')
    this.model.fetchData().then(() => {
      console.log('loaded')
    })
    this.testBtn.onclick = () => this.testHandler()// test 
    this.saveBtn.onclick = () => this.saveHandler()
    this.loadBtn.onclick = () => this.loadHandler()
    this.toggleBtn.onclick = () => this.toggleHandler()
  }
  saveHandler() {
    this.delta = quillControl.getContents()
    console.log('saved')
  }
  loadHandler() {
    quillControl.setContents(this.delta)
    console.log('loaded')
  }
  toggleHandler() {
    if (quillControl.isEnable()) {
      toggle.textContent = 'Enable'
      quillControl.disable()
    } else {
      toggle.textContent = 'Disable'
      quillControl.enable()
    }
  }
  testHandler() {
    this.view.renderImageSelections(this.model.data)

  }
}
const model = new Model()
const view = new View()
const controller = new Controller(model, view)



