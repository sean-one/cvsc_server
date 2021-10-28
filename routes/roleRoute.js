const express = require('express');

const db = require('../data/models/roles');
const { validateToken, validateAdmin, validateAdminRoleDelete } = require('../helpers/jwt_helper')

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(roles => {
            res.status(200).json(roles);
        })
        .catch(err => res.status(500).json(err));
})

// returns an array of business_id(s) for given user id
router.get('/user/:id', (req, res) => {
    const { id } = req.params
    db.findByUser(id)
        .then(userevents => {
            res.status(200).json(userevents);
        })
        .catch(err => res.status(500).json(err));
})

router.post('/editUserRoles', [ validateToken, validateAdmin ], (req, res) => {
    const user_roles = req.body;
    const userId = req.decodedToken.subject;
    // res.status(200).json({ message: 'hitter' })
    db.addUserRoles(user_roles, userId)
        .then(response => {
            console.log(response)
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

router.post('/byBusinesses', (req, res) => {
    const business_ids = req.body;
    db.findRolesByBusinessIds(business_ids)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

router.delete('/deleteUserRoles', [ validateToken, validateAdminRoleDelete ], async (req, res) => {
    db.removeRoles(req.body.roleIds)
        .then(response => {
            res.status(200).json(response)
        })
        .catch(err => console.log(err))
})

module.exports = router;