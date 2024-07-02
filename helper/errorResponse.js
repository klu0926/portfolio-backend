const responseJSON = require('./responseJSON')

/**
  * Response with Error
  * @param {Response} res - Response object from the router
  * @param {Error} err - Error object
  * @param {String} action - Name of the action
  * @returns {void} 
*/
function errorResponse(res, err, action) {
  console.error(err)
  res.status(err.statusCode || 500).json(responseJSON(false, action, null, err.message, err))
}

module.exports = errorResponse