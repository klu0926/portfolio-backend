const userApi = require('./controller/api/userApi')

async function main() {
  const users = await userApi.getUsers()
  console.log(users)
}

main()