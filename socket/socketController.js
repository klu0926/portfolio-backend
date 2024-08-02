const { Server } = require('socket.io');

class SocketController {
  constructor() {
    this.io = null;
    this.socketMap = new Map()
  }

  init(httpServer, port) {
    // create server
    this.io = new Server(httpServer, {
      cors: {
        origin: port, // Requests are allowed
      }
    });

    // on connect
    this.io.on('connection', (socket) => {
      console.log(`User connected ${socket.id}`);
      // auto welcome
      this.sendMessage(socket, `Greetings! Enjoy your visit and feel free leave a message`, 'lu');

      // add socket to map
      if (!this.socketMap.has(socket.id)) {
        this.socketMap.set(socket.id, {
          status: 'active',
          isGreeted: false
        })
        console.log('map:', this.socketMap)
      }

      socket.on('disconnect', () => {
        console.log('disconnect:', socket.id)
        // remove socket from map
        this.socketMap.delete(socket.id)
        console.log('map:', this.socketMap)
      })

      socket.on('sentMessage', (data) => {
        console.log('message:', data);

        if (!data.name && !data.email) {
          this.sendMessage(socket, 'Would you kindly provide your name and email?');
          return
        }
        if (!data.name) {
          this.sendMessage(socket, 'Would you kindly provide your name?');
          return
        }
        if (!data.email) {
          this.sendMessage(socket, 'Would you kindly provide your email?')
          return
        }
        // All Good
        // Return user's own message
        this.sendMessage(socket, data.message, data.from);

        // greet user
        const user = this.socketMap.get(socket.id)
        if (user && !user.isGreeted) {
          user.name = data.name
          user.email = data.email
          this.sendMessage(socket, `Hi ${user.name}, thanks for reaching out! I’ll get back to you as soon as I can`, 'lu');
          user.isGreeted = true
        }
        // store messages
        if (!user.messages) user.messages = []
        user.messages.push({
          message: data.message,
          date: data.date
        })
        console.log('user.messages', user.messages)
      }
      );
    });
  }

  sendMessage(socket, message, from = 'server') {
    if (this.io) {
      this.io.to(socket.id).emit('sentMessage', { from, message });
    } else {
      console.error('Socket server is not initialized.');
    }
  }
}

const socketController = new SocketController()
module.exports = socketController;
