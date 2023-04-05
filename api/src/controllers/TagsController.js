const sqliteConnection = require('../database/sqlite');

class TagsController {
  async index(request, response) {
    const user_id = request.user.id;

    const database = await sqliteConnection();
    const tags = await database.all('SELECT * FROM tags WHERE user_id = ?', [user_id]);

    return response.json(tags);
  }
}

module.exports = TagsController;
