import quillControl from "../quill"

function textColorHandler(e) {
  const quill = quillControl.quill
  // parent
  const colorPickerButton = document.querySelector('.ql-color-picker')

  // find if color div exist
  let colorPickerDiv = document.querySelector('.text-color-picker')

  // if color div doesn't exist, create one
  if (!colorPickerDiv) {
    // create span
    colorPickerDiv = document.createElement('span')
    colorPickerDiv.className = 'text-color-picker'
    colorPickerDiv.innerHTML = `
    <div id='text-color-picker' class='color-picker' >
      <input id='text-color-input' class='text-color-input' type='color'>
      <button id='text-color-ok' class='ok-button'>OK</button>
    </div>
  `
    colorPickerButton.appendChild(colorPickerDiv)

    // handle color input
    const colorInput = document.querySelector('#text-color-input')
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        quill.format('color', e.target.value)
        quillControl.currentColor = e.target.value
      })
    }

    // handle ok button click 
    const okButtonHandler = () => {
      if (colorInput.value) {
        quill.format('color', colorInput.value)
      }
    }
    const okButton = document.querySelector('#text-color-ok')
    if (okButton) {
      okButton.addEventListener('click', okButtonHandler)
    }

  }

  function toggle(mode) {
    if (mode === 'on') {
      colorPickerDiv.style.display = 'inline'
    }
    if (mode === 'off') {
      colorPickerDiv.style.display = 'none'
    }
  }

  // show span
  toggle('on')

  // click off item to toggle off
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target.classList.contains('ql-color')) return
    if (target.classList.contains('ql-stroke')) return
    if (target.classList.contains('text-color-input')) return
    if (target.parentElement.classList.contains('ql-color')) return
    toggle('off')
  })
}

const typeCurrentColor = (event) => {
  // ignore when meta key is pressed (eg: command, option)
  if (event.metaKey) return
  // ignore if not using quill editor
  if (document.activeElement !== quillControl.quill.root) return

  // ignore if using nonCharKey
  const nonCharKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift', 'CapsLock', 'Tab'];
  if (nonCharKeys.includes(event.key)) {
    return
  }

  // check if currentColor is selected
  if (!quillControl?.currentColor) {
    return
  }
  // format inserted text to currentColor
  quillControl.format('color', quillControl.currentColor)
}

export { textColorHandler, typeCurrentColor }