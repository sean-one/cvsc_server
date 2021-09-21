const db = require('../dbConfig');

module.exports = {
    find,
    addRequest
}

function find() {
    return db('userRoleRequests')
}

async function addRequest(requestData) {
    return await db('userRoleRequests')
        .insert(requestData, ['id'])
}