const { secp256k1 } = require("ethereum-cryptography/secp256k1");

function generatePvKey() {
    return secp256k1.utils.randomPrivateKey();
}

module.exports = generatePvKey;