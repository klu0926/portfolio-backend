const router = require('express').Router()
  function errorHandler(err, req, res, next) {
    console.error(err.stack)
    res.status(err.statusCode || 500).json({
      ok: false,
      error: err,
      message: err.message
    })
  }

module.exports = errorHandler