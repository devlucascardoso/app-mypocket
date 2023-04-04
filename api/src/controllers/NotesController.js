const sqliteConnection = require('../database/sqlite')

class NotesController {
  async create(request, response) {
    const { title, descriptions, tags, links } = request.body
    const { user_id } = request.params

    const database = await sqliteConnection()
    const note_id = await database.run(
      `INSERT INTO notes (title, descriptions, user_id) VALUES (?, ?, ?)`,
      [title, descriptions, user_id]
    )

    const linksInsert = links.map(link => {
      return {
        note_id,
        url: link
      }
    })

    const linksPromises = linksInsert.map(link => {
      return database.run(
        `INSERT INTO links (note_id, url) VALUES (?, ?)`,
        [link.note_id, link.url]
      )
    })

    await Promise.all(linksPromises)

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    const tagsPromises = tagsInsert.map(tag => {
      return database.run(
        `INSERT INTO tags (note_id, name, user_id) VALUES (?, ?, ?)`,
        [tag.note_id, tag.name, tag.user_id]
      )
    })

    await Promise.all(tagsPromises)

    response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const database = await sqliteConnection()
    const note = await database.get(`SELECT * FROM notes WHERE id = ?`, [id])
    const tags = await database.all(`SELECT * FROM tags WHERE note_id = ? ORDER BY name`, [id])
    const links = await database.all(`SELECT * FROM links WHERE note_id = ? ORDER BY created_at`, [id])

    return response.json({
      ...note,
      tags,
      links
    })
  }

  async delete(request, response) {
    const { id } = request.params

    const database = await sqliteConnection()
    await database.run(`DELETE FROM notes WHERE id = ?`, [id])

    return response.json()
  }

  async index(request, response) {
    const { title, user_id, tags } = request.query

    const database = await sqliteConnection()
    let notes

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim())

      notes = await database.all(
        `SELECT notes.id, notes.title, notes.user_id
         FROM tags
         INNER JOIN notes ON notes.id = tags.note_id
         WHERE notes.user_id = ?
           AND notes.title LIKE ?
           AND name IN (${filterTags.map(() => '?').join(',')})
         ORDER BY notes.title`,
        [user_id, `%${title}%`, ...filterTags]
      )
    } else {
      notes = await database.all(
        `SELECT * FROM notes WHERE user_id = ? AND title LIKE ? ORDER BY title`,
        [user_id, `%${title}%`]
      )
    }

    const userTags = await database.all(`SELECT * FROM tags WHERE user_id = ?`, [user_id])
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }
    })

    return response.json(notesWithTags)
  }
}

module.exports = NotesController
