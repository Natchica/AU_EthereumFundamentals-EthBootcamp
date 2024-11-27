const secp = require("ethereum-cryptography/secp256k1");
const hashMessage = require("./hashMessage");

function recoverKey(message, signature) {
    return secp.recoverPublicKey(hashMessage(message), signature);
}

module.exports = recoverKey;