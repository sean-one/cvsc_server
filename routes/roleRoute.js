const express = require('express');

const db = require('../data/models/roles');
const { validateUser, validateToken, validateBusinessAdminRights } = require('../helpers/jwt_helper')

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





router.get('/', (req, res) => {
    db.find()
        .then(roles => {
            res.status(200).json(roles);
        })
        .catch(err => res.status(500).json(err));
})

// add role request via the creatorRequestForm
router.post('/create-request', [ validateToken ], (req, res) => {
    const { user_id } = req.decodedToken
    const { business_id } = req.body
    if (!business_id) {
        res.status(400).json({ message: 'missing input', type: 'missing input' })
    } else {
        db.createRequest(business_id, user_id)
            .then(response => {
                res.status(200).json(response)
            })
            .catch(err => {
                if (err.constraint === 'roles_user_id_business_id_unique') {
                    res.status(400).json({ message: 'duplicate request', type: 'duplicate' })
                } else {
                    res.status(400).json(err)
                }
            })
    }
})

// get an array of pending request based on business admin rights
router.get('/pending-request', [ validateToken ], (req, res) => {
    const { user_id } = req.decodedToken
    db.getPendingRequest(user_id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// from pendingRequest inside business admin options approval
router.post('/approve/:id', [ validateToken ], (req, res) => {
    const { user_id } = req.decodedToken
    const requestId = req.params.id
    db.approveRoleRequest(requestId, user_id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// inside PendingRequest sendRequestStatus function to confirm or delete role request
router.post('/update-request', [ validateToken, validateBusinessAdminRights ], (req, res) => {
    const { user_id } = req.decodedToken
    const { approved_ids, rejected_ids } = req.validatedRoles
    db.updateRolesByBusinessAdmin(approved_ids, rejected_ids, user_id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// from pendingRequest inside business admin options reject
router.delete('/reject-request/:id', [ validateToken ], (req, res) => {
    const request_id = req.params.id
    db.rejectRequest(request_id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})
module.exports = router;