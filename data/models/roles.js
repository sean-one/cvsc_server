const db = require('../dbConfig');

module.exports = {
    getBusinessRoles,
    getAllUserRoles,
    createRoleRequest,
    approveRoleRequest,
    upgradeCreatorRole,
    downgradeManagerRole,
    deleteRole,


    getUserBusinessRoles,

    validateBusinessAdmin,
    validateBusinessManagement,
    getRoleById,
    getUserBusinessRole,
    checkForDuplicate,
    checkForRole,
}

// .get('ROLES/businesses/:business_id') - returns array of roles for a selected business (ACTIVE/INACTIVE)
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

// .get('ROLES/users/:user_id') - returns array of ALL roles (active/inactive) for a selected user id
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

// .post('ROLES/businesses/:business_id/role-requests') - creates a new role request with business and user ids
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

// .put('ROLES/:role_id/actions') - approves business role request
async function approveRoleRequest(request_id, management_id) {

    await db('roles')
        .where({ id: request_id })
        .update({ active_role: true, approved_by: management_id })

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

// .put('ROLES/:role_id/actions') - upgrade business creator role to business management role 
async function upgradeCreatorRole(request_id, management_id) {
    await db('roles')
        .where({ id: request_id })
        .update({ role_type: process.env.MANAGER_ACCOUNT, approved_by: management_id })

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

// .put('ROLES/:role_id/actions') - downgrade business manager role to business creator role
async function downgradeManagerRole(role_id, admin_id) {
    await db('roles')
        .where({ id: role_id })
        .update({ role_type: process.env.CREATOR_ACCOUNT, approved_by: admin_id })

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

// .delete('ROLES/:role_id') - delete role by user or by manager
async function deleteRole(role_id) {
    try {
        return await db.transaction(async trx => {
            const { business_id, user_id } = await db('roles')
                .transacting(trx)    
                .where({ id: role_id })
                .first();
            
            await db('events')
                .transacting(trx)
                .where({ created_by: user_id, brand_id: business_id })
                .update({ brand_id: null, active_event: false })
            
            await db('events')
                .transacting(trx)
                .where({ created_by: user_id, venue_id: business_id })
                .update({ venue_id: null, active_event: false })

            await db('roles')
                .transacting(trx)
                .where({ id: role_id })
                .del()
        
            return { business_id, user_id }
        })
    } catch (error) {
        throw error
    }
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




//! VALIDATION FUNCTIONS
// isBusinessAdmin - return TRUE/FALSE based on user business role
// returns true for ADMIN only
async function validateBusinessAdmin(business_id, user_id) {
    return await db('roles')
        .where({ business_id: business_id, user_id: user_id, active_role: true, role_type: process.env.ADMIN_ACCOUNT })
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}
// isBusinessManager - return TRUE/FALSE based on user business role
// returns true for MANAGER and ADMIN
async function validateBusinessManagement(business_id, user_id) {
    return await db('roles')
        .where({ business_id: business_id, user_id: user_id, active_role: true })
        .andWhere('role_type', '>=', process.env.MANAGER_ACCOUNT)
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}

async function getRoleById(role_id) {
    return await db('roles')
        .where({ 'roles.id': role_id})
        .select(
            [
                'roles.business_id',
                'roles.user_id',
                'roles.role_type',
                'roles.active_role'
            ]
        )
        .first()
}

// validators.js - validateBusinessManagement, validateRoleDelete - ONLY ACTIVE ROLE
function getUserBusinessRole(business_id, user_id) {
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

// validators.js - validateRoleRequest (TRUE/FALSE) - checks for role active or inactive
function checkForDuplicate(business_id, user_id) {
    return db('roles')
        .where({ user_id: user_id, business_id: business_id})
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}

// validators.js - validateEventBusinessRoles (TRUE/FALSE) - checks for ACTIVE role
function checkForRole(business_id, user_id) {
    return db('roles')
        .where({ user_id: user_id, business_id: business_id, active_role: true })
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}