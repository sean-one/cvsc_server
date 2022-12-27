const express = require('express');

const db = require('../data/models/roles');
const dbBusiness = require('../data/models/business');
const roleErrors = require('../error_messages/roleErrors');
const { validToken, roleRequestUser, validateRoleManagement } = require('../helpers/jwt_helper')

const router = express.Router();

// used in rolesApi inside getBusinessRoles - get all roles associated with selected business
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

router.get('/management/pending', [ validToken ], (req, res) => {
    db.findRolesPendingManagement(req.user_decoded)
        .then(roles => {
            res.status(200).json(roles)
        })
        .catch(err => res.status(500).json(err));

})

// creates a new business role request
//! updated endpoint
router.post('/request/:business_id', [ validToken ], async (req, res, next) => {
    try {
        const { business_id } = req.params
    
        const selected_business = await dbBusiness.findById(business_id)
    
        if(!selected_business) return res.sendStatus(404)

        if(!selected_business.business_request_open) throw new Error('business_request_closed')

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

// pendingRequest approval button
//! updated endpoint - needs error handling
router.post('/approve/:role_id', [validToken, validateRoleManagement ], async (req, res, next) => {
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

//! updated endpoint - needs error handling
router.post('/upgrade/:role_id', [validToken, validateRoleManagement ], async (req, res, next) => {
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

//! updated enpoint - needs error handling
router.post('/downgrade/:role_id', [validToken, validateRoleManagement ], async (req, res, next) => {
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

router.delete('/remove/:role_id', [validToken, validateRoleManagement ], async (req, res, next) => {
    try {
        const { role_id } = req.params

        const deleted_role_count = await db.removeRole(role_id)

        res.status(204).json(deleted_role_count)

    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
    }
})

router.delete('/user_remove/:role_id', [validToken, roleRequestUser], async (req, res, next) => {
    try {
        const { role_id } = req.params

        const deleted_role_count = await db.removeRole(role_id)

        res.status(204).json(deleted_role_count)

    } catch (error) {
        next({
            status: roleErrors[error.message]?.status,
            message: roleErrors[error.message]?.message,
            type: roleErrors[error.message]?.type,
        })
        
    }
})

router.get('/', (req, res) => {
    db.find()
        .then(roles => {
            res.status(200).json(roles);
        })
        .catch(err => res.status(500).json(err));
})


module.exports = router;