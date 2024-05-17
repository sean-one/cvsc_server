const db = require('../dbConfig');

module.exports = {
    createModLog,
    getModLogs,
}

async function createModLog(details) {
    await db('modlogs')
        .insert(details)
}

async function getModLogs() {
    return await db('modlogs')
        .select([
            'modlogs.*'
        ])
        .orderBy('created_at', 'desc')
}