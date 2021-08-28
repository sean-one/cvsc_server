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

// this is the function used to login
async function findByUsername(user) {
    return await db('users')
        .where({ username: user.username })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.isAdmin',
                'users.password'
            ]
        )
        .first()
}

async function addUser(user) {
    return await db('users')
        .insert(
            user,
            [
                'id',
                'username',
                'avatar',
                'isAdmin',
                'password'
            ]
        )
}

function remove(id) {
    return db('users').where(id).del();
}