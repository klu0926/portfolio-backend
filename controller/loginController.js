const ResponseError = require('../helper/ResponseError')
const errorResponse = require('../helper/errorResponse')
const bcrypt = require('bcrypt')
const responseJSON = require('../helper/responseJSON')


const loginController = {
  postLogin: async (req, res) => {
    try {
      const password = req.body.password
      if (!password) throw new ResponseError('Missing password', 401)

      // check password
      const isCorrect = bcrypt.compareSync(password, process.env.PASSWORD_HASH)
      if (!isCorrect) throw new ResponseError('Wrong password', 401)

      // set session
      req.session.user = 'user'

      // response
      res.status(200).json(responseJSON(true, 'POST', null, 'Successfully login'))
    } catch (err) {
      errorResponse(res, err, 'POST')
    }
  }
}

module.exports = loginController