const db = require('../dbConfig');

module.exports = {
    find,
    userSignIn,
    userRegister,
    addUserContact,
    addUserAvatar,
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

async function registerUser(user) {
    try {
        await db.transaction(async trx => {
            // check for contacts
            if(user.contacts) {
                console.log('has contacts')
            }
            // if contacts
                // insert contact into contacts and return id
                // save id to contact field
            // insert new user into users
        })
    } catch (error) {
        throw error;
    }
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

async function addUserAvatar(userId, imgLink) {
    console.log(userId)
    console.log(imgLink)
    return await db('users')
        .where({ id: userId })
        .update({
            avatar: imgLink
        })

}

function remove(id) {
    return db('users').where(id).del();
}