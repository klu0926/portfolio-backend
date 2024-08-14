const { User, Message } = require('../../models')

function apiResponse(ok, data, message, error = null) {
  return {
    ok, data, message, error
  }
}

const userApi = {
  // get users 
  getUsers: async () => {
    try {
      const users = await User.findAll({
        attributes: {
          exclude: ['updatedAt']
        },
        include: [{
          model: Message,
          as: 'messages',
        }],
        order: [['name', 'ASC']], // sort with post.order
      })
      if (!users) {
        throw new Error('Can not find users')
      }
      const usersJSON = users.map(user => {
        return user.toJSON()
      })
      return apiResponse(true, usersJSON, 'successfully get all users')
    } catch (error) {
      return apiResponse(false, null, error.message)
    }
  },
  getUser: async (email) => {
    try {
      const user = await User.findOne({
        where: { email },
        include: [{
          model: Message,
          as: 'messages',
        }],
      })
      if (!user) {
        throw new Error('Can not find user')
      }
      const userJSON = user.toJSON()
      return apiResponse(true, userJSON, 'successfully get a user')
    } catch (error) {
      return apiResponse(false, null, error.message)
    }
  },
  deleteUser: async (userId) => {
    try {
      const deletedRow = await User.destroy({ where: { id: userId } });

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
      if (response.error) {
        throw new Error(response.error.message)
      }
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
      if (data) user.data = JSON.stringify(data)
      await user.save()

      // create message
      await Message.bulkCreate({
        userId: user.id,
        message: messages.message
      })

      // to json
      const userJSON = user.toJSON()
      userJSON.data = JSON.parse(userJSON.data)

      return apiResponse(true, userJSON, 'successfully updated a user')
    } catch (error) {
      console.error(error)
      return apiResponse(false, null, 'Fail to update user', error.message)
    }
  },
  createMessage: async (messageObject) => {
    try {
      const { from, userId, message, createdAt } = messageObject
      if (!from) throw new Error('Missing "from" field')
      if (!userId) throw new Error('Missing userId')
      if (!message.trim()) throw new Error('Missing message')

      await Message.create({
        from,
        userId,
        message,
        createdAt,
      })
      return apiResponse(true, { userId, message }, 'successfully create a user')
    } catch (error) {
      console.error(error)
      return apiResponse(false, null, 'Fail to create message', error.message)
    }
  }
}

module.exports = userApi