const db = require('../dbConfig');

module.exports = {
    find,
    findById
};

function find() {
    return db('locations')
}

function findById(id) {
    return db('locations')
        .where({ id })
        .select([ 'id', 'street_address', 'location_city', 'location_state', 'zip_code' ])
        .first()
}