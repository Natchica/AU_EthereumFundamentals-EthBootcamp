const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

function generateKeyPair() {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey);
    const address = keccak256(publicKey.slice(1)).slice(-20);

    return {
        privateKey: toHex(privateKey),
        publicKey: toHex(publicKey),
        address: toHex(address)
    };
}

function generateSignature(privateKey, amount, recipient) {
    const message = JSON.stringify({
        amount: parseInt(amount),
        recipient,
    });
    
    const messageHash = keccak256(utf8ToBytes(message));
    
    const signature = secp256k1.sign(messageHash, privateKey);
    
    return {
        signature: signature.toCompactHex(),
    };
}

function verifySignature(message, signature, publicKey) {
    const messageHash = keccak256(utf8ToBytes(message));
    return secp256k1.verify(signature, messageHash, publicKey);
}

function printHelp() {
    console.log("Usage:");
    console.log("  To generate a new key pair:");
    console.log("    node exemple.js generate");
    console.log("  To generate a signature:");
    console.log("    node exemple.js sign <privateKey> <amount> <recipient>");
    console.log("  To verify a signature:");
    console.log("    node exemple.js verify <message> <signature> <publicKey>");
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === "help") {
        printHelp();
        return;
    }

    if (args[0] === "generate") {
        const keyPair = generateKeyPair();
        console.log("Generated Key Pair:");
        console.log(JSON.stringify(keyPair, null, 2));
    } else if (args[0] === "sign") {
        if (args.length !== 4) {
            console.log("Error: Incorrect number of arguments for signing.");
            printHelp();
            return;
        }
        const [, privateKey, amount, recipient] = args;
        const signatureData = generateSignature(privateKey, amount, recipient);
        console.log("Generated Signature:");
        console.log(JSON.stringify(signatureData, null, 2));
    } else if (args[0] === "verify") {
        if (args.length !== 4) {
            console.log("Error: Incorrect number of arguments for verification.");
            printHelp();
            return;
        }
        const [, message, signature, publicKey] = args;
        const isValid = verifySignature(message, hexToBytes(signature), hexToBytes(publicKey));
        console.log("Signature is", isValid ? "valid" : "invalid");
    } else {
        console.log("Error: Unknown command.");
        printHelp();
    }
}

main().catch(console.error);