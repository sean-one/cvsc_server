const express = require('express');
const { generateUploadURL } = require('../s3');

const router = express.Router();

router.get('/', async (req, res) => {
    const url = await generateUploadURL()
    res.send({url})
})

module.exports = router;