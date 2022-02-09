const db = require('../dbConfig');

module.exports = {
    getBusinessAdminBusinessIds,
    getRequestBusinessIds,
    findByUser,
    getPendingRequest,
    updateRolesByBusinessAdmin,

    addRequest,
    getUserAdminRoles,
    getRolesByBusiness,
    getEventRolesByUser,
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

function findByUser(userId) {
    // used at profile
    return db('roles')
        .where({ user_id: userId, active_role: true })
        .select(
            [
                'business_id',
                'role_type',
            ]
        )
}
    
async function getPendingRequest(admin_id) {
    // roles/pending-request
    
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

// roles/update-request
async function updateRolesByBusinessAdmin(approved, rejected, admin_id) {
    const { business_ids } = await getBusinessAdminBusinessIds(admin_id)
    try {
        await db.transaction(async trx => {
            if (approved.length > 0) {
                await db('roles')
                    .transacting(trx)
                    .whereIn('id', approved)
                    .update({ active_role: true, approved_by: parseInt(admin_id) })
            }

            if (rejected.length > 0) {
                await db('roles')
                    .transacting(trx)
                    .whereIn('id', rejected)
                    .delete()
            }
        })

        return await db('roles')
            .whereIn('business_id', business_ids)
            .where({ active_role: false })
            .whereNot({ user_id: admin_id })
            .leftJoin('users', 'roles.user_id', '=', 'users.id')
            .leftJoin('businesses', 'roles.business_id', '=', 'businesses.id')
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
    } catch (error) {
        console.log('error in catch')
        console.log(error)
        throw error
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