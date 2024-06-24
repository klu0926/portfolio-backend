function textColorHandler() {
  const quill = this.quill
  // parent
  const colorPicker = document.querySelector('.ql-color-picker')

  // children
  let pickerSpan = document.querySelector('.text-color-picker')

  if (!pickerSpan) {
    // create span
    pickerSpan = document.createElement('span')
    pickerSpan.className = 'text-color-picker'
    pickerSpan.innerHTML = `
    <div id='text-color-picker' class='color-picker' >
      <input id='text-color-input' class='text-color-input' type='color'>
      <button id='text-color-btn' class='ok-btn' type="button">OK</button>
    </div>
  `
    colorPicker.appendChild(pickerSpan)
  }

  function toggle(mode) {
    if (mode === 'on') {
      pickerSpan.style.display = 'inline'
    }
    if (mode === 'off') {
      pickerSpan.style.display = 'none'
    }
  }

  function textColorBtnHandler() {
    const colorInput = document.querySelector('#text-color-input')
    quill.format('color', colorInput.value)
  }

  // show span
  toggle('on')

  // handler
  document.addEventListener('click', (e) => {
    const target = e.target
    if (target.classList.contains('ql-color')) return
    if (target.classList.contains('ql-stroke')) return
    if (target.classList.contains('text-color-input')) return
    if (target.parentElement.classList.contains('ql-color')) return
    toggle('off')
  })

  // ok btn
  const textColorBtn = document.querySelector('#text-color-btn')
  if (textColorBtn) {
    textColorBtn.onclick = () => {
      textColorBtnHandler()
    }
  }
}

export { textColorHandler }