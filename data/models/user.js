const db = require('../dbConfig');

module.exports = {
    find,
    userSignIn,
    userRegister,
    addUserAvatar,
    remove
};

function find() {
    return db('users')
}

async function userSignIn(user) {
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

async function userRegister(user) {
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