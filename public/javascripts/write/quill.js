import sweetAlert from '/javascripts/helper/sweetAlert.js'
import { controller as writeControl } from './write.js'

function quillInsertImage(url) {
  try {
    if (!url) throw new Error('沒有輸入url')
    if (!quill) throw new Error('quill沒有內容')
    const range = quill.getSelection()
    quill.insertEmbed(range.index, 'image', url);
  } catch (err) {
    throw err
  }
}

function uploadImageHandler() {
  console.log('upload image')

  const input = document.createElement('input')
  input.style.display = 'none'
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');

  input.onchange = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('picture', file)

      // show loading
      sweetAlert.loading('上傳照片中...')

      // upload to server
      const url = '/upload'
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })
      if (!response) throw new Error('無法取得Response')
      const json = await response.json()
      if (!json.ok) throw new Error(json.err)
      const imgurUrl = json.data // imgurUrl

      // finished: 
      // remove input
      input.remove()
      // insert image to quill
      quillInsertImage(imgurUrl)
      // close loading
      sweetAlert.close()
    } catch (err) {
      await sweetAlert.error('上傳照片失敗', err.message || err)
    }
  }
  // append input to body and click
  document.body.appendChild(input)
  input.click()
}


const toolbarOptions = {
  container: [
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    ['bold', 'italic', 'underline'],
    ['link', 'image', 'video'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],  // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
  ],
  handlers: {
    'image': () => {
      writeControl.showImageSelector()
    }
  }
}


// quill options
const options = {
  modules: {
    toolbar: toolbarOptions,
  },
  theme: 'snow'
}


const editor = document.querySelector('#editor')
const quill = new Quill('#editor', options)


// controller
class QuillControl {
  constructor(editor, quill) {
    this.editor = editor
    this.quill = quill
    this.isEditorEnable = true
  }
  getContents() {
    return this.quill.getContents()
  }
  setContents(delta, user = 'user') {
    this.quill.setContents(delta, user)
  }
  insertImage(url) {
    const index = quill.getSelection(true).index
    quill.insertEmbed(index, 'image', url, 'user')
  }
  enable() {
    this.quill.enable()
    this.editor.style.backgroundColor = '#ffffff'
    this.isEditorEnable = true
  }
  disable() {
    this.quill.disable()
    this.editor.style.backgroundColor = '#f0f0f0'
    this.isEditorEnable = false
  }
  isEnable() {
    console.log(this.isEditorEnable)
    return this.isEditorEnable
  }
}

const quillControl = new QuillControl(editor, quill)
export { quillControl }