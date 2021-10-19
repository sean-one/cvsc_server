const db = require('../dbConfig');

module.exports = {
    find,
    findByUser,
    addUserRoles,
    getEventRolesByUser
}

function find() {
    return db('roles')
}


function findByUser(userId) {
    return db('roles')
    .where({ user_id: userId })
    .select(
        [
            'business_id',
            'roletype'
        ]
        )
}
    
async function addUserRoles(user_roles) {
    try {
        await db.transaction(async trx => {
            
            // iterate through approved request and insert into roles
            for (let userRequest of user_roles.approved) {
                // insert each request into the roles table
                await db('roles')
                    .transacting(trx)
                    .insert(
                        { 
                            user_id: userRequest.user_id,
                            business_id: userRequest.business_id,
                            roletype: userRequest.roletype
                        }
                    )
                    .into('roles')
                    
                // delete each of the approved request from the pendingrequest table
                await db('pendingRequests').where({ id: userRequest.requestId }).first().del()
            }

            // iterate through rejected request and update the status
            for (let rejectedRequest of user_roles.rejected) {
                await db('pendingRequests').where({ id: rejectedRequest.id }).update({ request_status: 'rejected' })
            }

        })
        return db('roles')
    } catch (error) {
        throw error;
    }
}

// returns an array of business_id(s) for given user id
function getEventRolesByUser(userId) {
    return db('roles')
        .where({ user_id: userId })
        .select(
            [
                db.raw('ARRAY_AGG(roles.business_id) as roles')
            ]
        )
        .groupBy('roles.user_id')
        .first()
}