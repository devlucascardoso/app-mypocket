const sqlite = require('sqlite')
const { open } = require('sqlite')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')

const TMP_FOLDER = path.resolve(__dirname, '..', '..', 'tmp')
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, 'uploads')

const MULTER = {
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename (request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex')
      const fileName = `${fileHash}-${file.originalname}`

      return callback(null, fileName)
    }
  })
}

const dbPromise = open({
  filename: path.join(__dirname, '..', '..', 'db.sqlite'),
  driver: sqlite.Database
})

class UserAvatarController {
  async update (request, response) {
    const user_id = request.user.id
    const avatarFilename = request.file.filename

    const diskStorage = new DiskStorage()

    const db = await dbPromise
    const user = await db.get('SELECT * FROM users WHERE id = ?', user_id)

    if (!user) {
      throw new AppError('User not auth', 401)
    }

    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar)
    }

    const filename = await diskStorage.saveFile(avatarFilename)
    user.avatar = filename

    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [filename, user_id])

    return response.json(user)
  }
}

module.exports = UserAvatarController
