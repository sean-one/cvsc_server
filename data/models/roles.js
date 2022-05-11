const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    userValidation,
    getUserBusinessRoles,
    findByUser,
    getPendingRequest,
    approveRoleRequest,
    rejectRequest,
    createRequest,
}

// for postman to check db
function find() {
    return db('roles')
}

// find role request by request_id
async function findById(request_id) {
    const role_request = await db('roles')
        .where({ id: request_id })
        .select(
            [
                'business_id'
            ]
        )
        .first()
    if (role_request == null) {
        throw new Error('request_not_found')
    } else {
        return role_request;
    }
}

// USED - inside jwt_helper validateRequestRights
// validates users account_type is above 'creator' - returns only 'manager' & 'admin'
async function userValidation(user_id, business_id) {
    const role_request = await db('roles')
        .where({ user_id: user_id, business_id: business_id, active_role: true })
        .whereNot({ role_type: 'creator' })
        .select(
            [
                'roles.id',
                'roles.user_id',
                'roles.business_id',
                'roles.role_type'
            ]
        )
        .first()
    if (role_request == null) {
        throw new Error('invalid_role_rights')
    } else {
        return role_request;
    }
}

// returns an array of business_id(s) for given user id
// used validateUserRole for create and update events
async function getUserBusinessRoles(user_id) {
    const user_roles = await db('roles')
        .where({ user_id: user_id, active_role: true })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as business_ids')
            ]
        )
        .groupBy('roles.user_id')
        .first()
    if (user_roles == null) {
        throw new Error('roles_not_found')
    } else {
        return user_roles
    }
}

// used at profile
function findByUser(user_id) {
    return db('roles')
        .where({ user_id: user_id, active_role: true })
        .select(
            [
                'business_id',
                'role_type',
            ]
        )
}
    
// roles/pending-request
async function getPendingRequest(user_id) {    
    // get business ids that user has business admin rights to
    const { business_ids } = await db('roles')
        .where({ user_id: user_id })
        .andWhere({ role_type: 'admin' })
        .orWhere({ role_type: 'manager'})
        .select([ db.raw('JSON_AGG(roles.business_id) as business_ids') ])
        .first()
    
    if (!!business_ids) {
        return await db('roles')
            .whereIn('business_id', business_ids)
            .where({ active_role: false })
            .whereNot({ user_id: user_id })
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

// pendingRequest /roles/approve/:id
async function approveRoleRequest(request_id, admin_id) {
    
    const updated_count = await db('roles')
        .where({ id: request_id })
        .update({ active_role: true, approved_by: admin_id })
    
    if(updated_count >  0) {
        const updated_role = await db('roles')
            .where({ id: request_id })
            .select(
                [
                    'roles.id',
                    'roles.user_id'
                ]
            )
            .first()

        // update account_type from 'basic' to 'creator' ignore if not 'basic'
        await db('users')
                .where({ id: updated_role.user_id, account_type: 'basic' })
                .update({ account_type: 'creator' })
        
        return updated_role
    } else {
        
        throw new Error('update_failed')
    }
}

// pendingRequest /roles/reject/:id
async function rejectRequest(req_id) {
    const deleted_count = await db('roles')
        .where({ id: req_id })
        .del()
    if(deleted_count > 0) {
        return req_id
    } else {
        throw new Error('delete_failed')
    }
}

// roles/create-request
function createRequest(business_id, user_id) {
    return db('roles')
        .insert({ user_id: user_id, business_id: business_id }, ['id'])
    
}