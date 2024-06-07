if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const PORT = process.env.PORT || 3000
const express = require('express')
const app = express()
const cors = require('cors')
const routes = require('./routes')
const errorHandler = require('./routes/errorHandler')

// Middleware
app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use(routes)
// error handler
app.use(errorHandler)


app.listen(PORT, (req, res) => {
  console.log(`Server listening on PORT : ${PORT}`)
})