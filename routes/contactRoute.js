const express = require('express');

const db = require('../data/models/contact');
const { validateToken } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', (req, res) => {
    db.find()
        .then(contacts => {
            res.status(200).json(contacts)
        })
        .catch(err => console.log(err))
})

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.findById(id)
        .then(contact => {
            if(contact) {
                res.status(200).json(contact)
            } else {
                res.status(404).json({ message: 'contact not found' })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: 'failure', error: err });
        });
});

router.post('/addUserContact', [ validateToken ], (req, res) => {
    const contact = req.body;
    const userId = req.decodedToken.subject
    db.addInstagram(contact, userId)
        .then(response => {
            
            res.status(200).json(response)
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: 'something not working' })
        })
})

module.exports = router;