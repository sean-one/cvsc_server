const express = require('express');

const db = require('../data/models/roles');
const { validateUser, validateToken, validateBusinessAdminRights } = require('../helpers/jwt_helper')

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(roles => {
            res.status(200).json(roles);
        })
        .catch(err => res.status(500).json(err));
})

// returns an array of business_id(s) for given user id
router.get('/user/:id', [ validateToken, validateUser ], (req, res) => {
    const userId = req.decodedToken.subject
    db.findByUser(userId)
        .then(userevents => {
            res.status(200).json(userevents);
        })
        .catch(err => res.status(500).json(err));
})

// add role request via the creatorRequestForm
router.post('/create-request', [ validateToken ], (req, res) => {
    const user_id = req.decodedToken.subject
    const new_request = req.body
    if (!new_request.business_id || !new_request.request_for) {
        res.status(400).json({ message: 'missing input', type: 'missing input' })
    } else {
        db.createRequest(new_request, user_id)
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
    const user_id = req.decodedToken.subject
    db.getPendingRequest(user_id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// from pendingRequest inside business admin options approval
router.post('/approve/:id', [ validateToken ], (req, res) => {
    const admin_id = req.decodedToken.subject
    const requestId = req.params.id
    db.approveRoleRequest(requestId, admin_id)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// inside PendingRequest sendRequestStatus function to confirm or delete role request
router.post('/update-request', [ validateToken, validateBusinessAdminRights ], (req, res) => {
    const admin_id = req.decodedToken.subject
    const { approved_ids, rejected_ids } = req.validatedRoles
    db.updateRolesByBusinessAdmin(approved_ids, rejected_ids, admin_id)
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