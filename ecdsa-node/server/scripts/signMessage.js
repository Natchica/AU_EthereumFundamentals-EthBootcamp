const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

function signMessage(message, privateKey) {
  const messageHash = keccak256(utf8ToBytes(message));
  return secp256k1.sign(messageHash, privateKey);
}

module.exports = signMessage;