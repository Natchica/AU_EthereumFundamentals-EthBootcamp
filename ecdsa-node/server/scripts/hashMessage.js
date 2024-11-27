const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

function hashMessage(message) {
    const mBytes = utf8ToBytes(message);
    return keccak256(mBytes);
}

module.exports = hashMessage;