const { Server } = require('socket.io');
const userApi = require('../controller/api/userApi')
const bcrypt = require('bcrypt')

class SocketController {
  constructor(userApi) {
    // set in app.js
    this.io = null;
    this.userApi = userApi
    // temp save for online users
    // email as key
    this.onlineUsersMap = new Map()
    this.socketEmailList = new Map()
    this.adminSockets = []
    this.adminSessionId = '12345'
  }
  onAdminLogin = (socket, adminData) => {
    try {
      console.log('adminData:', adminData)
      const { name, password } = adminData
      if (!name || !password) throw new Error('Missing name or password')

      // check username
      if (name !== process.env.SOCKET_ADMIN_NAME) {
        throw new Error('Wrong user name')
      }

      // check password
      if (!bcrypt.compareSync(password, process.env.SOCKET_ADMIN_PASSWORD_HASH)) {
        throw new Error('Wrong password')
      }

      // push to adminSockets
      if (this.adminSockets.indexOf(socket.id) === -1) {
        this.adminSockets.push(socket.id)
      }

      console.log('adminSockets:', this.adminSockets)

      // response with login
      console.log('admin login successful')
      this.loginResponse(socket, {
        login: true,
        adminSessionId: this.adminSessionId
      })
    } catch (err) {
      console.error(err)
      this.errorResponse(socket, err.message)
    }
  }
  onLogin = async (socket, userData) => {
    try {
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

      // check if is an email
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = re.test(email);
      if (!isEmail) {
        throw new Error('Email is not valid')
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
      this.loginResponse(socket, {
        login: true
      })
      
      // send greeting messages
      if (user.messages.length === 0) {
        const greeting = `Hi ${name}, enjoy your stay! Drop me a message anytime, and I'll get back to you as soon as I can.`
        this.messageResponse(socket, greeting, 'lu')
      }
    } catch (err) {
      console.error(err)
      this.errorResponse(socket, err.message)
    }
  }
  onDisconnect = async (socket) => {
    console.log(`socket disconnect: ${socket.id}`)

    // ADMIN
    const adminSocketIndex = this.adminSockets.indexOf(socket.id)
    if (adminSocketIndex !== -1) {
      // remove admin socket
      this.adminSockets.splice(adminSocketIndex, 1)
      console.log('adminSockets:', this.adminSockets)
      return
    }

    // USERS
    // find user online
    const email = this.socketEmailList.get(socket.id)
    if (!email) return
    const user = this.onlineUsersMap.get(email)
    if (!user) return

    // check if socket exist
    const index = user.socketsList?.findIndex(socketId => socketId === socket.id)
    if (index !== -1) {
      // remove socket
      user.socketsList.splice(index, 1)
    }

    // if user's sockets are all disconnected
    // save message to database, and delete user from online list
    if (user.socketsList.length === 0) {
      // save message to database
      console.log('saving message to database...')
      await userApi.updateUser({
        name: user.name,
        email: user.email,
        messages: user.messages,
        data: user.data
      })
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
  }
  loginResponse = (socket, isLogin = false) => {
    this.io.to(socket.id).emit('login', isLogin);
  }
  errorResponse = (socket, message) => {
    console.log('sending error message:', message)
    this.io.to(socket.id).emit('error', message);
  }
  // ADMIN
  adminGetUsers = (socket) => {
    console.log('adminGetUsers:', socket.id)
    //  !!!!! check if socket is adminSocks (login)
    const onlineUserObject = Object.fromEntries(this.onlineUsersMap);
    try {
      this.io.to(socket.id).emit('adminGetUsers', onlineUserObject);
    } catch (err) {
      console.log('adminGetUser Catch socket:', socket)
      this.errorResponse(socket, 'Fail to get user')
    }
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
      console.log(`socket connect ${socket.id}`)

      // login
      socket.on('login', async (data) => {
        await this.onLogin(socket, data)
      })

      // admin login
      socket.on('adminLogin', async (data) => {
        this.onAdminLogin(socket, data)
      })

      // admin get users
      socket.on('adminGetUsers', () => {
        this.adminGetUsers(socket)
      })

      // got message
      socket.on('message', async (messageObject) => {
        const { message, from } = messageObject
        this.messageResponse(socket, message, from)
      })

      // Disconnect(no user input)
      socket.on('disconnect', async () => {
        this.onDisconnect(socket)
      })
    })
  }
}

const socketController = new SocketController(userApi)
module.exports = socketController;
