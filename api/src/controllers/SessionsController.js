const sqliteConnection = require('../database/sqlite')
const AppError = require('../utils/AppError')
const authConfig = require('../configs/auth')
const { compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')

class SessionsController {
  async create (request, response) {
    const { email, password } = request.body

    const database = await sqliteConnection()

    const user = await database.get('SELECT * FROM users WHERE email = ?', email)

    if (!user) {
      throw new AppError('Email or Password incorrect', 401)
    }

    const matchPassword = await compare(password, user.password)

    if (!matchPassword) {
      throw new AppError('Email or Password incorrect', 401)
    }

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    })

    return response.json({ user, token })
  }
}

module.exports = SessionsController
