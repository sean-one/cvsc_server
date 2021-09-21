const express = require('express');

const db = require('../data/models/userRoleRequest');

const { validateToken } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(requests => {
            res.status(200).json(requests);
        })
        .catch(err => res.status(500).json(err));
})

router.post('/', [ validateToken ], async (req, res) => {
    const requestInfo = req.body
    requestInfo.user_id = req.decodedToken.subject
    if(!requestInfo.user_id || !requestInfo.business_id || !requestInfo.user_rights) {
        res.status(400).json({ message: 'please be sure to be signed in and fill all required inputs'})
    }
    try {
        const newRequest = await db.addRequest(requestInfo)
        res.status(200).json(newRequest[0])
    } catch (error) {
        if(error.constraint === 'userrolerequests_user_id_business_id_unique') {
            console.log('inside the error constraint')
            res.status(400).json({ message: 'duplicate request', type: 'duplicate' })
        } else {
            console.log('default error')
            res.status(400).json(error)
        }
    }
})

module.exports = router;