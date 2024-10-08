const { Server } = require('socket.io');
const userApi = require('../controller/api/userApi')
const bcrypt = require('bcrypt')
const crypto = require('crypto');


// usersMap 
// email : {
//   user : {id, name, email, messages, data}
//   socketsList: []
// }

// socketEmailMap (socketId : email)

class SocketController {
  constructor(userApi) {
    // set in app.js
    this.io = null;
    this.userApi = userApi
    // temp save for online users
    // email as key
    this.usersMap = new Map()
    this.socketEmailMap = new Map()
    this.adminSockets = []
    this.adminSessionId = ''
  }
  findUserMapById(id) {
    if (this.usersMap.size === 0) return null
    for (let [email, user] of this.usersMap) {
      if (Number(user.id) === Number(id)) {
        return { user, email };
      }
    }
    return null;
  }
  isAdmin = (socket) => {
    if (!this.adminSockets?.find(s => s === socket.id)) {
      return false
    }
    return true
  }
  onAdminLogin = (socket, adminData) => {
    try {
      const { sessionId, name, password } = adminData

      let isAuthorized = false
      // use session login --------
      if (this.adminSessionId && sessionId === this.adminSessionId) {
        isAuthorized = true
      }

      // return if no name and password
      if (!name && !password && !isAuthorized) return

      // use name and password login
      if (!isAuthorized) {
        // Password login ---------
        if (!name || !password) throw new Error('Missing name or password')

        // check username
        if (name !== process.env.SOCKET_ADMIN_NAME) {
          throw new Error('Wrong user name')
        }
        // check password
        if (!bcrypt.compareSync(password, process.env.SOCKET_ADMIN_PASSWORD_HASH)) {
          throw new Error('Wrong password')
        }
      }

      // Record Admin -------
      // generate adminSessionId if is new session (adminSockets is empty)
      if (this.adminSockets.length === 0) {
        this.adminSessionId = crypto.randomBytes(16).toString('hex')
      }
      // push to adminSockets
      if (this.adminSockets.indexOf(socket.id) === -1) {
        this.adminSockets.push(socket.id)
      }

      // response with login to ONE admin socket
      this.loginResponse(socket, {
        login: true,
        adminSessionId: this.adminSessionId
      })
    } catch (error) {
      console.log('onAdminLogin:', error)
      this.errorResponse(socket, error.message)
    }
  }
  onLogin = async (socket, userData) => {
    try {
      const { id, name, email } = userData

      // check for user name, email
      const missingField = []
      const requiredField = { name, email }
      Object.keys(requiredField).forEach(key => {
        if (!requiredField[key]) missingField.push(key)
      })
      if (missingField.length > 0) {
        const message = `Login Fail: Missing your ${missingField.join(' , ')}`
        this.sendNewMessage({
          from: 'server',
          userId: id,
          message,
        });
        return
      }

      // check if is an email
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = re.test(email);
      if (!isEmail) {
        throw new Error('Email is not valid')
      }

      // get user
      // if user in usersMap
      let user = this.usersMap.get(email)

      // check if name is also correct
      if (user && user.name !== name) {
        throw new Error('Wrong name or email')
      }

      // user doesn't exist, create a user
      if (!user) {
        await this.userApi.createUser({
          name,
          email,
          messages: []
        })
        // fetch new users from server and update usersMap
        await this.getUsersToMap()
        user = this.usersMap.get(email)
        user.socketsList = [socket.id]
      } else {
        // existing user
        user.socketsList = [...user.socketsList, socket.id]
      }
      // update socketEmailMap
      this.socketEmailMap.set(socket.id, user.email)

      // emit login response to user
      this.loginResponse(socket, {
        login: true,
        user
      })

      // send admin users
      this.adminGetUsers()

      // Greet User (after server get new userList from this.adminGetUsers)
      // if user is first time login, greet the user
      if (user.messages.length === 0) {
        const greeting = `Hi ${name}, enjoy your stay! Drop me a message anytime, and I'll get back to you as soon as I can.`
        this.sendNewMessage({
          from: 'lu',
          userId: user.id,
          message: greeting
        })
      } else {
        // send all messages to user
        this.sendOldMessages(socket)
      }
    } catch (err) {
      console.log(err)
      this.errorResponse(socket, err.message)
    }
  }
  onDisconnect = (socket, removeAdminSession = false) => {
    // check ADMIN
    const adminSocketIndex = this.adminSockets.indexOf(socket.id)
    if (adminSocketIndex !== -1) {
      // remove admin socket
      this.adminSockets.splice(adminSocketIndex, 1)

      if (removeAdminSession) {
        // remove admin session
        this.adminSessionId = ''
      }
      return
    }

    // Check User
    // check if socket exist
    const user = this.usersMap.get(this.socketEmailMap.get(socket.id))

    // user not in current map, return
    if (!user) return

    this.socketEmailMap.delete(socket.id)

    const index = user.socketsList?.findIndex(socketId => socketId === socket.id)
    if (index !== -1) {
      // remove socket after delay
      // prevent unwanted logout when user change page
      const logoutDelay = 1000
      setTimeout(() => {
        user.socketsList.splice(index, 1)
        // send admin users
        this.adminGetUsers()
      }, logoutDelay)
    }
    // send admin users
    this.adminGetUsers()
  }
  // this is only use by online user, when login
  sendOldMessages = (socket) => {
    try {
      const user = this.usersMap.get(this.socketEmailMap.get(socket.id))
      if (!user) throw new Error('Can not find user')

      // send to all socket for the same user
      user.socketsList.forEach(socketId => {
        this.io.to(socketId).emit('message', user.messages);
      })
    } catch (err) {
      console.log(err)
    }
  }
  sendNewMessage = (messageObject) => {
    try {
      // add new message
      const { from, userId, message, createdAt = new Date() } = messageObject
      const { email, user } = this.findUserMapById(userId)
      if (!user) {
        throw new Error(`User does not exist: ${userId}`)
      }
      // append new messages to this.usersMap
      user.messages = [...user.messages,
      {
        from,
        userId,
        message,
        createdAt,
      }
      ]

      // Responses
      // send to all socket for the same user
      user.socketsList.forEach(socketId => {
        this.io.to(socketId).emit('message', user.messages);
      })

      // send to all admin sockets
      this.adminSockets.forEach(socketId => {
        this.io.to(socketId).emit('message', user.messages);
      })

      // store message to database
      this.userApi.createMessage({
        from,
        userId,
        message,
        createdAt,
      })

    } catch (error) {
      console.log(error)
    }
  }
  loginResponse = (socket, isLogin = false) => {
    this.io.to(socket.id).emit('login', isLogin);
  }
  errorResponse = (socket, message) => {
    console.log('errorResponse: ', message)
    this.io.to(socket.id).emit('error', message);
  }
  // ADMIN
  adminGetUsers = async () => {
    try {
      const users = Object.fromEntries(this.usersMap.entries());
      this.adminSockets.forEach(socketId => {
        this.io.to(socketId).emit('adminGetUsers', users);
      })

    } catch (err) {
      console.log(err)
      this.errorResponse(socket, err.message)
    }
  }
  // get users from database, and store to local usersMap
  getUsersToMap = async () => {
    try {
      // Fetch new user data from the server
      const responses = await this.userApi.getUsers();
      const users = responses.data;

      // Create a new map to hold the updated user data
      const newUsersMap = new Map();

      // Add or update users in the new map
      users.forEach(user => {
        if (this.usersMap.has(user.email)) {
          const existingUser = this.usersMap.get(user.email);
          newUsersMap.set(user.email, {
            ...user,
            socketsList: existingUser.socketsList
          }
          );
        } else {
          newUsersMap.set(user.email, {
            ...user,
            socketsList: []
          });
        }
      });
      // replace map
      this.usersMap = newUsersMap;
    } catch (err) {
      console.error('Failed to get users:', err);
    }
  };
  adminDeleteUser = async (adminSocket, userId) => {
    try {
      // check if socket is admin
      const isAdmin = this.adminSockets.find(socket => socket === adminSocket.id)
      if (!isAdmin) {
        throw new Error('you are not an admin socket')
      } else {
        // find user
        const { email, user } = this.findUserMapById(userId)
        console.log('trying to delete user:', user.email)

        // delete user in database
        const response = await this.userApi.deleteUser(userId)
        if (!response.ok) {
          throw new Error(response.error)
        }

        // emit userDeleted to client 
        user.socketsList.forEach(socketId => {
          console.log('sending adminDeleteUser to client:', socketId)
          this.io.to(socketId).emit('adminDeleteUser')
        })

        // delete user in map
        this.usersMap.delete(email)

        // update local user map
        await this.getUsersToMap()

        // successful delete user
        this.io.to(adminSocket.id).emit('adminDeleteUser', {
          ok: true,
          message: `user ${userId} successfully deleted`
        })
      }
    } catch (err) {
      console.error(`Fail to delete user: ${err.message}`)
      this.io.to(adminSocket.id).emit('adminDeleteUser', {
        ok: false,
        err,
        message: err.message
      });
    }

  }
  // export init to app.js
  async init(httpServer, port) {
    // create server
    this.io = new Server(httpServer, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://www.lukuoyu.com',
          'https://klu-portfolio-server-5858060573f4.herokuapp.com'
        ],
        methods: ['GET', 'POST']
      }
    });

    // get users
    await this.getUsersToMap();  // Ensure this is awaited

    // on connect
    this.io.on('connection', (socket) => {
      // login
      socket.on('login', (data) => {
        this.onLogin(socket, data);
      });

      // logout
      socket.on('logout', async () => {
        this.onDisconnect(socket);
      });

      // admin login
      socket.on('adminLogin', async (data) => {
        this.onAdminLogin(socket, data);
      });

      // admin auto sessionId login
      socket.on('adminSessionLogin', (data) => {
        this.onAdminLogin(socket, data);
      });

      // admin logout
      socket.on('adminLogout', () => {
        this.onDisconnect(socket, true);
      });

      // admin get all users
      socket.on('adminGetUsers', () => {
        this.adminGetUsers();
      });

      // admin delete user
      socket.on('adminDeleteUser', (userId) => {
        this.adminDeleteUser(socket, userId)
      })

      // got message
      socket.on('message', async (messageObject) => {
        try {
          this.sendNewMessage(messageObject);  // Ensure this is awaited
        } catch (err) {
          console.error('Fail to get message:', err);
          this.errorResponse(socket, err.message);
        }
      });

      // Disconnect(no user input)
      socket.on('disconnect', () => {
        this.onDisconnect(socket);  // Ensure this is awaited
      });
    });
  }
}



const socketController = new SocketController(userApi)
module.exports = socketController;