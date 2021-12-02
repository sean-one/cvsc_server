const db = require('../dbConfig')

module.exports = {
    find,
    findById,
    addContact,
    updateContact
}

function find() {
    return db('contacts')
}

function findById(contact_id) {
    return db('contacts')
        .where({ id: contact_id })
        .select(
            [
                'instagram',
                'facebook'
            ]
        )
        .first()
}

async function addContact(contact, userId) {
    try {
        return await db.transaction(async trx => {

            // get user object
            const user = await db('users')
                .transacting(trx)
                .where({ id: userId })

            if(user[0].contact_id === null) {
                // create the contact and return the contact id
                const contactId = await db('contacts')
                    .transacting(trx)
                    .insert(contact, [ 'id', 'instagram', 'facebook' ])

                // add contact id to the contact_id of the user
                await db('users')
                    .transacting(trx)
                    .where({ id: userId })
                    .update({ contact_id: contactId[0].id })
                
                // delete contactId[0]['id']
                // return contactId[0];
            } else {
                // this needs to return something else
                await db('contacts')
                    .transacting(trx)
                    .where({ id: user[0].contact_id })
                    .update(contact, [ 'instagram', 'facebook'])
                
                // return newContact[0]
            }
            // return contactId;
            // return the user with the updated contact_id
            return await db('users')
                .where({ 'users.id': userId })
                // .join('contacts', 'users.contact_id', '=', 'contacts.id')
                .select(
                    [
                        'users.id',
                        'users.username',
                        'users.email',
                        'users.avatar',
                        'users.contact_id',
                        // 'contacts.instagram',
                        // 'contacts.facebook'
                    ]
                )
                // .first()
        })
    } catch (error) {
        throw error;
    }
}

async function updateContact(contact, userId) {
    const user_contact_id = await db('users')
        .where({ id: userId})
        .select(['contact_id'])
        .first()

    // console.log(user_contact_id.contact_id)
    return await db('contacts')
        .where({ id: user_contact_id.contact_id })
        .update(contact, [ 'email', 'instagram' ])
        // add facebook example
        // .update(contact, [ 'email', 'instagram', 'facebook' ])
}

// async function updateContact(contact, userId) {
//     try {
//         return await db.transaction(async trx => {
//             // get user object
//             const user = await db('users')
//                 .transacting(trx)
//                 .where({ id: userId })
            
//             return await db('contacts')
//                 .transacting(trx)
//                 .where({ id: user[0].contact_id })
//                 .update(contact, [ 'instagram', 'facebook' ])
//         })
//     } catch (error) {
//         throw error;
//     }
// }