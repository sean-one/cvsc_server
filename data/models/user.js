const db = require('../dbConfig');

module.exports = {
    find,
    createUser,
    addRefreshToken,
    findById,
    findByGoogleId,
    findByUsername,
    updateAvatar,
    remove
};

function find() {
    return db('users')
}

async function createUser(user) {
    return await db('users')
        .insert(user, [
            'id',
            'username',
            'email',
            'avatar',
        ])
}

async function addRefreshToken(id, token) {
    return await db('users')
        .where({ id: id })
        .update({ refreshToken: token })
}

function findById(id) {
    return db('users')
        .where({ id: id })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.email'
            ]
        )
        .first()
}

async function findByGoogleId(google_id) {
    return await db('users')
        .where({ google_id: google_id })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.email'
            ]
        )
}

function findByUsername(username) {
    return db('users')
        .where({ username: username })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.email',
                'users.password'
            ]
        )
        .first()
}

async function updateAvatar(userId, avatar) {
    return db('users')
        .where({ 'users.id': userId })
        .update(avatar, [ 'id', 'username', 'avatar' ])
}

function remove(id) {
    // this needs to remove the contact at the contact_id too
    return db('users').where(id).del();
}