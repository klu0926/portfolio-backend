import sweetAlert from '../helper/sweetAlert.js'
import dayjs from 'dayjs'

// Model
class Model {
  constructor() {
    this.socket = null
  }
  socketServerInit() {
    // Setup socket server
    const isLocal = window.location.hostname === 'localhost';
    const heroku = 'https://klu-portfolio-server-5858060573f4.herokuapp.com'
    const local = 'http://localhost:3000'
    const url = {
      server: isLocal ? local : heroku,
    }
    const server = url.server
    this.socket = io.connect(server)
  }
  adminLogin(name, password) {
    this.socket.emit('adminLogin', { name, password })
  }
  getAllUsers() {
    this.socket.emit('adminGetAllUsers')
  }
  getOnlineUsers() {
    this.socket.emit('adminGetOnlineUsers')
  }
}

// View
class View {
  constructor() { }
  renderMessage(message) {
    const messageSpan = document.querySelector('#message')
    // reset css animation
    messageSpan.classList.remove('active')
    void messageSpan.offsetWidth

    // set active
    messageSpan.innerText = message
    messageSpan.classList.add('active')
  }
  toggleLoginInputs(isLogin) {
    const loginControl = document.querySelector('#login-control')
    const logoutBtn = document.querySelector('#admin-logout')

    if (isLogin) {
      this.renderMessage('')
      loginControl.classList.remove('active')
      logoutBtn.classList.add('active')
    } else {
      loginControl.classList.add('active')
      logoutBtn.classList.remove('active')
    }
  }
  renderUsersList(usersArray, onClickHandler) {
    const usersList = document.querySelector('#users-list')
    usersList.innerHTML = ''

    // show usersList
    if (usersArray) {
      if (!usersList.classList.contains('active')) {
        usersList.classList.add('active')
      }

      // loop through all users
      usersArray.forEach(user => {
        const messages = user.messages
        const lastMessageObject = messages[messages.length - 1]
        let lastDate = null
        if (lastMessageObject?.date) {
          lastDate = dayjs(lastMessageObject.date).format('MM/DD/YYYY')
        }

        const userDiv = document.createElement('div')
        userDiv.classList.add('user-div')
        userDiv.dataset.userEmail = user.email
        userDiv.onclick = onClickHandler

        userDiv.innerHTML = `
            <div class='user-top-left'>
              <p class='user-info'>
               <span class='user-name'>${user.name}</span>
                <span class='text-break'>|</span>
               <span class='user-email'>${user.email}</span>
              </p>  
              <p class='user-lastMessage'>${lastMessageObject.message}</p>
            </div>
           <div class='user-top-right'>
              <span class='user-last-date'>${lastDate}</span>
              <div class='user-new-messages-count'>
              3
              </div>
            </div>
        `
        usersList.appendChild(userDiv)
      })
    } else {
      // hide user list
      usersList.classList.remove('active')
    }
  }
  updateUsersList(onlineUsersObject) {
    const usersDivs = document.querySelectorAll('.user-div')
    if (usersDivs && onlineUsersObject) {
      usersDivs.forEach(userDiv => {
        const email = userDiv.dataset.userEmail
        if (!email) {
          console.log('Can not find userDiv.dataset.userEmail')
          return
        }

        // update user online status
        // online
        if (onlineUsersObject[email]) {
          userDiv.classList.add('online')
        } else {
          userDiv.classList.remove('online')
        }
      })
    }
  }
  renderMessagePanel(user) {
    const name = document.querySelector('#message-panel-name')
    const email = document.querySelector('#message-panel-email')
    const panel = document.querySelector('#message-panel-messages')
    // render info
    name.innerText = user.name
    email.innerText = user.email

    // render messages
    panel.innerHTML = ''

    user.messages.forEach(messageObject => {
      const messageOuterDiv = document.createElement('div')
      messageOuterDiv.classList.add('message-div')

      const messageDiv = document.createElement('div')
      messageDiv.classList.add('message')
      messageDiv.innerText = messageObject.message

      const dateSpan = document.createElement('span')
      dateSpan.classList.add('message-date')
      dateSpan.innerText = dayjs(messageObject.date).format('MMMM D, YYYY h:mm A')

      // check message from who
      if (messageObject.from === 'user') {
        messageOuterDiv.classList.add('message-div-client')
        messageDiv.classList.add('client-message')
      } else {
        messageOuterDiv.classList.add('message-div-server')
        messageDiv.classList.add('server-message')
      }

      // append
      messageOuterDiv.appendChild(messageDiv)
      messageOuterDiv.appendChild(dateSpan)
      panel.appendChild(messageOuterDiv)
    })
  }
}

