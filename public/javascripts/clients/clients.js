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
  renderUsersList(usersArray) {
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
    if ('usersDivs:', usersDivs)

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
    const adminLogin = document.querySelector('#admin-login')
    const adminLogout = document.querySelector('#admin-logout')
    adminLogin.onclick = (e) => {
      this.loginHandler(e)
    }
    adminLogout.onclick = this.logoutHandler
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

    // get all users (after login)
    socket.on('adminGetAllUsers', this.onAdminGetallUsers)

    // get online users (after login)
    socket.on('adminGetOnlineUsers', this.onAdminGetOnlineUsers)

    // get online users (after user login / disconnect)
    socket.on('onlineUsersUpdate', (onlineUsersObject) => {
      console.log('------ online users update:', onlineUsersObject)
      this.onAdminGetOnlineUsers(onlineUsersObject)
    })
  }
  // Socket Listener functions ===================
  onAdminGetallUsers = (usersArray) => {
    console.log('all users:', usersArray)

    // store users
    this.users = usersArray

    // render users list
    this.view.renderUsersList(usersArray)

    // get online users (auto trigger view user list update)
    this.model.getOnlineUsers()
  }
  onAdminGetOnlineUsers = (onlineUsersObject) => {
    console.log('onlineUsersObject', onlineUsersObject)
    // store online users
    this.onlineUsersObject = this.onlineUsersObject

    // update users Divs
    this.view.updateUsersList(onlineUsersObject)
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

}

const model = new Model()
const view = new View()
const controller = new Controller(model, view)
controller.init()