const URL = 'http://localhost:3000/objects'

async function fetchData(url) {
  const response = await fetch(url)
  const data = await response.json()
  const content = data.map(item => {
    return {
      type: item.Size === 0 ? 'folder' : 'file',
      key: item.Key,
      size: item.Size
    }
  })
  content.sort((a, b) => {
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
  console.log('content:', content)
  return content
}

async function renderTable(url, tableBody) {
  try {
    if (!url) throw new Error('Missing url')
    if (!tableBody) throw new Error('Missing table body')

    // fetch data
    const content = await fetchData(url)

    // remove loading
    document.querySelector('#loading').remove()

    for (const object of content) {
      const row = document.createElement('tr')

      // Key
      const keyCol = document.createElement('td')
      keyCol.innerText = object.key
      row.appendChild(keyCol)

      // type
      const typeCol = document.createElement('td')
      typeCol.innerText = object.type
      row.appendChild(typeCol)

      // view
      const viewCol = document.createElement('td')
      const viewLink = document.createElement('a')
      viewCol.appendChild(viewLink)
      viewLink.innerText = 'view'
      viewLink.href = '#'
      row.appendChild(viewCol)

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
    console.error(err.message)
  }
}


// START
renderTable(URL, document.querySelector('#table-body'))