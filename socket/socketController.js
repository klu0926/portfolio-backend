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
      isGreeted: false,
    }
  }
  async onLogin(socket, userData) {
    try {
      console.log('onLogin:', socket.id, userData)
      const { name, email } = userData

      // check for user name, email
      const missingField = []
      const requiredField = { name, email }
      Object.keys(requiredField).forEach(key => {
        if (!requiredField[key]) missingField.push(key)
      })
      if (missingField.length > 0) {
        this.sendMessage(socket, `Login Fail: Missing your ${missingField.join(' , ')}`, 'server');
        return
      }

      // find user in server function
      async function getServerUser(email, name) {
        let serverResponse = await userApi.getUser(email)
        let serverUser = null
        if (serverResponse.ok) {
          serverUser = serverResponse.data
        } else {
          const response = await userApi.createUser({
            name,
            email,
            message: [],
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
      const updateUser = async (email, name, socket) => {
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
          isGreeted: false
        });

        // Log updated user
        user = this.onlineUsersMap.get(email);
        console.log('User after update:', user);

        // update socket list
        this.socketEmailList.set(socket.id, email)
        return user
      }

      const user = await updateUser(email, name, socket)

      // response
      if (!user.isGreeted) {
        this.sendMessage(socket, `Hi ${name}, enjoy your stay! Drop me a message anytime, and I'll get back to you as soon as I can.`, 'lu')
        user.isGreeted = true
      } else {
        this.sendMessage(socket, `Welcome back ${user.name}`, 'lu')
      }
    } catch (err) {
      console.error(err)
      this.sendMessage(socket, `Fail to login, ${err.message}`, 'server')
    }
  }
  onDisconnect(socket) {
    console.log('disconnect:', socket.id)
    // find if user online
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
    // remove user if no more socket
    if (user.socketsList.length === 0) {
      this.onlineUsersMap.delete(email)
    }
    console.log('onlineUserMap:', this.onlineUsersMap)

  }
  sendMessage(socket, message, from = 'server') {
    this.io.to(socket.id).emit('sentMessage', {
      from,
      message: {
        message,
        date: new Date()
      }
    });

    // store to usersMap
    //....
  }
  // export init to app.js
  init(httpServer, port) {
    // create server
    this.io = new Server(httpServer, {
      cors: {
        origin: port, // Requests are allowed
      }
    });
    // on connect
    this.io.on('connection', (socket) => {
      console.log('Socket Connected:', socket.id)
      // everything else goes there...

      // login
      socket.on('login', (data) => {
        this.onLogin(socket, data)
      })

      // Disconnect(no user input)
      socket.on('disconnect', () => {
        this.onDisconnect(socket)
      })

      // send message
      socket.on('sentMessage', (data) => {
        console.log('got messages:', data)
        const user = this.onlineUsersMap.get(data.email)
        user.messages.push(data.message)
        if (user) {
          this.sendMessage(socket, {
            messages: data.messages,
          }, data.from)
        }

      })

    })
  }
}

const socketController = new SocketController(userApi)
module.exports = socketController;
