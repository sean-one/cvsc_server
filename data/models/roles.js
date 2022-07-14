const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    findRole,
    checkUserRoles,
    findByBusiness,
    userValidation,
    getUserBusinessRoles,
    findByUser_All,
    approveRoleRequest,
    upgradeCreatorRole,
    downgradeManagerRole,
    removeUserRole,
    createRequest,
}

// for postman to check db
function find() {
    return db('roles')
}

// find role request by request_id
async function findById(request_id) {
    const role_request = await db('roles')
        .where({ 'roles.id': request_id })
        .select(
            [
                'roles.business_id',
                'roles.user_id',
                'roles.role_type'
            ]
        )
        .first()
    if (role_request == null) {
        console.log(role_request)
        throw new Error('request_not_found')
    } else {
        return role_request;
    }
}

async function checkUserRoles(user_id, business_ids) {
    const roles = await db('roles')
        .where({ user_id: user_id, active_role: true })
        .whereIn('business_id', business_ids)
        .select(
            [
                'roles.business_id',
                'roles.role_type',
            ]
        )
    if(roles.length <= 0) {
        throw new Error('invalid_user_rights')
    } else {
        return roles;
    }
}

async function findRole(user_id, business_id) {
    const role = await db('roles')
        .where({ user_id: user_id, business_id: business_id })
        .select(
            [
                'roles.role_type'
            ]
        )
        .first()
    if(role === null) {
        throw new Error('manage_role_not_found')
    } else {
        return role;
    }
}

// find all role entries by business id
async function findByBusiness(business_id) {
    return db('roles')
        .where({ 'roles.business_id': business_id })
        .leftJoin('users', 'roles.user_id', '=', 'users.id')
        .select(
            [
                'roles.id',
                'roles.user_id',
                'users.username',
                'roles.business_id',
                'roles.role_type',
                'roles.active_role',
                'roles.approved_by',
            ]
        )
}

// USED - inside jwt_helper validateRequestRights
// validates users account_type is above 'creator' - returns only 'manager' & 'admin'
async function userValidation(user_id, business_id) {
    
    const role_request = await db('roles')
        .where({ user_id: user_id, business_id: business_id, active_role: true })
        .whereNotIn('roles.role_type', ['creator'])
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
function findByUser_All(user_id) {
    return db('roles')
        .where({ 'roles.user_id': user_id })
        .join('businesses', 'roles.business_id', '=', 'businesses.id')
        .select(
            [
                'roles.business_id',
                'businesses.business_name',
                'roles.role_type',
                'roles.active_role'
            ]
        )
}

// pendingRequest /roles/approve/:request_id
async function approveRoleRequest(request_id, admin_id) {

    await db('roles')
        .where({ id: request_id })
        .update({ active_role: true, approved_by: admin_id})

    return await db('roles')
        .where({ 'roles.id': request_id })
        .leftJoin('users', 'roles.user_id', '=', 'users.id')
        .select(
            [
                'roles.id',
                'roles.user_id',
                'users.username',
                'roles.business_id',
                'roles.role_type',
                'roles.active_role',
                'roles.approved_by',
            ]
        )
        .first()
}

async function upgradeCreatorRole(request_id, admin_id) {
    await db('roles')
        .where({ id: request_id })
        .update({ role_type: 'manager', approved_by: admin_id})
    
    return await db('roles')
        .where({ 'roles.id': request_id })
        .leftJoin('users', 'roles.user_id', '=', 'users.id')
        .select(
            [
                'roles.id',
                'roles.user_id',
                'users.username',
                'roles.business_id',
                'roles.role_type',
                'roles.active_role',
                'roles.approved_by',
            ]
        )
        .first()
}

async function downgradeManagerRole(role_id, admin_id) {
    await db('roles')
        .where({ id: role_id })
        .update({ role_type: 'creator', approved_by: admin_id})
    
    return await db('roles')
        .where({ 'roles.id': role_id })
        .leftJoin('users', 'roles.user_id', '=', 'users.id')
        .select(
            [
                'roles.id',
                'roles.user_id',
                'users.username',
                'roles.business_id',
                'roles.role_type',
                'roles.active_role',
                'roles.approved_by',
            ]
        )
        .first()
}

async function removeUserRole(request_id) {
    const deleted_count = await db('roles')
        .where({ id: request_id})
        .del()

    if(deleted_count >= 1) {
        return deleted_count;
    } else {
        throw new Error('delete_error')
    }
}

// roles/create-request
async function createRequest(business_id, user_id) {
    const created_role = await db('roles')
        .insert({
            user_id: user_id,
            business_id: business_id
        }, ['id'])
        
    return await db('roles')
        .where({ 'roles.id': created_role[0].id })
        .join('businesses', 'roles.business_id', '=', 'businesses.id')
        .select(
            [
                'roles.business_id',
                'businesses.business_name',
                'roles.role_type',
                'roles.active_role'
            ]
        )
    
}