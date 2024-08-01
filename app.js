if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
// for socket.io
const http = require('http')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()
const cors = require('cors')
const routes = require('./routes')
const errorHandler = require('./routes/errorHandler')
var session = require('express-session')
const socketController = require('./socket')

// cors
const whiteList = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.lukuoyu.com',
  'https://klu-portfolio-server-5858060573f4.herokuapp.com'
];
const corsOptions = {
  origin: function (origin, callback) {
    // same-site origin === undefined
    if (whiteList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
};

// check rawHeader (block postman)
app.use((req, res, next) => {
  const rawHeaders = req.rawHeaders;
  const blackList = [
    'PostmanRuntime'
  ]

  let isWhiteListed = true
  rawHeaders.forEach(header => {

    blackList.forEach(item => {
      if (header.includes(item)) {
        isWhiteListed = false
        console.log('header:', header)
        console.log('item:', item)
      }
    })
  })
  if (!isWhiteListed) {
    res.status(403).json({ 'error': 'Not in whitelist' })
  }
  next()
})
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// public asset
app.use(express.static('public'))

// session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}))
// Routes
app.use(routes)

// error handler
app.use(errorHandler)

// use raw http for socket.io
const httpServer = http.createServer(app)

// socket.io
socketController.init(httpServer, PORT)

// server start
httpServer.listen(PORT, (req, res) => {
  console.log(`Server listening on PORT : ${PORT}`)
})

