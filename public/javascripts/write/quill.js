import { VideoBlot, videoHandler } from "./quillBolts/VideoBlot";
import { CustomImageBlot } from './quillBolts/imageBlot'
import { textColorHandler, typeCurrentColor } from './quillBolts/textColorHandler'
import invertImageHandler from "./quillBolts/invertImageHandler";

// register custom blots
Quill.register(VideoBlot);
Quill.register(CustomImageBlot);


// options
const toolbarOptions = {
  container: [
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline'],
    ['link', 'image', 'video'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['color',],
    [{ 'background': [] }],
    [{ 'align': [] }],
    ['clean'],
    ['invertImage']
  ],
  // override toolbar button handlers
  handlers: {
    'video': videoHandler,
    'color': textColorHandler,
    'invertImage': invertImageHandler
  },
}

// setup quill icons's element
const icons = Quill.import('ui/icons') // get the Quill icons
icons['invertImage'] = '<i class="fa-solid fa-image"></i>'


// quill options
const options = {
  modules: {
    toolbar: toolbarOptions,
  },
  theme: 'snow',
}

const editor = document.querySelector('#editor')
const quill = new Quill('#editor', options)

// controller
class QuillControl {
  constructor(editor, quill) {
    this.editor = editor
    this.quill = quill
    this.toolbar = document.querySelector('.ql-toolbar')
  }
  getSelection() {
    return this.quill.getSelection()
  }
  getLeaf(rangeIndex) {
    return this.quill.getLeaf(rangeIndex)
  }
  getContents() {
    return this.quill.getContents()
  }
  setContents(delta, user = 'user') {
    this.quill.setContents(delta, user)
  }
  insertImage(url) {
    const index = quill.getSelection(true).index
    // use custom image blot
    quill.insertEmbed(index, CustomImageBlot.blotName, url, 'user')
  }
  enable() {
    this.quill.enable()
    this.editor.style.backgroundColor = '#ffffff'
    this.toolbar.style.backgroundColor = '#ffffff'
  }
  disable() {
    this.quill.disable()
    this.editor.style.backgroundColor = '#f0f0f0'
    this.toolbar.style.backgroundColor = '#f0f0f0'
  }
  isEnable = () => {
    return this.quill.isEnabled()
  }
  // use to set ops attributes (imageBlot now use attributes to set image inline style)
  format(key, value) {
    quill.format(key, value);
  }
  removeFormat(key) {
    quill.removeFormat(key)
  }
  // key is the handler key, the toolbar's button name
  setToolbarHandler(key, handlerFunction) {
    const isEnable = this.isEnable

    // Define a guard function to wrap around the original handlerFunction.
    function guardFunction() {
      if (isEnable()) {
        handlerFunction.apply(this, arguments);
      }
    }
    var toolbar = quill.getModule('toolbar');
    toolbar.addHandler(key, guardFunction);
  }
}

// listener
// Always type with current text color
document.onkeydown = typeCurrentColor

const quillControl = new QuillControl(editor, quill)
export default quillControl
