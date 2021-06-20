const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    findBrands,
    findVenues
};

function find() {
    return db('businesses')
}

function findById(id) {
    return db('businesses')
        .where({ id })
        .first();
}

function findBrands() {
    return db('businesses')
        .whereNot({businesstype: 'venue'})
        .select(
            [
                'id',
                'name'
            ]
        )
}

function findVenues() {
    return db('businesses')
        .whereNot({ businesstype: 'brand' })
        .select(
            [
                'id',
                'name'
            ]
        )
}