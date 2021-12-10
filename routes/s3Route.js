const express = require('express');
const { generateUploadURL } = require('../s3');
const { validateToken } = require('../helpers/jwt_helper');

const router = express.Router();

router.get('/', [ validateToken ], async (req, res) => {
    const url = await generateUploadURL()
    res.send({url})
})

module.exports = router;