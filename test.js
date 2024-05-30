const string = 'folderA/folderB/'

function getKeyPrefix(key) {
  const array = key.split('/')
  return array[array.length - 1] || ''
}

console.log(getKeyPrefix(string))