import youtubeEmbed from "youtube-embed";

// Create a new blot for the iframe
// blot is the building block for Quill (inline, block, blockEmbed)
// blockEmbed : block-level content that is not editable (image, video)
const BlockEmbed = Quill.import('blots/block/embed');
class IframeBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', true);
    node.setAttribute('src', value);
    // Set minimum and maximum width
    node.style.setProperty('width', '900px');
    node.style.setProperty('max-width', '100%');
    // Set minimum and maximum height
    node.style.setProperty('height', '500px');
    node.style.setProperty('max-height', '1000px');

    return node;
  }

  static value(node) {
    return node.getAttribute('src');
  }
}
// blotName : internal name for blot within Quill (for reference)
// tagName :  tell Quill which HTML element tag to use when render
IframeBlot.blotName = 'iframe';
IframeBlot.tagName = 'iframe';

// Add a handler to override the video button
function videoHandler() {
  const range = this.quill.getSelection();
  const value = prompt('Please enter video URL:');
  if (value) {
    // (location, blotName, value, user)
    this.quill.insertEmbed(range.index, 'iframe', youtubeEmbed(value), Quill.sources.USER);
  }
}

// register custom blot ()
Quill.register(IframeBlot);


// options
const toolbarOptions = {
  container: [
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline'],
    ['link', 'image', 'video'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],  // dropdown with defaults from theme
    //[{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
  ],
  // override toolbar button handlers
  handlers: {
    'video': videoHandler
  },
}


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

const quillControl = new QuillControl(editor, quill)
export default quillControl 