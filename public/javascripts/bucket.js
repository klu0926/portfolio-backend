import { insertBefore, insertAfter } from './helper/insert.js'

// Data
const URL = 'http://localhost:3000/objects'
function getObjectsURL(prefix, delimiter) {
  return `${URL}?prefix=${prefix || ''}&delimiter=${delimiter || ''}`
}

async function fetchData(url) {
  const response = await fetch(url)
  const contents = await response.json()
  return contents
}

async function uploadObject() {
  try {
    const form = document.querySelector('#upload-form')
    const keyInput = document.querySelector('#key-input')
    const fileInput = document.querySelector('#file-input')
    const button = document.querySelector('#upload')

    if (!form) throw new Error('Missing upload form')
    if (!keyInput.value?.trim()) throw new Error('Missing Key')
    if (!fileInput.files) throw new Error('Missing File')
    // loading icon
    button.innerHTML = ''
    const loading = document.createElement('div')
    loading.classList.add('loading-icon')
    button.appendChild(loading)

    // POST 
    const formData = new FormData(form)
    await fetch(URL, {
      method: 'POST',
      body: formData
    })


    renderTable()
    resetUploadForm()
  } catch (err) {
    alert(err)
  }
}

function resetUploadForm() {
  const keyInput = document.querySelector('#key-input')
  const fileInput = document.querySelector('#file-input')
  const button = document.querySelector('#upload')
  keyInput.value = ''
  fileInput.value = null
  button.innerHTML = ''
  button.innerText = 'Upload'
}

async function deleteObjectButtonFnc(button, Key) {
  const isConfirm = confirm(`Do you want to delete ${Key}?`)
  if (isConfirm) {
    button.innerHTML = ''
    const loading = document.createElement('div')
    loading.classList.add('loading-icon')
    button.appendChild(loading)
    await fetch(URL, {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Key })
    })
    renderTable()
  }
}

function sortContentType(contents) {
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


// Data process
function filterContentsType(contents, type) {
  return contents.filter(item => item.type === type)
}

function createFolderMap(folders) {
  const map = new Map()
  folders.forEach(folder => {
    const paths = folder.key.split('/')
    let prefix = ''
    for (let i = 0; i < paths.length - 1; i++) {
      prefix = `${prefix}${paths[i]}/`
      map.set(paths[i], prefix)
    }
  })
  return map
}

// View
// use folderMap created from createFolderMap function
// generate a div with each folder as links
// takes in render table function for each link
function createFolderMapLinks(folderMap, renderTableFunction) {
  const div = document.createElement('div')
  div.id = 'folder-map-div'

  function appendFolderLink(key, prefix, isCurrent = false) {
    const link = document.createElement('a')
    link.href = '#'
    link.innerText = key
    link.classList.add('folder-link')
    if (isCurrent) {
      link.classList.add('text-danger')
    }
    // link on click 
    link.onclick = (e) => {
      e.preventDefault()
      renderTableFunction(prefix)
      // color current link
      const links = div.querySelectorAll('.folder-link')
      links.forEach(l => l.classList.remove('text-danger'))
      link.classList.add('text-danger')
    }
    const span = document.createElement('span')
    span.innerText = ' / '
    div.appendChild(link)
    div.appendChild(span)

  }
  // Root folder
  appendFolderLink('Root', '', true)

  // Other folders
  for (const [key, prefix] of folderMap.entries()) {
    appendFolderLink(key, prefix)

  }
  return div
}

function cleanUpElements() {
  const elementIds = []
  elementIds.forEach(id => {
    const element = document.querySelector(`#${id}`)
    if (element) element.remove()
  })
}

async function renderTable(prefix = '') {
  try {
    const table = document.querySelector('table')
    if (!table) throw new Error('Missing table')

    const tableBody = table.querySelector('tbody')

    // clean up
    tableBody.innerHTML = ''
    cleanUpElements()

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
    const contents = await fetchData(getObjectsURL(prefix, '/'))
    const files = filterContentsType(contents, 'file')

    // remove loading
    loadingRow.remove()

    // if files is empty
    if (files.length === 0) {
      const row = document.createElement('tr')
      const td = document.createElement('td')
      td.innerText = 'no file'
      td.colSpan = 1000
      td.classList = ['text-center']
      row.appendChild(td)
      tableBody.appendChild(row)
      return
    }

    // Generate table row
    for (const file of files) {
      const row = document.createElement('tr')

      // Key
      const keyCol = document.createElement('td')
      const keyLink = document.createElement('a')
      keyCol.appendChild(keyLink)
      keyLink.innerText = file.key
      keyLink.target = '_blank'
      keyLink.href = file.url
      row.appendChild(keyCol)

      // type
      const typeCol = document.createElement('td')
      typeCol.innerText = file.type
      row.appendChild(typeCol)

      // Size
      const sizeCol = document.createElement('td')
      sizeCol.innerText = file.bytes || ''
      row.appendChild(sizeCol)

      // delete
      const deleteCol = document.createElement('td')
      const deleteButton = document.createElement('button')
      deleteButton.innerText = 'Delete'
      deleteButton.classList.add('btn', 'btn-danger')
      deleteButton.onclick = (e) => {
        deleteObjectButtonFnc(e.target, file.key)
      }
      deleteCol.appendChild(deleteButton)
      row.appendChild(deleteCol)

      // append to table-body
      tableBody.appendChild(row)
    }
  } catch (err) {
    console.error(err.stack)
  }
}


async function renderFolderMap() {
  const table = document.querySelector('table')
  if (!table) throw new Error('Missing table')
  // fetch data
  // prefix = s3 folder directory (eg: 'folderA/folderB')
  const contents = await fetchData(getObjectsURL(''))

  // filter content type
  const folders = filterContentsType(contents, 'folder')

  //folders map
  const foldersMap = createFolderMap(folders)
  const foldersMapDiv = createFolderMapLinks(foldersMap, renderTable)
  insertBefore(foldersMapDiv, table)
}





// START
// (fetch objects API, Table, Prefix)
// Prefix (eg: folderA/folderB/), all with '/' in the end
renderTable()
renderFolderMap()
const uploadBtn = document.querySelector('#upload')
uploadBtn.onclick = (e) => {
  e.preventDefault()
  uploadObject()
}


