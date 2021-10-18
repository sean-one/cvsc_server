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
        // const approvedList = []
        // const rejectedList = []

        // iterate through user roles and find request for each one
        // for (let userRequest of user_roles) {
        //     if (userRequest[1] === 'approved') {
        //         approvedList.push(userRequest[0])
        //     } else if (userRequest[1] === 'rejected') {
        //         rejectedList.push(userRequest[0])
        //     } else {
        //         continue
        //     }
        // }
        // create transaction (tx) so that if there is an error somewhere everything fails or succeeds
        // await db.transaction(async trx => {

        //     // create array for approved and rejected


        // })

        // console.log(approvedList)
        // console.log(rejectedList)
        return db('roles')
    } catch (error) {
        throw error;
    }
    // check if each request is 'approved' or 'rejected'
        // if approved add elements { user_id, business_id, request_for } to roles insert
        // if rejected update request status to rejected 
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