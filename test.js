const userApi = require('./controller/api/userApi')


const user1 = {
  name: 'lulu',
  email: 'lulu@gmail.com',
  messages: [{
    message: 'Hello world!',
    date: new Date()
  }],
}


const user2 = {
  name: 'peter',
  email: 'peter@gmail.com',
  messages: [],
}

async function createUser(userData) {
  try {
    const response = await userApi.createUser(userData)
    if (!response.ok) throw new Error(response.error)
    console.log('create User:', response)
  } catch (error) {
    console.error(error)
  }
}

async function getUsers() {
  try {
    const response = await userApi.getUsers()
    if (!response.ok) throw new Error(response.error)
    console.log('Get Users:', response)
  } catch (error) {
    console.error(error)
  }
}

async function getUser(email) {
  try {
    const response = await userApi.getUser(email)
    if (!response.ok) throw new Error(response.error)
    console.log('Get User:', response)
  } catch (error) {
    console.error(error)
  }
}


async function deleteUser(userId) {
  try {
    const response = await userApi.deleteUser(userId)
    if (!response.ok) throw new Error(response.error)
    console.log('Delete User:', response)

  } catch (error) {
    console.error(error)
  }
}


async function main() {
  const response = await userApi.updateUser({
    name: 'peter1', 
    email: 'peter2@gmail.com'
  }
  )
  console.log(response)

  process.exit()
}


main()




