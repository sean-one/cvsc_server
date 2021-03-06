const express = require('express');

const db = require('../data/models/roles');
const roleErrors = require('../error_messages/roleErrors');
const { validateUser, validateToken, validateManagmentRole, validateAdminRole } = require('../helpers/jwt_helper')

const router = express.Router();

// used on /profile page inside getroles
// router.get('/user/:id', [ validateToken, validateUser ], (req, res) => {
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

// add role request via the creatorRequestForm
router.post('/create-request', async (req, res, next) => {
    try {
        const { business_id } = req.body
        
        if (!business_id) {
            throw new Error('missing_input')
        }
        const result = await db.createRequest(business_id, req.user.id)

        res.status(200).json(result)

    } catch (error) {
        
        if (error.constraint) {
            next({
                status: roleErrors[error.constraint]?.status,
                message: roleErrors[error.constraint]?.message,
                type: roleErrors[error.constraint]?.type
            })

        } else {
            next({ 
                status: roleErrors[error.message]?.status,
                message: roleErrors[error.message]?.message,
                type: roleErrors[error.message]?.type
            })

        }
    }
})

// pendingRequest approval button
router.post('/approve_pending/:role_id', [ validateManagmentRole ], async (req, res, next) => {
    const management_id = await req.user.id
    const new_creator = await db.approveRoleRequest(req.params.role_id, management_id)
    
    res.status(200).json(new_creator)
})

router.post('/upgrade_creator/:role_id', [ validateManagmentRole], async (req, res, next) => {
    const management_id = await req.user.id
    const new_manager = await db.upgradeCreatorRole(req.params.role_id, management_id)

    res.status(200).json(new_manager)
})

router.post('/downgrade_manager/:role_id', [ validateAdminRole ], async (req, res, next) => {
    const admin_id = await req.user.id
    const creator_role = await db.downgradeManagerRole(req.params.role_id, admin_id)

    res.status(200).json(creator_role)
})

// pendingRequest reject button
router.delete('/user_remove/:role_id', [ validateManagmentRole ], async (req, res, next) => {
    try {
        const deleted_count = await db.removeUserRole(req.params.role_id)
        
        res.status(200).json(deleted_count)
    } catch (error) {
        next(error)
    }
})

router.delete('/manager_remove/:role_id', [ validateAdminRole ], async (req, res, next) => {
    try {
        const deleted_count = await db.removeUserRole(req.params.role_id)
        
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