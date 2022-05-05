const db = require('../dbConfig');

module.exports = {
    find,
    user_login,
    register_user,
    updateAvatar,
    remove
};

function find() {
    return db('users')
}

// login page
async function user_login(username) {
    return await db('users')
        .where({ username: username })
        .leftJoin('contacts', 'users.contact_id', '=', 'contacts.id')
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.password',
                'users.contact_id',
                'users.account_type',
                'contacts.email',
                'contacts.instagram',
            ]
        )
        .first()
}

async function register_user(user, contact) {
    const user_contact = await db('contacts').insert(contact, [ 'id' ])
    
    user['contact_id'] = user_contact[0].id

    const new_user = await db('users').insert(user, [ 'id' ])
    
    return db('users')
        // need to put in to a trx so that all or nothing is saved
        .where({ 'users.id': new_user[0].id })
        .join('contacts', 'users.contact_id', '=', 'contacts.id')
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.contact_id',
                'users.account_type',
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