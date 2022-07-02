const db = require('../dbConfig');

module.exports = {
    find,
    findById,
    add_google_user,
    search_google_user,
    user_login,
    register_user,
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
    const new_user = await db('users').insert(user, [ 'id' ])
    
    if(new_user == null) {
        throw new Error('insert_error')
    } else {
        return db('users')
            .where({ 'users.id': new_user[0].id })
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

async function updateAvatar(userId, avatar) {
    return db('users')
        .where({ 'users.id': userId })
        .update(avatar, [ 'id', 'username', 'avatar' ])
}

function remove(id) {
    // this needs to remove the contact at the contact_id too
    return db('users').where(id).del();
}