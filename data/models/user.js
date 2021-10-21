const db = require('../dbConfig');

module.exports = {
    find,
    findByUsername,
    addUser,
    remove
};

function find() {
    return db('users')
}

// async function findByUsername(user) {
//     return await db('users')
//         .where({ username: user.username })
//         .leftJoin('roles', 'users.id', '=', 'roles.user_id')
//         .select(
//             [
//                 'users.id',
//                 'users.username',
//                 'users.avatar',
//                 'users.password',
//                 db.raw('ARRAY_AGG(roles.business_id) as business_roles')
//             ]
//         )
//         .first()
//         .groupBy('users.id')
// }

async function findByUsername(user) {
    return await db('users')
        .where({ username: user.username })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.password',
            ]
        )
        .first()
}

async function addUser(user) {
    return await db('users')
        .insert(
            user,
            [
                'id',
                'username',
                'avatar',
                'password'
            ]
        )
}

function remove(id) {
    return db('users').where(id).del();
}