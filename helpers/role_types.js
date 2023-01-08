
const role_types = {
    [process.env.BASIC_ACCOUNT]: 'basic',
    [process.env.CREATOR_ACCOUNT]: 'creator',
    [process.env.MANAGER_ACCOUNT]: 'manager',
    [process.env.ADMIN_ACCOUNT]: 'admin'
}

module.exports = {
    role_types
};