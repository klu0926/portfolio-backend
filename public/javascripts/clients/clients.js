import sweetAlert from '../helper/sweetAlert.js'
import dayjs from 'dayjs'
import flashNote from '../helper/flashNote.js';

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
  deleteUser(userId) {
    return this.socket.emit('adminDeleteUser', userId)
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
  renderHeader(usersObject) {
    const loginControl = document.querySelector('#login-control')
    const clientsPageHead = document.querySelector('#clients-page-head')

    if (usersObject) {
      this.renderMessage('')
      loginControl.classList.remove('active')
      clientsPageHead.classList.add('active')

      // clients count
      const clientsCount = Object.keys(usersObject).length || 0
      const clientsCountSpan = document.querySelector('#all-clients-count')
      clientsCountSpan.innerText = clientsCount

      // online clients count (count in loop)
      let onlineClientsCount = 0
      const onlineClientsCountSpan = document.querySelector('#online-clients-count')
      // count online player
      if (Object.keys(usersObject).length > 0) {
        Object.keys(usersObject).forEach(email => {
          if (usersObject[email].socketsList?.length > 0) {
            onlineClientsCount++
          }
        })
      }
      onlineClientsCountSpan.innerText = onlineClientsCount

    } else {
      loginControl.classList.add('active')
      clientsPageHead.classList.remove('active')
    }
  }
  renderUsersList(usersObject, lastReadTimeObject, onClickHandler) {
    try {
      // Reset usersList
      const usersList = document.querySelector('#users-list');
      usersList.innerHTML = '';

      if (!usersObject) {
        return; // Early return if no usersObject is provided
      }

      // Sort usersObject for online users to show first
      const usersArray = [];
      Object.keys(usersObject).forEach(email => {
        const user = usersObject[email];
        // If user is online, move to the beginning of the array
        if (user.socketsList?.length > 0) {
          usersArray.unshift(user);
        } else {
          usersArray.push(user);
        }
      });

      // Show usersList if there are users
      if (usersArray.length > 0) {
        usersList.classList.add('active');
      } else {
        usersList.classList.remove('active'); // Hide if no users
      }

      usersArray.forEach(user => {
        // render last message
        const lastMessageObject = user.messages[user.messages.length - 1];
        let latestMessage = '';
        let latestDate = '';

        if (lastMessageObject) {
          latestMessage = lastMessageObject.message;
          latestDate = dayjs(lastMessageObject.createdAt).format('MMMM D, YYYY h:mmA');
        }

        // Create userDiv
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-div');
        userDiv.dataset.userEmail = user.email;
        userDiv.id = `user-div-${user.id}`
        userDiv.onclick = onClickHandler;

        // Check online status
        let onlineStatusIcon = `<i class="fa-regular fa-face-meh"></i>`;
        let onlineStatus = '';

        if (user.socketsList.length > 0) {
          userDiv.classList.add('online');
          onlineStatusIcon = `<i class="fa-regular fa-face-smile"></i>`;
          onlineStatus = 'online';
        }


        // Set innerHTML for userDiv
        userDiv.innerHTML = `
        <div class='user-top-left'>
          <div class='user-info'>
            <div class='user-info-div ${onlineStatus}'>
              <span class='user-name'>${user.name}</span>
            </div>
          </div>  
            <div class='user-lastMessage'>${latestMessage}</div>
          <span class='user-last-date'>${latestDate}</span>
        </div>
        <div class='user-control'>
          <button class='user-control-btn delete' data-user-id=${user.id} data-user-email=${user.email}>
            <i class="fa-solid fa-user-xmark"></i>
          </button>
          <button class='user-control-btn edit' data-user-id=${user.id} data-user-email=${user.email}>
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
        </div>
        <div class='unread-messages-count'></div>
      `;
        usersList.appendChild(userDiv);

        // update new messages count
        this.updateNewMessageCount(user, lastReadTimeObject)
      });

    } catch (err) {
      console.error('Failed to render users list:', err);
    }
  }
  updateNewMessageCount(user, lastReadTimeObject) {
    const userDiv = document.querySelector(`#user-div-${user.id}`)
    const unreadMessageDiv = userDiv.querySelector('.unread-messages-count')

    // filter only user messages
    const userMessages = user.messages.filter(messageObject => messageObject.from === 'user')
    let unreadMessageCount = userMessages.length
    const lastReadString = lastReadTimeObject ? lastReadTimeObject[user.id] : null
    if (lastReadString) {
      const lastReadDate = new Date(lastReadString)
      userMessages.forEach(messageObject => {
        const isAfter = dayjs(lastReadDate).isAfter(messageObject.createdAt)
        if (isAfter) {
          unreadMessageCount--
        }
      })
    }

    // toggle unreadMessage
    if (unreadMessageCount > 0) {

      // check if the unread messages is bigger than before
      // if so trigger css animation shake
      if (user.unreadMessagesCount !== undefined && Number(user.unreadMessagesCount) < Number(unreadMessageCount)) {
        unreadMessageDiv.classList.add('shake')
      }
      unreadMessageDiv.classList.add('active')
      unreadMessageDiv.innerText = unreadMessageCount
    } else {
      unreadMessageDiv.classList.remove('active')
    }
    // store to user unreadMessage
    user.unreadMessagesCount = unreadMessageCount
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
    this.usersObject = null
    this.onlineUsersObject = null
    this.lastReadTime = null
    this.currentChatUserId = null
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
      console.error('on error:', message)
      this.view.renderMessage(message)
    })

    // login
    socket.on('login', (data) => {
      if (!this.isLogin) {
        const login = data.login
        const adminSessionId = data.adminSessionId
        if (login) {
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

    // deleteUser
    socket.on('adminDeleteUser', async (data) => {
      if (!data.ok) {
        sweetAlert.error('Fail', data.error.message)
      } else {
        await sweetAlert.success('User Deleted', data.message)
        // update users
        this.model.getAllUsers()
      }
    })
  }
  setLastReadTime(userId) {
    try {
      if (!userId) throw new Error('Missing userId')

      let lastRead = {}
      // get old object
      let oldLastReadObject = localStorage.getItem('lastReadObject')
      if (oldLastReadObject) {
        lastRead = JSON.parse(oldLastReadObject)
      }
      lastRead[String(userId)] = new Date().toISOString()

      localStorage.setItem('lastReadObject', JSON.stringify(lastRead))
    } catch (err) {
      sweetAlert.error('Fail set read time', err.message)
    }
  }
  getLastReadTime() {
    let lastRead = localStorage.getItem('lastReadObject') || {}
    if (typeof lastRead === 'string') {
      lastRead = JSON.parse(lastRead)
    }
    return lastRead
  }
  // Socket Listener functions ===================
  onAdminGetUsers = (newUsersObject) => {
    // check user login / logout
    if (this.usersObject && newUsersObject) {
      const newLoginUsers = []
      const newLogoutUsers = []
      const newCreatedUsers = []
      Object.keys(newUsersObject).forEach(email => {
        const newUser = newUsersObject[email]
        const oldUser = this.usersObject[email]
        // new user created
        if (!oldUser) {
          // push new user to the list
          newCreatedUsers.push(newUser)
        } else {
          // user login
          if (oldUser.socketsList.length === 0 && newUser.socketsList.length > 0) {
            newLoginUsers.push(newUser)
          }
          // user logout
          if (oldUser.socketsList.length > 0 && newUser.socketsList.length === 0) {
            newLogoutUsers.push(newUser)
          }
        }
      })

      // show flash messages
      const flashMessages = []
      newLoginUsers.forEach(user => {
        flashMessages.push({
          message: `${user.name} has login`,
          color: 'blue'
        })
      })
      newLogoutUsers.forEach(user => {
        flashMessages.push({
          message: `${user.name} has logout`,
          color: 'red'
        })
      })
      newCreatedUsers.forEach(user => {
        flashMessages.push({
          message: `${user.name} created a new account`,
          color: 'orange'
        })
      })
      flashNote.bulkInsert(flashMessages)
    }

    // store users
    this.usersObject = newUsersObject

    // get lastReadTime
    this.lastReadTime = this.getLastReadTime()

    // render users list
    this.view.renderUsersList(newUsersObject, this.lastReadTime, this.userDivOnClickHandler)

    // render header (user count)
    this.view.renderHeader(this.usersObject)
  }
  onMessage = (messageArray) => {
    const userId = messageArray[0].userId
    const user = this.findUserById(userId)

    // store to local
    user.messages = messageArray

    // get lastReadTime
    this.lastReadTime = this.getLastReadTime()

    // update current chart room user read time
    if (this.currentChatUserId !== null) {
      this.setLastReadTime(this.currentChatUserId)
      this.lastReadTime = this.getLastReadTime()
    }

    // render latest Message
    this.view.renderUsersList(this.usersObject, this.lastReadTime, this.userDivOnClickHandler)

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
    this.view.renderHeader(null)
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
      let target = e.target

      // Click on controller btn
      if (target.tagName === "I") {
        target = target.parentElement
      }
      if (target.tagName === "BUTTON") {
        if (target.classList.contains('delete')) {
          this.deleteBtnHandler(target)
        }
        if (target.classList.contains('edit')) {
          this.editBtnHandler(target)
        }
        return
      }

      // Click on UserDiv, show messages 
      // find user in local
      const email = e.currentTarget.dataset.userEmail
      const currentUser = this.usersObject[email]

      if (!currentUser) throw new Error(`Can not find user with email: ${email}`)

      // render user div with user messages
      this.view.renderMessagePanel(currentUser)

      // show message panel
      const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
      messagePanelWrapper.classList.add('active')

      // record read time
      this.setLastReadTime(currentUser.id)

      // update new message count
      this.view.updateNewMessageCount(currentUser, this.getLastReadTime())

      // set currentChatUserId
      this.currentChatUserId = currentUser.id

    } catch (err) {
      console.error(err)
      sweetAlert.error('Fail to open', err.message)
    }
  }
  messagePanelWrapperClickHandler = (e) => {
    const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
    if (e.target === messagePanelWrapper) {
      messagePanelWrapper.classList.remove('active')
      // remove current chat userId
      this.currentChatUserId = null
    }
  }
  messagePanelCloseHandler = () => {
    const messagePanelWrapper = document.querySelector('#message-panel-wrapper')
    messagePanelWrapper.classList.remove('active')
    // remove current chat userId
    this.currentChatUserId = null
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
  deleteBtnHandler = async (target) => {
    const userId = target.dataset.userId
    const userEmail = target.dataset.userEmail
    const result = await sweetAlert.confirm('Delete User', `You want to delete user ${userEmail}`)
    if (result.isConfirmed) {
      this.model.deleteUser(userId)
    }
  }
  editBtnHandler = async (target) => {
    const userId = target.dataset.userId
  }
}

const model = new Model()
const view = new View()
const controller = new Controller(model, view)
controller.init()