// Controller
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.isLogin = false
    this.users = []
    this.onlineUsersObject = null
  }
  init() {
    // socket server connect
    this.model.socketServerInit()
    this.socketListenerSetup()
    this.listenerSetup()

    // try to auto login with sessionId
    this.adminSessionLoginHandler()

  }
  // Setups ===================================
  listenerSetup() {
    // login / logout
    const adminLogin = document.querySelector('#admin-login')
    const adminLogout = document.querySelector('#admin-logout')
    adminLogin.onclick = (e) => {
      this.loginHandler(e)
    }
    adminLogout.onclick = this.logoutHandler

    // message-panel
    const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
    const messagePanelClose = document.querySelector('#message-panel-close')
    const messageSendButton = document.querySelector('#message-send')

    messagePanelClose.onclick = this.messagePanelCloseHandler
    messagePanelWrapper.onclick = this.messagePanelWrapperClickHandler
    messageSendButton.onclick = this.messagePanelSendButtonHandler
  }
  socketListenerSetup() {
    const socket = this.model.socket
    // error
    socket.on('error', (message) => {
      console.error('error:', message)
      this.view.renderMessage(message)
    })

    // login
    socket.on('login', (data) => {
      if (!this.isLogin) {
        const login = data.login
        const adminSessionId = data.adminSessionId
        if (login) {
          // hide login input
          this.view.toggleLoginInputs(true)

          // get all users
          this.model.getAllUsers()

          // store adminSessionId
          localStorage.setItem('adminSessionId', adminSessionId)
          this.isLogin = true
        }
      }
    })

    // get message
    socket.on('message', this.onMessage)

    // get all users (after login)
    socket.on('adminGetAllUsers', this.onAdminGetallUsers)

    // get online users (after login)
    socket.on('adminGetOnlineUsers', this.onAdminGetOnlineUsers)

    // get online users (after user login / disconnect)
    socket.on('onlineUsersUpdate', (onlineUsersObject) => {
      this.onlineUsersObject = onlineUsersObject
      this.onAdminGetOnlineUsers(onlineUsersObject)
      console.log('online users object:', onlineUsersObject)
    })


  }
  // Socket Listener functions ===================
  onAdminGetallUsers = (usersArray) => {
    // store users
    this.users = usersArray

    // render users list
    this.view.renderUsersList(usersArray, this.userDivOnClickHandler)

    // get online users (auto trigger view user list update)
    this.model.getOnlineUsers()
  }
  onAdminGetOnlineUsers = (onlineUsersObject) => {
    // store online users
    this.onlineUsersObject = this.onlineUsersObject

    // update users Divs
    this.view.updateUsersList(onlineUsersObject)
  }
  onMessage = (messages) => {
    const email = messages[messages.length - 1].email
    const user = this.users.find(user => user.email === email)

    // store to local
    user.messages = messages

    // render latest Message
    this.view.renderUsersList(this.users, this.userDivOnClickHandler)
    this.view.updateUsersList(this.onlineUsersObject)

    // render message panel
    this.view.renderMessagePanel(user)
  }
  // Handlers ======================
  loginHandler = (e) => {
    try {
      e.preventDefault()
      const name = document.querySelector('#name').value
      const password = document.querySelector('#password').value

      if (!name || !password) {
        throw new Error('Missing name or password')
      }
      this.model.socket.emit('adminLogin', { name, password })
    } catch (err) {
      sweetAlert.error('Login Fail', err.message)
    }
  }
  logoutHandler = () => {
    localStorage.removeItem('adminSessionId')
    this.model.socket.emit('adminLogout')

    this.view.renderUsersList(null)
    this.view.toggleLoginInputs(false)
  }
  adminSessionLoginHandler = () => {
    try {
      const sessionId = localStorage.getItem('adminSessionId')
      if (sessionId) {
        this.model.socket.emit('adminSessionLogin', {
          sessionId
        })
      }
    } catch (err) {
      sweetAlert.error('Login Fail', err.message)
    }
  }
  userDivOnClickHandler = (e) => {
    try {
      // find user in local
      const email = e.currentTarget.dataset.userEmail
      const currentUser = this.users.find(user => user.email === email)
      if (!currentUser) throw new Error(`Can not find user with email: ${email}`)

      // render user div with user messages
      this.view.renderMessagePanel(currentUser)

      // show message panel
      const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
      messagePanelWrapper.classList.add('active')

    } catch (err) {
      sweetAlert.error('Fail to open', err.message)
    }

  }
  messagePanelWrapperClickHandler = (e) => {
    const messagePanelWrapper = document.querySelector('#message-panel-wrapper')

    if (e.target === messagePanelWrapper) {
      messagePanelWrapper.classList.remove('active')
      // render panel
      //this.updateMessagePanel(user)
    }
  }
  messagePanelCloseHandler = (e) => {
    const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
    messagePanelWrapper.classList.remove('active')
  }
  messagePanelSendButtonHandler = (e) => {
    e.preventDefault()
    const messageInput = document.querySelector('#message-input')
    const message = messageInput.value
    if (message.trim() === '') return
    console.log(`send message: ${messageInput.value}`)
  }
}

const model = new Model()
const view = new View()
const controller = new Controller(model, view)
controller.init()