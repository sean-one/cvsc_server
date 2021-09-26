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

async function findByUsername(user) {
    return await db('users')
        .where({ username: user.username })
        // .join('roles', 'users.id', '=', 'roles.user_id')
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.isCreator',
                'users.password',
                // db.raw('JSON_OBJECT_AGG(roles.business_id, roles.roletype) as roles')
            ]
        )
        // .groupBy('users.id')
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
                'isCreator',
                'password'
            ]
        )
}

function remove(id) {
    return db('users').where(id).del();
}