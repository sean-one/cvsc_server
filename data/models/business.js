const db = require('../dbConfig');

module.exports = {
    find,
    findById
};

function find() {
    return db('businesses')
}

function findById(id) {
    return db('businesses')
        .where({ id })
        .first();
}