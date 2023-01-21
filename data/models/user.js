const db = require('../dbConfig');

module.exports = {
    createUser,
    addRefreshToken,
    removeRefreshToken,
    findByRefresh,
    findUserById,
    findByGoogleId,
    findByUsername,
    updateUser,
    removeUser,
};

//! register - createUser
async function createUser(user) {
    return await db('users')
        .insert(user, [
            'id',
            'username',
            'email',
            'avatar',
        ])
}

//! passport-config - serialize user
async function addRefreshToken(id, token) {
    return await db('users')
        .where({ id: id })
        .update({ refreshToken: token })
}

//! authRoute - '/logout'
async function removeRefreshToken(user_id) {
    return await db('users')
        .where({ id: user_id })
        .update({ refreshToken: null })
}

//! authRoute - '/logout' & '/refresh'
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

//! passport-config - deserialize user --- updateUser
async function findUserById(id) {
    const user = await db('users').where({ 'users.id': id }).select(['users.id', 'users.username', 'users.avatar', 'users.email',]).first()
    const account_type = await db('roles').where({ 'roles.user_id': id, 'roles.active_role': true }).select(['roles.business_id', 'roles.role_type']).orderBy('role_type', 'desc')

    if (account_type.length > 0) {
        user.account_type = account_type[0].role_type
    } else {
        user.account_type = process.env.BASIC_ACCOUNT
    }
    
    return { user: user, roles: account_type }
}

//! passport-config - GoogleStrategy
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

//! passport-config - check_user
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

// userRoute - '/users/update_user
async function updateUser(user_id, updates) {
    await db('users').where({ id: user_id }).update(updates)

    return findUserById(user_id)
}

//! userRoute - '/users/remove/:user_id'
function removeUser(user_id) {
    // this needs to remove the contact at the contact_id too
    return db('users').where({ id: user_id }).del();
}