const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

function getAddress(publicKey) {
    const rest_pk = publicKey.slice(1);
    const keccak_hash_rest_pk = keccak256(rest_pk);
    
    return keccak_hash_rest_pk.slice(keccak_hash_rest_pk.length-20);
}

module.exports = getAddress;