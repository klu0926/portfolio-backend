import quillControl from "../quill";

function invertImageHandler() {
  console.log('invert handler')
  const range = quillControl.getSelection()
  if (!range) return

  const [blot] = quillControl.getLeaf(range.index);
  if (!blot) return

  const currentInvert = blot.domNode.hasAttribute('invert');
  if (currentInvert) {
    console.log('remove')
    blot.domNode.removeAttribute('invert')
    blot.format('invert', false)
  } else {

    console.log('add')
    blot.format('invert', true);
  }
}

export default invertImageHandler