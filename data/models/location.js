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
        .first()
        // .select([ 'id', 'city' ])
}