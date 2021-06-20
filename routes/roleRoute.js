const express = require('express');

const db = require('../data/models/roles');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(roles => {
            res.status(200).json(roles);
        })
        .catch(err => res.status(500).json(err));
})

// returns an array of business_id(s) for given user id
// router.get('/user/:id', (req, res) => {
//     const { id } = req.params
//     db.findByUser(id)
//         .then(userevents => {
//             res.status(200).json(userevents);
//         })
//         .catch(err => res.status(500).json(err));
// })

module.exports = router;