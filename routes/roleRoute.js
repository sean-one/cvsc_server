const express = require('express');

const db = require('../data/models/roles');
const { validateRoles, validateUser, validateToken, validateBusinessAdmin } = require('../helpers/jwt_helper')
const { updateRole } = require('../helpers/dataClean')

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
router.post('/request', [ validateToken ], (req, res) => {
    const user_id = req.decodedToken.subject
    const new_request = req.body
    if (!new_request.business_id || !new_request.request_for) {
        res.status(400).json({ message: 'missing input', type: 'missing input' })
    } else {
        db.addRequest(new_request, user_id)
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

// gets the pending request for the PendingRequest component
router.get('/pending-request', [ validateToken, validateRoles ], (req, res) => {
    const business_ids = req.roles
    db.getPendingRolesByBusiness(business_ids)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))

})

// inside PendingRequest sendRequestStatus function to confirm or delete role request
router.post('/update-request', [ validateToken, validateRoles ], (req, res) => {
    const cleanData = updateRole(req.body)
    const userId = req.decodedToken.subject
    const userRoles = req.roles
    db.updateRoleRequest(cleanData, userId, userRoles)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// inside EditRoles component -- returns a list of current roles for business admin
router.get('/current-roles', [ validateToken ], (req, res) => {
    const userId = req.decodedToken.subject
    db.getRolesByBusinessAdmin(userId)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

// inside EditRoles component -- deletes an array of current roles for business admin
router.delete('/delete-roles', [ validateToken, validateBusinessAdmin ], (req, res) => {
    const toDelete = req.toDelete.map(role => parseInt(role))
    db.deleteRoles(toDelete)
        .then(response => {
            res.status(204).json(response)
        })
        .catch(err => console.log(err))
})

module.exports = router;