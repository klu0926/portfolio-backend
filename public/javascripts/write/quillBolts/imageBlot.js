const BlockEmbed = Quill.import('blots/block/embed');

class CustomImageBlot extends BlockEmbed {
  static create(url) {
    const node = super.create();
    node.setAttribute('src', url);
    node.setAttribute('class', 'quill-image resize-drag');
    return node;
  }

  // set image width & height base on attributes
  static formats(node) {
    let format = {};
    if (node.hasAttribute('height')) {
      format.height = node.getAttribute('height');
    }
    if (node.hasAttribute('width')) {
      format.width = node.getAttribute('width');
    }
    return format;
  }

  format(name, value) {
    if (name === 'height' || name === 'width') {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name, value);
      }
    } else {
      super.format(name, value);
    }
  }
  // ----

  static value(node) {
    return node.getAttribute('src');
  }
  static blotName = 'customImage' // use when insertEmbed
  static tagName = 'img'
}

export { CustomImageBlot };
