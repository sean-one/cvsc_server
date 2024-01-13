const express = require('express');

const db = require('../data/models/roles');
const roleErrors = require('../error_messages/roleErrors');
const { validToken } = require('../helpers/jwt_helper');
const {
    formatValidationCheck,
    validateBusinessManagement,
    validateRoleDelete,
    validateRoleAction,
    validateRoleRequest,
    uuidValidation,
    result
} = require('../helpers/validators');

const router = express.Router();

// useRolesApi - useManagementRole, useUserBusinessRole
router.get('/businesses/:business_id/user-role', [validToken, uuidValidation, formatValidationCheck], async (req, res, next) => {
    try {
        const user_id = req.user_decoded;
        const { business_id } = req.params;
    
        const user_business_role = await db.getUserBusinessRole(business_id, user_id)

        if (user_business_role === undefined) {
            throw new Error('role_not_found')
        }
        
        res.status(200).json(user_business_role)
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
        
    }
})

// useRolesApi - useBusinessRolesQuery
router.get('/businesses/:business_id', [validToken, uuidValidation, formatValidationCheck, validateBusinessManagement, result], async (req, res, next) => {
    try {
        const { business_id } = req.params
        const business_roles = await db.getBusinessRoles(business_id)
        
        res.status(200).json(business_roles);
        
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })

    }
})

// useRolesApi - useUserRolesQuery
router.get('/users/:user_id', [validToken, uuidValidation, result], async (req, res, next) => {
    try {
        const { user_id } = req.params

        if (req.user_decoded !== user_id) { throw new Error('invalid_user') }

        const user_roles = await db.getAllUserRoles(user_id)

        res.status(200).json(user_roles)

    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })

    }
})

// useRolesApi - useCreateRoleMutation
router.post('/businesses/:business_id/role-requests', [validToken, uuidValidation, formatValidationCheck, validateRoleRequest, result], async (req, res, next) => {
    try {
        const { business_id } = req.params
    
        const role_request = await db.createRoleRequest(business_id, req.user_decoded)

        res.status(201).json(role_request)

    } catch (error) {
        // console.log(error)
        if(error?.message) {
            next({
                status: roleErrors[error.message]?.status,
                message: roleErrors[error.message]?.message,
                type: roleErrors[error.message]?.type,
            })
        }
        // console.log(error)
    }

})

// useRolesApi - useRoleAction
router.put('/:role_id/actions', [validToken, uuidValidation, formatValidationCheck, validateRoleAction, result], async (req, res, next) => {
    try {
        const { action_type } = req.body
        const { role_id } = req.params
        const management_id = await req.user_decoded
    
        // approve business creator role request
        if (action_type === 'approve') {
            const new_creator_role = await db.approveRoleRequest(role_id, management_id)
    
            res.status(200).json(new_creator_role)
        }

        // upgrade business creator role to business manager role
        else if (action_type === 'upgrade') {
            const new_manager_role = await db.upgradeCreatorRole(role_id, management_id)

            res.status(200).json(new_manager_role)
        }

        // downgrade business manager role to business creator role
        else if (action_type === 'downgrade') {
            const downgraded_role = await db.downgradeManagerRole(role_id, management_id)

            res.status(200).json(downgraded_role)
        }
        else {
            throw new Error('invalid_action')
        }
        
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
    }
})

// useRolesApi - useRoleDelete
router.delete('/:role_id', [validToken, uuidValidation, formatValidationCheck, validateRoleDelete, result], async (req, res, next) => {
    try {
        const { role_id } = req.params;
        const deletedRole = await db.deleteRole(role_id)

        res.status(200).json(deletedRole)
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
        
    }
})

module.exports = router;