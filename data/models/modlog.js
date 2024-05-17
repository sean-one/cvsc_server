const db = require('../dbConfig');

module.exports = {
    createModLog,
}

async function createModLog(details) {
    await db('modlogs')
        .insert(details)
}