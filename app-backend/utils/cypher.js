const crypto = require('crypto');
const algorithm = 'aes256';

function encrypt(plainText, salt) {
    const cipher = crypto.createCipher(algorithm, salt);
    return cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(cypherText, salt) {
    const decipher = crypto.createDecipher(algorithm, salt);
    return decipher.update(cypherText, 'hex', 'utf8') + decipher.final('utf8');
}

module.exports = {encrypt, decrypt};
