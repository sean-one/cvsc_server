const db = require('../dbConfig');

module.exports = {
    emailDuplicate,
    find,
    findByEmail,
    findById,
    findByUsername,
    add_google_user,
    search_google_user,
    user_login,
    register_user,
    usernameDuplicate,
    updateAvatar,
    remove
};

function find() {
    return db('users')
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

function findByEmail(email) {
    return db('users')
        .where({ email: email })
        .select(
            [
                'users.id',
                'users.email'
            ]
        )
        .first()
}

async function usernameDuplicate(username) {
    const user = await db('users').where({ username: username }).select([ 'users.id' ]).first()
    if(user === undefined) {
        return false
    } else {
        return true
    } 
}

async function emailDuplicate(email) {
    const user = await db('users').where({ email: email }).select([ 'users.id' ]).first()
    if(user === undefined) {
        return false
    } else {
        return true
    }
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
}

async function add_google_user(user) {
    const google_register = await db('users').insert(user, ['id'])

    console.log(google_register)
    if (google_register == null) {
        throw new Error('insert_error')
    } else {
        return db('users')
            .where({ 'users.id': google_register[0].id })
            .select(
                [
                    'users.id',
                    'users.username',
                    'users.avatar',
                    'users.email',
                ]
            )
            .first()
    }
}

async function search_google_user(google_id) {
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

// login page
async function user_login(username) {
    const found_user = await db('users')
        .where({ username: username })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.password',
                'users.email',
            ]
        )
        .first()
    
    if (found_user == null) {
        throw new Error('user_not_found')
    } else {
        return found_user
    }
}

async function register_user(user) {
    return await db('users').insert(user, [ 'id', 'username', 'avatar', 'email' ])
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