const express = require('express');

const db = require('../data/models/roles');
const roleErrors = require('../error_messages/roleErrors');
const { validToken } = require('../helpers/jwt_helper');
const { validateRoleDelete, validateRoleManagement, validateRoleRequest, result } = require('../helpers/validators');

const router = express.Router();

// useBusinessRolesQuery - getBusinessRoles - useRolesApi
router.get('/business/:business_id', async (req, res) => {
    try {
        const { business_id } = req.params
        const business_roles = await db.findRoleByBusiness(business_id)
        
        res.status(200).json(business_roles);
        
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })

    }
})

//! usePendingBusinessRolesQuery - getBusinessPendingRoles - useRolesApi - GET MANAGEMENT ROLE REQUEST
router.get('/management/:user_id', [ validToken ], async (req, res, next) => {
    try {
        const user_id = req.user_decoded
        
        const management_roles = await db.findRolesPendingManagement(user_id)
        
        res.status(200).json(management_roles)
            
    } catch (error) {
        console.log(error)
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
        
    }

})

//! useCreateRoleMutation - createRoleRequest - useRolesApi - CREATE NEW ROLE REQUEST
router.post('/request/:business_id', [ validToken, validateRoleRequest, result ], async (req, res, next) => {
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

//! useApproveRoleMutation - approveRole - useRolesApi - APPROVE ROLE
router.post('/approve/:role_id', [validToken, validateRoleManagement, result ], async (req, res, next) => {
    try {
        const { role_id } = req.params
        const management_id = await req.user_decoded

        const new_creator = await db.approveRoleRequest(role_id, management_id)
        
        res.status(200).json(new_creator)
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
    }
})

//! useUpgradeRoleMutation - upgradeRole - useRolesApi - UPGRADE CREATOR TO MANAGER
router.post('/upgrade/:role_id', [validToken, validateRoleManagement, result ], async (req, res, next) => {
    try {
        const { role_id } = req.params
        const management_id = await req.user_decoded
        const new_manager = await db.upgradeCreatorRole(role_id, management_id)
    
        res.status(200).json(new_manager)
        
    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
    }
})

//! useDowngradeRoleMutation - downgradeRole - useRolesApi - DOWNGRADE MANAGER TO CREATOR
router.post('/downgrade/:role_id', [validToken, validateRoleManagement, result ], async (req, res, next) => {
    try {
        const { role_id } = req.params
        const admin_id = await req.user_decoded
        const creator_role = await db.downgradeManagerRole(role_id, admin_id)
    
        res.status(200).json(creator_role)
        
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

router.get('/user/:user_id', [validToken], async (req, res, next) => {
    try {
        const user_id = req.user_decoded

        const user_roles = await db.findUserRoles(user_id)

        res.status(200).json(user_roles)

    } catch (error) {
        
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })

    }
})

// useUserBusinessRoleQuery - getUserBusinessRole - useRoleApi
router.get('/user_role/:business_id', [validToken], async (req, res, next) => {
    try {
        const { business_id } = req.params
        const user_id = req.user_decoded

        const user_role = await db.findUserBusinessRole(business_id, user_id)

        res.status(200).json(user_role)
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