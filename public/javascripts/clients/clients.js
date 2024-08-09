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
    this.socket.emit('adminGetUsers')
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
  renderLoginHeader(isLogin) {
    const loginControl = document.querySelector('#login-control')
    const clientsPageHead = document.querySelector('#clients-page-head')

    if (isLogin) {
      this.renderMessage('')
      loginControl.classList.remove('active')
      clientsPageHead.classList.add('active')
    } else {
      loginControl.classList.add('active')
      clientsPageHead.classList.remove('active')
    }
  }
  renderUsersList(usersObject, onClickHandler) {
    try {
      if (!usersObject) {
        throw new Error('Missing usersObject')
      }
      console.log('usersObject:', usersObject)

      // clients count
      const clientsCount = Object.keys(usersObject).length || 0
      const clientsCountSpan = document.querySelector('#all-clients-count')
      clientsCountSpan.innerText = clientsCount

      // online clients count (count in loop)
      let onlineClientsCount = 0

      // reset usersList
      const usersList = document.querySelector('#users-list')
      usersList.innerHTML = ''

      // show usersList
      if (clientsCount) {
        if (!usersList.classList.contains('active')) {
          usersList.classList.add('active')
        }

        // loop through all users
        for (const [email, user] of Object.entries(usersObject)) {
          // create lastMessage
          const lastMessageObject = user.messages[user.messages.length - 1]
          let latestMessage = ''
          let latestDate = ''
          if (lastMessageObject) {
            latestMessage = lastMessageObject.message
            latestDate = dayjs(lastMessageObject.createdAt).format('MMMM D, YYYY h:mmA')
          }
          // create userDiv
          const userDiv = document.createElement('div')
          userDiv.classList.add('user-div')
          userDiv.dataset.userEmail = user.email
          userDiv.onclick = onClickHandler

          // check online
          let onlineStatusIcon = ''
          let onlineStatus = ''
          if (user.socketsList.length > 0) {
            userDiv.classList.add('online')
            onlineClientsCount++

            onlineStatusIcon = `
             <i class="fa-regular fa-face-smile"></i>
            `
            onlineStatus= 'online'
          } else {
            onlineStatusIcon = `
             <i class="fa-regular fa-face-meh"></i>
            `
          }



          userDiv.innerHTML = `
            <div class='user-top-left'>
              <div class='user-info'>
                <div class='user-info-div ${onlineStatus}'>
                  ${onlineStatusIcon}
                  <span class='user-name'>${user.name}</span>
                </div>
                <div class='user-info-div'>
                  <i class="fa-regular fa-envelope"></i>
                  <span class='user-email'>${user.email}</span>
                </div>
              </div>  
              <p class='user-lastMessage'>${latestMessage}</p>
              <span class='user-last-date' class='user-last-date'>${latestDate}</span>
            </div>
           <div class='user-top-right'>
              <div class='user-new-messages-count'>
              3
              </div>
            </div>
        `
          usersList.appendChild(userDiv)
        }
      } else {
        // hide user list
        usersList.classList.remove('active')
      }

      // online clients count
      const onlineClientsCountSpan = document.querySelector('#online-clients-count')
      onlineClientsCountSpan.innerText = onlineClientsCount


    } catch (err) {
      console.error('Fail to render users list:', err)
    }
  }
  renderMessagePanel(user) {
    const name = document.querySelector('#message-panel-name')
    const email = document.querySelector('#message-panel-email')
    const panel = document.querySelector('#message-panel-messages')
    const onlineStatus = document.querySelector('#message-panel-client-status')

    // set user data to panel
    panel.dataset.userId = user.id
    panel.dataset.email = user.email
    panel.dataset.name = user.name

    // user online status
    if (user.socketsList.length > 0) {
      onlineStatus.classList.add('online')
      onlineStatus.innerHTML = `
      <i class="fa-regular fa-face-smile"></i>
      <span>online</span>
      `
    } else {
      onlineStatus.classList.remove('online')
      onlineStatus.innerHTML = `
      <i class="fa-regular fa-face-meh"></i>
      <span>offline</span>
      `
    }

    // render info
    name.innerText = user.name
    email.innerText = user.email

    // render messages
    panel.innerHTML = ''

    console.log('user.messages:', user.messages)

    user.messages.forEach(messageObject => {
      const messageOuterDiv = document.createElement('div')
      messageOuterDiv.classList.add('message-div')

      const messageDiv = document.createElement('div')
      messageDiv.classList.add('message')
      messageDiv.innerText = messageObject.message

      const dateSpan = document.createElement('span')
      dateSpan.classList.add('message-date')
      dateSpan.innerText = dayjs(messageObject.createdAt).format('MMMM D, YYYY h:mm A')

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

    // panel scroll to the bottom
    panel.scrollTop = panel.scrollHeight - panel.clientHeight
  }
}

// Controller
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.isLogin = false
    this.usersObject = {}
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
  findUserById(id) {
    console.log(`find user by id : ${id}`)
    if (Object.keys(this.usersObject).length === 0) return null
    for (let [email, user] of Object.entries(this.usersObject)) {
      if (Number(user.id) === Number(id)) {
        return user;
      }
    }
    return null;
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
          this.view.renderLoginHeader(true)

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
    socket.on('adminGetUsers', this.onAdminGetUsers)
  }
  // Socket Listener functions ===================
  onAdminGetUsers = (usersObject) => {
    // store users
    this.usersObject = usersObject

    // render users list
    this.view.renderUsersList(usersObject, this.userDivOnClickHandler)
  }
  onMessage = (messageArray) => {
    console.log('onMessage:', messageArray)

    const userId = messageArray[0].userId
    const user = this.findUserById(userId)

    // store to local
    user.messages = messageArray

    // render latest Message
    this.view.renderUsersList(this.usersObject, this.userDivOnClickHandler)

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
    this.view.renderLoginHeader(false)
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
      const currentUser = this.usersObject[email]

      if (!currentUser) throw new Error(`Can not find user with email: ${email}`)

      // render user div with user messages
      this.view.renderMessagePanel(currentUser)

      // show message panel
      const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
      messagePanelWrapper.classList.add('active')

    } catch (err) {
      console.error(err)
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
    const panel = document.querySelector('#message-panel-messages')
    const userId = panel.dataset.userId

    const messageInput = document.querySelector('#message-input')
    const message = messageInput.value
    if (message.trim() === '') return
    // clear message input
    messageInput.value = ''

    // emit
    this.model.socket.emit('message', {
      from: 'lu',
      userId,
      message,
    })

  }
}

const model = new Model()
const view = new View()
const controller = new Controller(model, view)
controller.init()