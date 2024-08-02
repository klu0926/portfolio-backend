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
      async function getServerUser(email) {
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


      // if user is online 
      let user = this.onlineUsersMap.get(email)
      let serverUser = null
      if (user) {
        console.log('user is online')
        // add to socketList
        user.socketsList.push(socket.id)
      } else {
        // get server user
        console.log('user is not online, get server user')
        serverUser = await getServerUser(email)
        // update online user
        this.onlineUsersMap.set(email, {
          email: serverUser.email,
          name: serverUser.name,
          messages: serverUser.messages,
          socketsList: [socket.id],
          isGreeted: false
        })
        user = this.onlineUsersMap.get(email)
      }

      console.log('user:', user)
      console.log('onlineUserMap:', this.onlineUsersMap)

      // response
      if (!user.isGreeted) {
        this.sendMessage(socket, `Hi ${user.name}, enjoy your stay! Drop me a message anytime, and I'll get back to you as soon as I can.`, 'lu')
        user.isGreeted = true
      } else {
        this.sendMessage(socket, `Welcome back ${user.name}`, 'lu')
      }
    } catch (err) {
      console.error(err)
      this.sendMessage(socket, `Fail to login, ${err.message}`, 'server')
    }
  }
  // onDisconnect(socket) {
  //   socket.on('disconnect', () => {
  //     console.log('disconnect:', socket.id)
  //     // remove socket from map
  //     this.onlineUsersMap.delete(socket.id)
  //     console.log('map:', this.onlineUsersMap)
  //   })
  // }
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

      // 

    })
  }
}

const socketController = new SocketController(userApi)
module.exports = socketController;
