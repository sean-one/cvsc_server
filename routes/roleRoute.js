const express = require('express');

const db = require('../data/models/roles');
const roleErrors = require('../error_messages/roleErrors');
const { validateUser, validateToken, validateRequestRights } = require('../helpers/jwt_helper')

const router = express.Router();

// used on /profile page inside getroles
router.get('/user/:id', [ validateToken, validateUser ], (req, res) => {
    const { user_id } = req.decodedToken
    db.findByUser(user_id)
        .then(userevents => {
            // [ { business_id: uuid, role_type: 'admin' }, { business_id: uuid, role_type: 'creator' } ]
            res.status(200).json(userevents);
        })
        .catch(err => res.status(500).json(err));
})

// add role request via the creatorRequestForm
router.post('/create-request', [ validateToken ], async (req, res, next) => {
    try {
        const { user_id } = req.decodedToken
        const { business_id } = req.body
        
        if (!business_id) {
            throw new Error('missing_input')
        }
        const result = await db.createRequest(business_id, user_id)

        res.status(200).json(result)

    } catch (error) {
        
        if (error.constraint) {
            next({ status: roleErrors[error.constraint]?.status, message: roleErrors[error.constraint]?.message })

        } else {
            next({ status: roleErrors[error.message]?.status, message: roleErrors[error.message]?.message })

        }
    }
})

// get an array of pending request based on business admin & manager rights
router.get('/pending-request', [ validateToken ], async (req, res) => {
    try {
        const { user_id } = req.decodedToken
        const results = await db.getPendingRequest(user_id)

        if(results) {
            res.status(200).json(results)
        } else {
            throw new Error('server_error')
        }
        
    } catch (error) {
        
        next(error)
    }
})

// pendingRequest approval button
router.post('/approve/:id', [ validateToken, validateRequestRights ], (req, res, next) => {
    try {
        const { user_id } = req.decodedToken
        if(req.validated === true) {
            db.approveRoleRequest(req.request_id, user_id)
                .then(response => {
                    res.status(200).json(response)
                })
                .catch(err => console.log(err))
        } else {
            throw new Error('not_validated')
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
})

// pendingRequest reject button
router.delete('/reject/:id', [ validateToken, validateRequestRights ], (req, res, next) => {
    try {
        if(req.validated) {
            db.rejectRequest(req.request_id)
                .then(response => {
                    res.status(204).json(response)
                })
                .catch(err => console.log(err))
        } else {
            
            throw new Error('not_validated')
        }
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