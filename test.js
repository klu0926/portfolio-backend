const objects = [
  {
    group: 'apple'
  },
  {
    group: 'orange'
  },
  {
    group: 'girls'
  },
  {
    group: 'apple'
  },
  {
    group: 'apple'
  }
]



const groups = []

objects.forEach(obj => {
  const group = groups.find(group => group === obj.group)
  if (!group) groups.push(obj.group)
})


console.log(groups)