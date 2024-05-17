const db = require('../dbConfig');
const getAccountType = require('../../helpers/getAccountType');


module.exports = {
    getUserAccountRole,
    getAllUserRoles,
    getBusinessRoles,
    createRoleRequest,
    approveRoleRequest,
    upgradeCreatorRole,
    downgradeManagerRole,
    validateBusinessAdmin,
    validateBusinessManagement,
    getRoleById,
    getUserBusinessRole,
    checkForDuplicate,
    checkForRole,
    deleteRole,   
}

// .get('ROLES/users/:user_id/account-role) - returns highest active role type for a user
async function getUserAccountRole(user_id) {
    try {
        // IF ROLES ARE NOT FOUND, BASIC ACCOUNT TYPE RETURNED AS SUCCESS 
        const role = await db('roles')
            .where({ user_id: user_id, active_role: true })
            .select(
                [
                    'roles.role_type',
                ]
            )
            .orderBy('roles.role_type', 'desc')
            .first()

        return role ? { ...role, role_type: getAccountType(role.role_type) } : { role_type: 'basic' }
    } catch (error) {
        // 'INVALID TEXT REPRESENTATION from postgresql error.code '22P02'
        console.error(`Error fetching user account role`, error)
        throw new Error('get_user_account_role_server_error')
    }
}

// .get('ROLES/users/:user_id') - returns array of ALL roles (active/inactive) for a selected user id
// if NO ROLES or NO USER ID is found -> will return 200 and an empty array []
async function getAllUserRoles(user_id) {
    try {
        const roles = await db('roles')
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

        return roles.map(role => ({
            ...role,
            role_type: getAccountType(role.role_type)
        }))
    } catch (error) {
        console.error('Error fetching all user roles', error)
        throw new Error('all_user_roles_server_error')
    }
}

// .get('ROLES/businesses/:business_id') - returns array of roles for a selected business (ACTIVE/INACTIVE)
async function getBusinessRoles(business_id) {
    try {
        const business_roles = await db('roles')
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
        
            return business_roles.map(role => ({
                ...role,
                role_type: getAccountType(role.role_type)
            }))

    } catch (error) {
        console.error('Error fetching all business roles', error);
        throw new Error('all_business_roles_server_error');
    }
}

// .post('ROLES/businesses/:business_id/role-requests') - creates a new role request with business and user ids
async function createRoleRequest(business_id, user_id) {
    try {
        const [created_role] = await db('roles')
            .insert({
                user_id: user_id,
                business_id: business_id
            }, ['id'])
    
        const new_role = await db('roles')
            .where({ 'roles.id': created_role.id })
            .join('businesses', 'roles.business_id', '=', 'businesses.id')
            .select(
                [
                    'roles.id',
                    'roles.business_id',
                    'businesses.business_name',
                    'roles.user_id',
                    'roles.role_type',
                    'roles.active_role'
                ]
            )
            .first()
        
        return { ...new_role, role_type: getAccountType(new_role.role_type) }
    } catch (error) {
        console.error('Error creating new role request:', Object.keys(error));
        throw new Error('create_role_request_server_error');
    }

}

// .put('ROLES/:role_id/actions') - approves business role request
async function approveRoleRequest(request_id, management_id) {
    try {
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

    } catch (error) {
        console.error('Error approving role request:', error)
        throw new Error('approve_role_server_error');
    }

}

// .put('ROLES/:role_id/actions') - upgrade business creator role to business management role 
async function upgradeCreatorRole(request_id, management_id) {
    try {
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
        
    } catch (error) {
        console.error('Error upgrading business role:', error);
        throw new Error('upgrade_role_server_error');
    }
}

// .put('ROLES/:role_id/actions') - downgrade business manager role to business creator role
async function downgradeManagerRole(role_id, admin_id) {
    try {
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
        
    } catch (error) {
        console.error('Error downgrading business role:', error);
        throw new Error('downgrade_role_server_error');
    }
}

// .delete('ROLES/:role_id') - delete role by user or by manager
async function deleteRole(role_id) {
    try {
        return await db.transaction(async trx => {
            const roleToDelete = await db('roles')
                .transacting(trx)
                .where({ 'roles.id': role_id })
                .join('businesses', 'roles.business_id', '=', 'businesses.id')
                .select([ 'roles.id', 'roles.business_id', 'roles.user_id', 'businesses.business_name' ])
                .first()

            // delete any events created by user with business as business host
            await db('events').transacting(trx).where({ host_business: roleToDelete.business_id, created_by: roleToDelete.user_id }).del()
            // delete business role
            await db('roles').transacting(trx).where({ 'roles.id': roleToDelete.id }).del()
        
            return { business_id: roleToDelete.business_id, user_id: roleToDelete.user_id, business_name: roleToDelete.business_name }
        })
    } catch (error) {
        console.error('Error deleting role:', error);
        throw new Error('delete_role_server_error');
    }
}


//! VALIDATION FUNCTIONS

// isBusinessAdmin - return TRUE/FALSE based on user business role (returns ADMIN only)
async function validateBusinessAdmin(business_id, user_id) {
    return await db('roles')
        .where({ business_id: business_id, user_id: user_id, active_role: true, role_type: process.env.ADMIN_ACCOUNT })
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}

// isBusinessManager - return TRUE/FALSE based on user business role (returns MANAGER or ADMIN)
async function validateBusinessManagement(business_id, user_id) {
    return await db('roles')
        .where({ business_id: business_id, user_id: user_id, active_role: true })
        .andWhere('role_type', '>=', process.env.MANAGER_ACCOUNT)
        .select(['roles.id'])
        .first()
        .then(role => !!role)
}

// validators.js - validateRoleAction confirms role to take action on
async function getRoleById(role_id) {
    try {
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
    } catch (error) {
        console.error('Error fetching role by id:', error);
        throw new Error('fetch_role_id_server_error')
    }
}

// validators.js - validateBusinessManagement, validateRoleDelete - ONLY ACTIVE ROLE
function getUserBusinessRole(business_id, user_id) {
    try {
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
        
    } catch (error) {
        console.error('Error getting user business role:', error);
        throw new Error('fetch_user_business_role_server_error')
    }
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