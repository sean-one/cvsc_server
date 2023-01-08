const db = require('../dbConfig');

module.exports = {
    find,
    createUser,
    addRefreshToken,
    removeRefreshToken,
    findByRefresh,
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

async function removeRefreshToken(user_id) {
    return await db('users')
        .where({ id: user_id })
        .update({ refreshToken: null })
}

async function findByRefresh(token) {
    return await db('users')
        .where({ refreshToken: token })
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

async function findById(id) {
    const user = await db('users').where({ 'users.id': id }).select(['users.id', 'users.username', 'users.avatar', 'users.email',]).first()
    const account_type = await db('roles').where({ 'roles.user_id': id, 'roles.active_role': true }).select(['roles.business_id', 'roles.role_type']).orderBy('role_type', 'desc')

    if (account_type.length > 0) {
        user.account_type = account_type[0].role_type
    } else {
        user.account_type = process.env.BASIC_ACCOUNT
    }
    
    return { user: user, roles: account_type }
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