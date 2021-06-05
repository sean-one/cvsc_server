const db = require('../dbConfig');

module.exports = {
    find,
    findByUsername,
    addUser,
    remove
};

function find() {
    return db('users')
}

async function findByUsername(user) {
    return await db('users')
        .where({ username: user.username })
        .first()
        .select(
            [
                'id',
                'username',
                'avatar',
                'role',
                'password'
            ])
}

async function addUser(user) {
    return await db('users').insert(user, [ 'id', 'username', 'avatar', 'role', 'password' ])
}

function remove(id) {
    return db('users').where(id).del();
}