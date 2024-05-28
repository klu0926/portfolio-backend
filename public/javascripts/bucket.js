import { insertBefore, insertAfter } from './helper/insert.js'

const URL = 'http://localhost:3000/objects'

function getObjectsURL(prefix) {
  return `${URL}?prefix=${prefix}`
}

async function fetchData(url) {
  const response = await fetch(url)
  const contents = await response.json()

  contents.sort((a, b) => {
    // a is less than b
    if (a.type === 'file' && b.type === 'folder') {
      return -1
    }
    // b is less than a
    else if (a.type === 'folder' && b.type === 'file') {
      return 1
    }
    else {
      return 0
    }
  })
  return contents
}

async function renderTable(prefix) {
  try {
    const url = URL
    const table = document.querySelector('table')
    const prefixCurrent = document.querySelector('#prefix-current')

    if (!url) throw new Error('Missing url')
    if (!table) throw new Error('Missing table')

    const tableBody = table.querySelector('tbody')
    // clear body
    tableBody.innerHTML = ''

    // add loading
    const loadingRow = document.createElement('tr')
    const loadingTd = document.createElement('td')
    loadingTd.innerText = 'Loading...'
    loadingTd.colSpan = 4
    loadingTd.classList = ['text-center']
    loadingRow.appendChild(loadingTd)
    tableBody.appendChild(loadingRow)

    // fetch data
    // prefix = s3 folder directory (eg: 'folderA/folderB')
    const content = await fetchData(getObjectsURL(prefix))
    console.log('content:', content)

    // remove loading
    loadingRow.remove()

    // current prefix
    prefixCurrent.innerText = prefix

    // Generate table row
    for (const object of content) {
      // escape current folder
      if (object.key === prefix) {
        continue
      }
      const row = document.createElement('tr')
      // row color
      if (object.type === 'folder') {
        row.classList.add('table-secondary')
      }

      // Key
      const keyCol = document.createElement('td')
      const keyLink = document.createElement('a')
      keyCol.appendChild(keyLink)
      keyLink.innerText = object.key
      // link to render folder
      if (object.type === 'folder') {
        keyLink.href = '#'
        keyLink.addEventListener('click', (e) => {
          e.preventDefault()
          renderTable(object.key)
        })
      } else {
        keyLink.target = '_blank'
        keyLink.href = object.url
      }
      row.appendChild(keyCol)

      // type
      const typeCol = document.createElement('td')
      typeCol.innerText = object.type
      row.appendChild(typeCol)

      // Size
      const sizeCol = document.createElement('td')
      sizeCol.innerText = object.bytes || ''
      row.appendChild(sizeCol)

      // delete
      const deleteCol = document.createElement('td')
      const deleteButton = document.createElement('button')
      deleteButton.innerText = 'Delete'
      deleteButton.classList.add('btn', 'btn-danger')
      deleteCol.appendChild(deleteButton)
      row.appendChild(deleteCol)

      // append to table-body
      tableBody.appendChild(row)
    }
  } catch (err) {
    console.error(err.stack)
  }
}

// root path
const prefixRoot = document.querySelector('#prefix-root')
prefixRoot.onclick = (e) => {
  e.preventDefault()
  renderTable('')
}


// START
// (fetch objects API, Table, Prefix)
// Prefix (eg: folderA/folderB/), all with '/' in the end
renderTable('portfolio/')