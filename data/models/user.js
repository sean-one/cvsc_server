const db = require('../dbConfig');

module.exports = {
    find,
    userSignIn,
    registerNewUser,
    userRegister,
    addUserContact,
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

async function userRegister(user) {
    return await db('users')
        .insert(
            user,
            [
                'id',
                'username',
                'avatar',
                'password',
                'email',
                'contact_id'
            ]
        )
}

async function addUserContact(contact) {
    return await db('contacts')
        .insert(
            contact,
            [
                'id'
            ]
        )
}

function remove(id) {
    return db('users').where(id).del();
}