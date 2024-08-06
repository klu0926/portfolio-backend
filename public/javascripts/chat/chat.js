import sweetAlert from '../helper/sweetAlert.js'

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
  getUsers() {
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
  renderUsersList(usersObject) {
    const usersList = document.querySelector('#users-list')
    usersList.innerHTML = ''

    if (usersObject) {
      if (!usersList.classList.contains('active')) {
        usersList.classList.add('active')
      }

      for (const email in usersObject) {
        const user = usersObject[email]
        const userDiv = document.createElement('div')
        userDiv.innerText = user.email
        usersList.appendChild(userDiv)
      }
    } else {
      usersList.classList.remove('active')
    }
  }
}

// Controller
class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.isLogin = false
  }
  init() {
    // socket server connect
    this.model.socketServerInit()
    this.socketListenerSetup()
    this.listenerSetup()

    // try to auto login with sessionId
    this.autoLoginWithSessionId()

  }
  listenerSetup() {
    const adminLogin = document.querySelector('#admin-login')
    const adminLogout = document.querySelector('#admin-logout')
    adminLogin.onclick = this.loginHandler
    adminLogout.onclick = this.logoutHandler
  }
  socketListenerSetup() {
    const socket = this.model.socket
    // error
    socket.on('error', (message) => {
      console.log('error:', message)
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

          // get online users
          this.model.getUsers()

          // store adminSessionId
          localStorage.setItem('adminSessionId', adminSessionId)
          console.log('data.adminSessionId', data.adminSessionId)

          this.isLogin = true
        }
      }
    })

    // get users
    socket.on('adminGetUsers', (usersObject) => {
      console.log('admin get users:', usersObject)
      this.view.renderUsersList(usersObject)
    })
  }
  loginHandler = () => {
    try {
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
  autoLoginWithSessionId = () => {
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