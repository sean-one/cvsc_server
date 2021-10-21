const db = require('../dbConfig');

module.exports = {
    find,
    userSignIn,
    userRegister,
    remove
};

function find() {
    return db('users')
}

async function userSignIn(user) {
    return await db('users')
        .where({ username: user.username })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.password',
            ]
        )
        .first()
}

async function userRegister(user) {
    return await db('users')
        .insert(
            user,
            [
                'id',
                'username',
                'avatar',
                'password'
            ]
        )
}

function remove(id) {
    return db('users').where(id).del();
}