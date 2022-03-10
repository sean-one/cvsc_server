const db = require('../dbConfig');

module.exports = {
    find,
    getUserBusinessRoles,
    getBusinessAdminBusinessIds,
    getRequestBusinessIds,
    findByUser,
    getPendingRequest,
    approveRequest,
    rejectRequest,
    createRequest,
}

// for postman to check db
function find() {
    return db('roles')
}

// returns an array of business_id(s) for given user id
// used validateUserRole for create and update events
function getUserBusinessRoles(user_id) {
    return db('roles')
        .where({ user_id: user_id })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as business_ids')
            ]
        )
        .groupBy('roles.user_id')
        .first()
}

async function getBusinessAdminBusinessIds(user_admin) {
    // creates an array of business ids of businesses with user id listed as admin (business creators)
    return await db('businesses')
        .where({ business_admin: user_admin })
        .select([db.raw('JSON_AGG(businesses.id) as business_ids')])
        .first()
}

async function getRequestBusinessIds(request_ids) {
    // creates an array of business ids from an array of request ids
    return await db('roles')
        .whereIn('id', request_ids)
        .select([db.raw('JSON_AGG(roles.business_id) as business_id_request')])
        .first()
}

// used at profile
function findByUser(userId) {
    return db('roles')
        .where({ user_id: userId, active_role: true })
        .select(
            [
                'business_id',
                'role_type',
            ]
        )
}
    
// roles/pending-request
async function getPendingRequest(admin_id) {    
    // get business ids that user has business admin rights to
    const { business_ids } = await getBusinessAdminBusinessIds(admin_id)
    
    if (!!business_ids) {
        return await db('roles')
            .whereIn('business_id', business_ids)
            .where({ active_role: false })
            .whereNot({ user_id: admin_id })
            .join('users', 'roles.user_id', '=', 'users.id')
            .join('businesses', 'roles.business_id', '=', 'businesses.id')
            .select(
                [
                    'roles.id',
                    'roles.user_id',
                    'users.username',
                    'roles.business_id',
                    'businesses.name',
                    'roles.role_type',
                    'roles.active_role'
                ]
            )
    } else {
        return []
    }
}

function approveRequest(user_id, req_id) {
    return db('roles')
        .where({ id: req_id })
        .update({ active_role: true, approved_by: parseInt(user_id) })
}

async function rejectRequest(req_id) {
    return await db('roles')
        .where({ id: req_id })
        .del()
}

// roles/create-request
function createRequest(request_data, user_id) {
    return db('roles')
        .insert({ 
            user_id: user_id,
            business_id: request_data.business_id,
            role_type: request_data.request_for
        }, [ 'id' ])

}