const db = require('../dbConfig');

module.exports = {
    find,
    findByUser
}

function find() {
    return db('roles')
}

// returns an array of business_id(s) for given user id
function findByUser(userId) {
    return db('roles')
        .where({ user_id: userId })
        .select(
            [
                'business_id',
                'roletype'
                // db.raw('ARRAY_AGG(roles.business_id) as roles')
            ]
        )
        // .groupBy('roles.user_id')
        // .first()
}