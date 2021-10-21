const db = require('../dbConfig')

module.exports = {
    find,
    addRequest,
    getRequestByUser,
    findRequestByBusinessId,
    removeRequest

}

function find() {
    return db('pendingRequests')
}

async function addRequest(request) {
    return await db('pendingRequests')
        .insert(request, ['id'])
}

async function getRequestByUser(userId) {
    const adminRoles = await db('roles')
        .where({ user_id: userId, roletype: 'admin' })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as admin')
            ]
        )
        .first()
    return await db('pendingRequests')
            .whereIn('business_id', adminRoles.admin)
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

function removeRequest(id) {
    return db('pendingRequests')
        .where(id)
        .del()
}