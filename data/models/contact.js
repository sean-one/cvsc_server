const db = require('../dbConfig')

module.exports = {
    find,
    findById,
    addInstagram
}

function find() {
    return db('contacts')
}

function findById(contact_id) {
    return db('contacts')
        .where({ id: contact_id })
        .select(
            [
                'id',
                'instagram',
                'facebook',
                'website'
            ]
        )
        .first()
}

async function addInstagram(contact, userId) {
    try {
        await db.transaction(async trx => {
            
            // create the contact and return the contact id
            const contactId = await db('contacts')
                .insert(contact, [ 'id' ])

            // add contact id to the contact_id of the user
            await db('users')
                .transacting(trx)
                .where({ id: userId })
                .update({ contact_id: contactId[0].id })
        })
        // return the user with the updated contact_id
        return await db('users')
            .where({ id: userId })
            .select(
                [
                    'id',
                    'username',
                    'email',
                    'avatar',
                    'contact_id'
                ]
            )
            .first()

    } catch (error) {
        throw error;
    }
}