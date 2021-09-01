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
// leftjoin is used to create a array of null in the instance that there are no roles set for the user
async function findByUsername(user) {
    return await db('users')
        .where({ username: user.username })
        .leftJoin('roles', 'users.id', '=', 'roles.user_id')
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.isCreator',
                'users.password',
                db.raw('JSON_AGG(roles.*) as roles')
            ]
        )
        .first()
        .groupBy('users.id')
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