const sqliteConnection = require('../../sqlite')

const createUsers = require('./createUsers')
const createNotes = require('./createNotes')
const createTags = require('./createTags')
const createLinks = require('./createLinks')

async function migrationsRun () {
  const schemas = [
    createUsers,
    createNotes,
    createTags,
    createLinks
  ].join(';')

  sqliteConnection()
    .then(db => db.exec(schemas))
    .catch(error => console.error(error))
}

module.exports = migrationsRun
