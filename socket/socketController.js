const { Server } = require('socket.io');
const userApi = require('../controller/api/userApi')

class SocketController {
  constructor(userApi) {
    // set in app.js
    this.io = null;
    this.userApi = userApi
    // temp save for online users
    // email as key
    this.onlineUsersMap = new Map()
    this.socketEmailList = new Map()
    this.defaultUserObject = {
      name: '',
      email: '',
      messages: [],
      socketsList: [],
    }
  }

  onLogin = async (socket, userData) => {
    try {
      console.log('user trying to login...')
      const { name, email } = userData

      // check for user name, email
      const missingField = []
      const requiredField = { name, email }
      Object.keys(requiredField).forEach(key => {
        if (!requiredField[key]) missingField.push(key)
      })
      if (missingField.length > 0) {
        this.messageResponse(socket, `Login Fail: Missing your ${missingField.join(' , ')}`, 'server');
        return
      }

      // find user in server function
      const getServerUser = async (email, name) => {
        let serverResponse = await userApi.getUser(email)
        let serverUser = null
        if (serverResponse.ok) {
          serverUser = serverResponse.data
        } else {
          const response = await userApi.createUser({
            name,
            email,
            messages: [],
            data: {}
          })
          if (!response.ok) {
            throw new Error(response.error)
          }
          serverUser = response.data
        }
        return serverUser
      }


      // update user
      const updateUserToOnlineMap = async (email, name, socket) => {
        // Retrieve or fetch user
        let user = this.onlineUsersMap.get(email)
        if (!user) {
          user = await getServerUser(email);
          user.messages = JSON.parse(user.messages)
          user.data = JSON.parse(user.data)
        }

        // Update online user
        this.onlineUsersMap.set(email, {
          name,
          email,
          messages: user.messages || [],
          data: user.data || {},
          socketsList: user.socketsList ? [...user.socketsList, socket.id] : [socket.id],
        });

        // Log updated user
        user = this.onlineUsersMap.get(email);

        // update socket list
        this.socketEmailList.set(socket.id, email)
        return user
      }
      // update user in local
      const user = await updateUserToOnlineMap(email, name, socket)

      // send all messages back to user
      // do not save those messages again
      if (user.messages.length > 1) {
        this.messageResponse(socket)
      }

      // return login response
      this.loginResponse(socket, true)

      // send greeting messages
      if (user.messages.length === 0) {
        const greeting = `Hi ${name}, enjoy your stay! Drop me a message anytime, and I'll get back to you as soon as I can.`
        this.messageResponse(socket, greeting, 'lu')
      }
    } catch (err) {
      console.log('------------------------------')
      console.error(err)
      // return isLogin
      this.loginResponse(socket, false)
    }
  }
  onDisconnect = async (socket) => {
    // find if user online
    const email = this.socketEmailList.get(socket.id)
    if (!email) return

    console.log('email:', email)

    const user = this.onlineUsersMap.get(email)
    if (!user) return

    console.log('user:', user)


    // check if socket exist
    const index = user.socketsList?.findIndex(socketId => socketId === socket.id)
    if (index !== -1) {
      // remove socket
      user.socketsList.splice(index, 1)
    }

    // save message to database
    console.log('saving message to database...')
    await userApi.updateUser({
      name: user.name,
      email: user.email,
      messages: user.messages,
      data: user.data
    })

    // remove user if no more socket
    if (user.socketsList.length === 0) {
      this.onlineUsersMap.delete(email)
    }
  }
  messageResponse = (socket, newMessage, newMessageFrom = 'server') => {
    const email = this.socketEmailList.get(socket.id)
    const user = this.onlineUsersMap.get(email)
    if (!user) return

    if (newMessage) {
      user.messages = [...user.messages,
      {
        from: newMessageFrom,
        message: newMessage,
        date: new Date()
      }
      ]
    }
    // send to all socket for the same user
    user.socketsList.forEach(socketId => {
      this.io.to(socketId).emit('message', user.messages);
    })
    console.log('user.message:', user.messages)
  }
  loginResponse = (socket, isLogin = false) => {
    this.io.to(socket.id).emit('isLogin', isLogin);
  }

  // export init to app.js
  init = (httpServer, port) => {

    // create server
    this.io = new Server(httpServer, {
      cors: {
        origin: port, // Requests are allowed
      }
    });
    // on connect
    this.io.on('connection', (socket) => {
      // login
      socket.on('login', async (data) => {
        await this.onLogin(socket, data)
        console.log('login:', socket.id)
        console.log('onlineUsersMap:', this.onlineUsersMap)
      })

      // Disconnect(no user input)
      socket.on('disconnect', async () => {
        this.onDisconnect(socket)
        console.log('disconnect:', socket.id)
      })

      // got message
      socket.on('message', async (messageObject) => {
        const { message, from } = messageObject
        console.log('got message:', message)
        this.messageResponse(socket, message, from)
      })
    })
  }
}

const socketController = new SocketController(userApi)
module.exports = socketController;
