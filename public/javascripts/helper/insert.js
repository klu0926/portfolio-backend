function insertAfter(newNode, targetNode) {
  targetNode.parentNode.insertAfter(newNode, targetNode)
}

function insertBefore(newNode, targetNode) {
  targetNode.parentNode.insertBefore(newNode, targetNode)
}


export { insertAfter, insertBefore }