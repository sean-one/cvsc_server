const normalizeEmail = (email) => {
    const [localPart, domainPart] = email.split('@');

    // check domain for google
    if (domainPart.toLowerCase() === 'gmail.com' || domainPart.toLowerCase() === 'googlemail.com') {
        // remove all the dots in the email
        const normalizedLocalPart = localPart.split('.').join('');
        return `${normalizedLocalPart}@gmail.com`;
    }

    // return the email unchaged if not gmail address
    return email
}

module.exports = {
    normalizeEmail
};