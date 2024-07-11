// blots/block: block-level content like paragraph
// blots/block/embed: block-level content that embeds other content like image, video
// blots/embed: inline content that embeds other contents like image, video

const Embed = Quill.import('blots/embed');


class CustomImageBlot extends Embed {
  static create(url) {
    const node = super.create();
    node.setAttribute('src', url);
    node.setAttribute('class', 'quill-image resize-drag');
    node.setAttribute('width', '100%');
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
    if (node.hasAttribute('invert')) {
      format.invert = node.getAttribute('invert');
    }
    return format;
  }

  // when quill is using the .formate method on a object (quill.formate)
  format(name, value) {
    let isFormatted = false
    if (name === 'height' || name === 'width') {
      isFormatted = true
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    }

    if (name === 'invert') {
      isFormatted = true
      if (value) {
        this.domNode.style.filter = 'invert(1)';
        this.domNode.setAttribute('invert', 'true');
      } else {
        this.domNode.style.filter = '';
        this.domNode.removeAttribute('invert');
      }
    }

    if (!isFormatted) {
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
