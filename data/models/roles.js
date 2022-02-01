const db = require('../dbConfig');

module.exports = {
    find,
    findByUser,
    updateRoleRequest,
    addRequest,
    getUserAdminRoles,
    getPendingRolesByBusiness,
    getRolesByBusiness,
    getRolesByBusinessAdmin,
    getEventRolesByUser,
    getBusinessAdmin,
    deleteRoles
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

// creates an array of busienss ids of businesses with user id listed as admin (business creators)
async function getBusinessAdmin(user_admin) {
    return await db('businesses')
        .where({ business_admin: user_admin })
        .select([ db.raw('JSON_AGG(businesses.id) as business_ids') ])
}

async function updateRoleRequest(requestResults, userId, userRoles) {
    try {
        await db.transaction(async trx => {
            if (requestResults.approvedReq.length > 0) {
                await db('roles')
                    .transacting(trx)
                    .whereIn('id', requestResults.approvedReq)
                    .update({ active_role: true,  approved_by: parseInt(userId) })

            }

            if (requestResults.rejectedReq.length > 0) {
                await db('roles')
                    .transacting(trx)
                    .whereIn('id', requestResults.rejectedReq)
                    .delete()
            }

        })

        return await db('roles')
            .whereIn('business_id', userRoles)
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
    } catch (error) {
        throw error;
    }
}

function addRequest(request_data, user_id) {
    return db('roles')
        .insert({ 
            user_id: user_id,
            business_id: request_data.business_id,
            role_type: request_data.request_for
        }, [ 'id' ])

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

// roles/pending-request
async function getPendingRolesByBusiness(business_ids) {
    return await db('roles')
        .whereIn('business_id', business_ids)
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

// roles/business-request
async function getRolesByBusiness(business_ids) {
    return await db('roles')
        .whereIn('business_id', business_ids)
        .where({ active_role: true })
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

async function getRolesByBusinessAdmin(admin_id) {
    const business_ids = await getBusinessAdmin(admin_id)
    const business_list = business_ids[0].business_ids
    if (!!business_list) {
        return await db('roles')
            .whereIn('business_id', business_list)
            .where({ active_role: true })
            .join('users', 'roles.user_id', '=', 'users.id')
            .join('businesses', 'roles.business_id', '=', 'businesses.id')
            .select(
                [
                    'roles.id',
                    'roles.user_id',
                    'users.username',
                    'roles.business_id',
                    'businesses.name',
                    'roles.role_type'
                ]
            )
    } else {
        return []
    }
}

// /roles/delete-roles
async function deleteRoles(toDelete) {
    return await db('roles')
        .whereIn('id', toDelete)
        .del()
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