const express = require('express');
const db = require('../data/models/businessTags');

const businessTagErrors = require('../error_messages/businessTagErrors');

// /business-tags
const router = express.Router()

router.get('/:business_id', async (req, res, next) => {
    try {
        const { business_id } = req.params;
        const businessTags = await db.getBusinessTagsByBusiness(business_id)

        res.status(200).json(businessTags)
    } catch (error) {
        next({
            status: businessTagErrors[error.message]?.status,
            message: businessTagErrors[error.message]?.message,
            type: businessTagErrors[error.message]?.type,
        })
    }
});

module.exports = router;