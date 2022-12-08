const express = require('express');

const db = require('../data/models/roles');
const dbBusiness = require('../data/models/business');
const roleErrors = require('../error_messages/roleErrors');
const { validToken, validateManager, validateAdmin } = require('../helpers/jwt_helper')

const router = express.Router();

// used on /profile page inside getroles
router.get('/user/:id', (req, res) => {
    // const { user_id } = req.decodedToken
    db.findByUser_All(req.user.id)
        .then(user_roles => {
            // [ { business_id: uuid, role_type: 'admin' }, { business_id: uuid, role_type: 'creator' } ]
            res.status(200).json(user_roles);
        })
        .catch(err => res.status(500).json(err));
})

router.get('/business/:business_id', (req, res) => {
    const { business_id } = req.params
    db.findByBusiness(business_id)
        .then(roles => {
            res.status(200).json(roles);
        })
        .catch(err => res.status(500).json(err));
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
router.post('/approve_request/:role_id', [ validToken, validateManager ], async (req, res, next) => {
    const management_id = await req.user_decoded
    const new_creator = await db.approveRoleRequest(req.params.role_id, management_id)
    
    res.status(200).json(new_creator)
})

// upgradeButton - upgrades creator to manager
//! updated endpoint - needs error handling
router.post('/upgrade_creator/:role_id', [ validToken, validateManager ], async (req, res, next) => {
    const management_id = await req.user_decoded
    const new_manager = await db.upgradeCreatorRole(req.params.role_id, management_id)

    res.status(200).json(new_manager)
})

// downgradeButton - downgrades manager to creator
//! updated enpoint - needs error handling
router.post('/downgrade_manager/:role_id', [ validToken, validateAdmin ], async (req, res, next) => {
    const admin_id = await req.user_decoded
    const creator_role = await db.downgradeManagerRole(req.params.role_id, admin_id)

    res.status(200).json(creator_role)
})

// pendingRequest reject button & creator role delete
//! updated endpoint - needs error handling
router.delete('/user_remove/:role_id', [ validToken, validateManager ], async (req, res, next) => {
    try {
        const deleted_count = await db.removeUserRole(req.params.role_id)
        
        res.status(200).json(deleted_count)
    } catch (error) {
        next(error)
    }
})

// removeRoleButton - removes manager role
//! updated endpoint - needs error handling
router.delete('/manager_remove/:role_id', [ validToken, validateAdmin ], async (req, res, next) => {
    try {
        const { role_id } = req.params
        const deleted_count = await db.removeUserRole(role_id)
        
        res.status(200).json(deleted_count)
    } catch (error) {
        next(error)
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