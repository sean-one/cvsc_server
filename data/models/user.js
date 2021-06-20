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

// this is the function used to login
async function findByUsername(user) {
    return await db('users')
        .where({ username: user.username })
        .innerJoin('roles', 'users.id', '=', 'roles.user_id')
        // .first()
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.password',
                db.raw('ARRAY_AGG(roles.business_id) as roles')
            ])
        .groupBy('users.id', 'users.username')
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