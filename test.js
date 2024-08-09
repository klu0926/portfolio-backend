const usersObject = {
  'emailA': { name: 'lulu' },
  'emailB': { name: 'pete' },
  'emailC': { name: 'cho' },
}



for (const [email, user] of Object.entries(usersObject)){
  console.log(user)
}