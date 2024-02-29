

const getAccountType = (accountNumber) => {
    switch (accountNumber) {
        case process.env.CREATOR_ACCOUNT:
            return 'creator';
        case process.env.MANAGER_ACCOUNT:
            return 'manager';
        case process.env.ADMIN_ACCOUNT:
            return 'admin';
        default:
            return 'basic'
    }
}

module.exports = getAccountType;