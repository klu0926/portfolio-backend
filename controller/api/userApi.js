const { User } = require('../../models')

function apiResponse(ok, data, message, error = null) {
  return {
    ok, data, message, error
  }
}

const userApi = {
  // get users 
  getUsers: async () => {
    try {
      const usersData = await User.findAll({
        attributes: {
          exclude: ['updatedAt']
        },
        order: [['name', 'ASC']], // sort with post.order
      })

      const users = usersData.map(user => {
        user.messages = JSON.parse(user.messages)
        user.data = JSON.parse(user.data)
        return user.toJSON()
      })

      return apiResponse(true, users, 'successfully get all users')
    } catch (error) {
      return apiResponse(false, null, 'Fail to get all users', error)
    }
  },
  getUser: async (email) => {
    try {
      const user = await User.findOne({
        where: { email },
        raw: true
      })
      if (!user) throw new Error('User does not exist')
      return apiResponse(true, user, 'successfully get a user')
    } catch (error) {
      return apiResponse(false, null, 'Fail to get a user', error)
    }
  },
  deleteUser: async (email) => {
    try {
      const deletedRow = await User.destroy({ where: { email } });

      if (deletedRow === 0) {
        throw new Error(`Can not find email: ${email} to delete`)
      }
      return apiResponse(true, null, 'successfully delete a user')
    } catch (error) {
      console.error(error)
      return apiResponse(false, null, 'Fail to delete a user', error.message)
    }
  },
  createUser: async (userData) => {
    try {
      let { name, email, messages, data } = userData

      // check fields
      const errorItems = []
      const requireFields = { name, email }
      Object.keys(requireFields).forEach(key => {
        if (!requireFields[key]) errorItems.push(key)
      })
      if (errorItems.length !== 0) {
        throw new Error(`Missing required fields: ${errorItems.join(',')}`)
      }
      // fill data if empty
      if (!messages) messages = []
      if (!data) data = {}

      // check user exist
      const response = await userApi.getUser(email)
      if (response.ok) {
        throw new Error('User already exist with same email')
      }

      // create user
      const user = await User.create({
        name,
        email,
        messages: JSON.stringify(messages),
        data: JSON.stringify(data)
      })
      return apiResponse(true, user.toJSON(), 'successfully created a user')
    } catch (error) {
      console.error(error)
      return apiResponse(false, null, 'Fail to created a user', error.message)
    }
  },
  updateUser: async (userData) => {
    try {
      let { name, email, messages, data } = userData
      if (!email) throw new Error('Missing email')

      // check user exist
      const user = await User.findOne({ where: { email } })
      if (!user) {
        throw new Error(`Can not find user with email ${email}`)
      }

      // update user
      if (name) user.name = name
      if (messages) user.messages = JSON.stringify(messages)
      if (data) user.data = JSON.stringify(data)
      await user.save()

      // to json
      const userJSON = user.toJSON()
      userJSON.messages = JSON.parse(userJSON.messages)
      userJSON.data = JSON.parse(userJSON.data)

      return apiResponse(true, userJSON, 'successfully updated a user')
    } catch (error) {
      console.error(error)
      return apiResponse(false, null, 'Fail to update user', error.message)
    }
  },
}

module.exports = userApi