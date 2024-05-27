const router = require('express').Router()

function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({
    ok: false,
    error: err.message
  })
}

module.exports = errorHandler