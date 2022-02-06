const db = require('../dbConfig');

module.exports = {
    find,
    userSignIn,
    registerNewUser,
    updateAvatar,
    remove
};

function find() {
    return db('users')
}

// userroute login
async function userSignIn(user) {
    return await db('users')
        .where({ username: user.username })
        .join('contacts', 'users.contact_id', '=', 'contacts.id')
        .join('roles', 'users.id', '=', 'roles.user_id')
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.password',
                'users.contact_id',
                'contacts.email',
                'contacts.instagram',
                // add facebook for example
                // 'contacts.facebook'
            ]
        )
        .first()
}

async function registerNewUser(user, contact) {
    const newContact = await db('contacts').insert(contact, [ 'id' ])
    
    user['contact_id'] = newContact[0].id

    const newUser = await db('users').insert(user, [ 'id' ])
    
    return db('users')
        // need to put in to a trx so that all or nothing is saved
        .where({ 'users.id': newUser[0].id })
        .join('contacts', 'users.contact_id', '=', 'contacts.id')
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                // 'users.password',
                'users.contact_id',
                'contacts.email',
                'contacts.instagram'
            ]
        )
        .first()
}

async function updateAvatar(userId, avatar) {
    return db('users')
        .where({ 'users.id': userId })
        .update(avatar, [ 'id', 'username', 'avatar', 'contact_id' ])
}

function remove(id) {
    // this needs to remove the contact at the contact_id too
    return db('users').where(id).del();
}