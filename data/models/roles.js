const db = require('../dbConfig');

module.exports = {
    find,
    findByUser,
    addUserRoles,
    updateRoleRequest,
    getUserAdminRoles,
    findRolesByBusinessIds,
    getEventRolesByUser,
    removeRoles
}

function find() {
    return db('roles')
}

function findByUser(userId) {
    return db('roles')
    // return active_role false to get pending role request
    .where({ user_id: userId, active_role: true })
    .select(
        [
            'business_id',
            'role_type',
        ]
    )
}
    
async function addUserRoles(user_roles, userId) {
    try {
        await db.transaction(async trx => {
            
            // iterate through approved request and insert into roles
            for (let userRequest of user_roles.approved) {
                // insert each request into the roles table
                await db('roles')
                    .transacting(trx)
                    .insert(
                        { 
                            user_id: userRequest.user_id,
                            business_id: userRequest.business_id,
                            roletype: userRequest.roletype
                        }
                    )
                    .into('roles')
                    
                // delete each of the approved request from the pendingrequest table
                await db('pendingRequests').where({ id: userRequest.requestId }).first().del()
            }

            // iterate through rejected request and update the status
            for (let rejectedRequest of user_roles.rejected) {
                await db('pendingRequests').where({ id: rejectedRequest.id, request_status: 'open' }).update({ request_status: 'rejected' })
            }

        })
        return userId
    } catch (error) {
        throw error;
    }
}

function updateRoleRequest(requestResults) {
    console.log(requestResults.approvedReq)
    console.log(requestResults.rejectedReq)
    return
}

function getUserAdminRoles(userId) {
    return db('roles')
        .where({ user_id: userId, role_type: 'admin', active_role: true })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as admin')
            ]
        )
        .first()
}

async function findRolesByBusinessIds(businessIds) {
    return await db('roles')
        .whereIn('business_id', businessIds)
        .where({ active_role: false })
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
            ]
        )
}

// returns an array of business_id(s) for given user id
function getEventRolesByUser(userId) {
    return db('roles')
        .where({ user_id: userId })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as roles')
            ]
        )
        .groupBy('roles.user_id')
        .first()
}

async function removeRoles(roleIds) {
    return await db('roles')
        .whereIn('id', roleIds)
        .delete()
}