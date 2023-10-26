const express = require('express');

const db = require('../data/models/roles');
const roleErrors = require('../error_messages/roleErrors');
const { validToken } = require('../helpers/jwt_helper');
const {
    formatValidationCheck,
    validateBusinessManagement,
    validateRoleDelete,
    validateRoleManagement,
    validateRoleRequest,
    uuidValidation,
    result
} = require('../helpers/validators');

const router = express.Router();

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
router.get('/users/:user_id', [validToken], async (req, res, next) => {
    try {
        const user_id = req.user_decoded

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

        if(role_request[0]?.business_id) return res.status(201).json(role_request[0])

    } catch (error) {
        if(error.constraint === 'roles_user_id_business_id_unique') {
            next({
                status: roleErrors[error.constraint]?.status,
                message: roleErrors[error.constraint]?.message,
                type: roleErrors[error.constraint]?.type,
            })
        }
        if(error?.message) {
            next({
                status: roleErrors[error.message]?.status,
                message: roleErrors[error.message]?.message,
                type: roleErrors[error.message]?.type,
            })
        }
        // catch if business id is not uuid format
        if(error?.routine === 'string_to_uuid') {
            next({
                status: roleErrors[error.routine]?.status,
                message: roleErrors[error.routine]?.message,
                type: roleErrors[error.routine]?.type,
            })
        }

        // console.log(error)
    }

})

// useRolesApi - useRoleAction
router.put('/:role_id/actions', [validToken], async (req, res, next) => {
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
            const downgraded_role = await db.downgradeManagerRole(role_id, admin_id)

            res.status(200).json(downgraded_role)
        }
        else {}
        console.log(action_type)
        return
        
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
    }
})





//! useRemoveRoleMutation - removeRole - useRolesApi - REMOVE ROLE REQUEST (MANAGEMENT)
router.delete('/remove/:role_id', [validToken, validateRoleManagement, result ], async (req, res, next) => {
    try {
        const { role_id } = req.params

        await db.removeRole(role_id)
        
        res.status(200).json({ success: true, message: 'role successfully deleted' })

    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
    }
})

//! useRemoveUserRoleMutation - removeUserRole - useRolesApi - REMOVE USER ROLE (SELF)
router.delete('/user_remove/:role_id', [validToken, validateRoleDelete, result], async (req, res, next) => {
    try {
        const { role_id } = req.params

        await db.removeRole(role_id)

        res.status(200).json({ success: true, message: 'role successfully deleted' })

    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
        
    }
})


module.exports = router;