const db = require('../dbConfig');

module.exports = {
    getBusinessRoles,
    getAllUserRoles,
    createRoleRequest,
    findRoleById,
    getUserBusinessRoles,
    approveRoleRequest,
    upgradeCreatorRole,
    downgradeManagerRole,
    removeRole,

    findUserBusinessRole,
    checkRoleDuplicate,
}

// roleRoute - returns array of roles for a selected business (ACTIVE/INACTIVE)
async function getBusinessRoles(business_id) {
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

// roleRoute - returns array of ALL roles (active/inactive) for a selected user id
async function getAllUserRoles(user_id) {
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

// roleRoute - creates a new role request with business and user ids
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

//! validateEventCreation - returns an array of ative roles business_id(s) - VALIDATION HELPER
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
// async function getAllUserRoles(user_id) {
//     return await db('roles')
//         .where({ user_id: user_id })
//         .select(
//             [
//                 db.raw('ARRAY_AGG(roles.business_id) as business_ids')
//             ]
//         )
//         .groupBy('roles.user_id')
//         .first()
// }



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

//! useUpgradeRoleMutation - useRolesApi - UPGRADE CREATOR TO MANAGER 
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

//! useDowngradeRoleMutation - useRolesApi - DOWNGRADE MANAGER TO CREATOR
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

//! VALIDATION FUNCTIONS
// validators.js - validateBusinessManagement
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

// validators.js - validateRoleRequest
function checkRoleDuplicate(business_id, user_id) {
    return db('roles')
        .where({ user_id: user_id, business_id: business_id})
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}