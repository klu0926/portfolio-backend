import youtubeEmbed from "youtube-embed";

// Create a new blot for the iframe
// blot is the building block for Quill (inline, block, blockEmbed)
// blockEmbed : block-level content that is not editable (image, video)
const BlockEmbed = Quill.import('blots/block/embed');
class VideoBlot extends BlockEmbed {
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
VideoBlot.blotName = 'iframe';
VideoBlot.tagName = 'iframe';

// Add a handler to override the video button
function videoHandler() {
  const range = this.quill.getSelection();
  const value = prompt('Please enter video URL:');
  if (value) {
    // (location, blotName, value, user)
    this.quill.insertEmbed(range.index, blotName, youtubeEmbed('iframe'), Quill.sources.USER);
  }
}
export { VideoBlot, videoHandler }
