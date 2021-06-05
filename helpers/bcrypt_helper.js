const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALTROUNDS));
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword)
    return hashedPassword;
}

const comparePassword = async (password, hash) => {
    const isMatch = await bcrypt.compare(password, hash);
    
    if (isMatch) {
        return true
    } else {
        return false
    }
}

module.exports = {
    hashPassword,
    comparePassword
};