const db = require('../dbConfig');

module.exports = {
    findUserBusinessRole,
    findUserRoles,
    findRoleById,
    findRolesPendingManagement,
    findRoleByBusiness,
    getUserBusinessRoles,
    getAllUserRoles,
    approveRoleRequest,
    upgradeCreatorRole,
    downgradeManagerRole,
    createRoleRequest,
    removeRole,
}


//! validateRoleManagement validators.js - finds business role for user
function findUserBusinessRole(business_id, user_id) {
    return db('roles')
        .where({ user_id: user_id, business_id: business_id, active_role: true })
        .select(
            [
                'roles.id',
                'roles.business_id',
                'roles.role_type',
                'roles.active_role'
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

// jwt_helper - inside validateRoleManagement & roleRequestUser
//! inside various validators.js functions
async function findRoleById(request_id) {
    return await db('roles')
        .where({ 'roles.id': request_id })
        .select(
            [
                'roles.business_id',
                'roles.user_id',
                'roles.role_type'
            ]
        )
        .first()
}

// returns an array of pending role request based on accounts with manager and admin credentials
async function findRolesPendingManagement(user_id) {
    let business_ids = []
    const management_roles = await db('roles')
        .where({ user_id: user_id, active_role: true })
        .whereNotIn('roles.role_type', [process.env.BASIC_ACCOUNT, process.env.CREATOR_ACCOUNT])
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
        // .where('roles.active_role', false)
        .whereIn('roles.business_id', business_ids)
        .andWhere('roles.active_role', 'false' )
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

// use int roleroute returns an array of roles for a selected business
async function findRoleByBusiness(business_id) {
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

// jwt_helper validateEventCreation - returns an array of ative roles business_id(s)
async function getUserBusinessRoles(user_id) {
    return await db('roles')
        .where({ user_id: user_id, active_role: true })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as business_ids')
            ]
        )
        .groupBy('roles.user_id')
        .first()
}

// validators - validateRoleRequest - returns an array of all roles business_ids active or not
async function getAllUserRoles(user_id) {
    return await db('roles')
        .where({ user_id: user_id })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as business_ids')
            ]
        )
        .groupBy('roles.user_id')
        .first()
}

// useCreateRoleMutation - useRolesApi
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
                'roles.id',
                'roles.business_id',
                'businesses.business_name',
                'roles.role_type',
                'roles.active_role'
            ]
        )

}

// useApproveRoleMutation - useRolesApi
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

// useUpgradeRoleMutation - useRolesApi 
async function upgradeCreatorRole(request_id, management_id) {
    await db('roles')
        .where({ id: request_id })
        .update({ role_type: process.env.MANAGER_ACCOUNT, approved_by: management_id})
    
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

// useDowngradeRoleMutation - useRolesApi
async function downgradeManagerRole(role_id, admin_id) {
    await db('roles')
        .where({ id: role_id })
        .update({ role_type: process.env.CREATOR_ACCOUNT, approved_by: admin_id})
    
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

//! useRemoveRoleMutation & useRemoveUserRoleMutation - useRolesApi - REMOVE USER ROLE (SELF & MANAGEMENT)
async function removeRole(role_id) {
    return await db('roles')
        .where({ id: role_id })
        .del()
}