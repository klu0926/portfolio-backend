const flashNote = {
  insert: (message, color = 'blue', timer = 1500) => {
    // remove old note
    const oldNote = document.querySelector('.flashNote')
    if (oldNote) oldNote.remove()

    // create new note
    const body = document.body
    const note = document.createElement('div')
    note.classList.add('flashNote')
    note.innerText = message

    // add color class
    switch (color) {
      case 'blue':
        note.classList.add('note-blue')
        break;
      case 'red':
        note.classList.add('note-red')
        break;
      case 'orange':
        note.classList.add('note-orange')
        break;
      default:
        note.classList.add('note-blue')
    }

    if (body) {
      body.appendChild(note)

      // remove node on timer
      setTimeout(() => {
        note.remove()
      }, timer);
    } else {
      alert('Missing body in FlashNode')
    }
  },
  bulkInsert: (messageObjectArray) => {
    if (!Array.isArray(messageObjectArray)) {
      alert('FlashNote: first argument must be an array of message object')
    }

    const baseDelay = 500
    // iterate over the array
    messageObjectArray.forEach((messageObject, index) => {
      const { message, color, timer } = messageObject
      // calculate delay for each message
      const delay = index * (timer + baseDelay)

      // schedule insertion with delay
      setTimeout(() => {
        flashNote.insert(message, color, timer)
      }, delay)
    })
  }
}


export default flashNote