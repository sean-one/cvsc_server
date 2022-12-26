const db = require('../dbConfig');

module.exports = {
    find,
    findUserBusinessRole,
    findUserRoles,
    findById,
    findRolesPendingManagement,
    findByBusiness,
    getUserBusinessRoles,
    approveRoleRequest,
    upgradeCreatorRole,
    downgradeManagerRole,
    createRoleRequest,
    removeRole,
}

// for postman to check db
function find() {
    return db('roles')
}

// validateRoleManagement inside jwt_helper - finds business role for user
function findUserBusinessRole(business_id, user_id) {
    return db('roles')
        .where({ user_id: user_id, business_id: business_id, active_role: true })
        .select(
            [
                'roles.id',
                'roles.business_id',
                'roles.role_type'
            ]
        )
        .first()
}

// used in authRoute when user signs in
async function findUserRoles(user_id) {
    return db('roles')
        .where({ user_id: user_id })
        .leftJoin('businesses', 'roles.business_id', '=', 'businesses.id')
        .select(
            [
                'roles.id',
                'roles.business_id',
                'roles.role_type',
                'roles.active_role',
                'businesses.business_name'
            ]
        )
        .orderBy('roles.role_type', 'desc')
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

// returns an array of pending role request based on accounts with manager and admin credentials
async function findRolesPendingManagement(user_id) {
    let business_ids = []
    const management_roles = await db('roles')
        .where({ user_id: user_id, active_role: true })
        .whereNotIn('roles.role_type', [100,123])
        .leftJoin('businesses', 'roles.business_id', '=', 'businesses.id')
        .select(
            [
                'roles.business_id',
                'businesses.active_business'
            ]
        )
    
    await management_roles.map(role => {
        if(role.active_business) {
            return business_ids.push(role.business_id)
        } else {
            return
        }
    })
    
    return await db('roles')
        .whereIn('roles.business_id', business_ids)
        .andWhere('roles.active_role', false )
        .leftJoin('users', 'roles.user_id', '=', 'users.id')
        .leftJoin('businesses', 'roles.business_id', '=', 'businesses.id')
        .select(
            [
                'roles.id',
                'roles.business_id',
                'roles.role_type',
                'businesses.business_name',
                'roles.user_id',
                'users.username'
            ]
        )
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

// jwt_helper validateCreator - returns an array of business_id(s)
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

// pendingRequest /roles/approve/:request_id
async function approveRoleRequest(request_id, management_id) {

    await db('roles')
        .where({ id: request_id })
        .update({ active_role: true, approved_by: management_id})

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

// upgradeRole for creator role 
async function upgradeCreatorRole(request_id, management_id) {
    await db('roles')
        .where({ id: request_id })
        .update({ role_type: 456, approved_by: management_id})
    
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

// downgradeRole for manager role
async function downgradeManagerRole(role_id, admin_id) {
    await db('roles')
        .where({ id: role_id })
        .update({ role_type: 123, approved_by: admin_id})
    
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

// roles/create-request
async function createRoleRequest(business_id, user_id) {
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

async function removeRole(role_id) {
    const deleted_count = await db('roles')
        .where({ id: role_id })
        .del()

    if (deleted_count >= 1) {
        return deleted_count;
    } else {
        throw new Error('delete_error')
    }
}