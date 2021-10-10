const db = require('../dbConfig')

module.exports = {
    find,
    addRequest,
    findRequestByBusinessId

}

function find() {
    return db('pendingRequests')
}

async function addRequest(request) {
    return await db('pendingRequests')
        .insert(request, ['id'])
}

async function findRequestByBusinessId(ids) {
    return await db('pendingRequests')
        .whereIn('business_id', ids)
        .join('businesses', 'pendingRequests.business_id', '=', 'businesses.id')
        .select(
            [
                'pendingRequests.id',
                'pendingRequests.business_id',
                'pendingRequests.request_for',
                'pendingRequests.user_id',
                'pendingRequests.username',
                'businesses.name'
            ]
        )
}