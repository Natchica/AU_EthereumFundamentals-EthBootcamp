const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

const getAddress = require("./scripts/getAddress");
const hashMessage = require("./scripts/hashMessage");
const recoverPublicKey = require("./scripts/recoverKey");

app.use(cors());
app.use(express.json());

const balances = {
  "144caf0aae8b0e5cd2aa34af0e285a9182f31f83": 100,
  "555507be5c5e077ab206e37ac0691acafddc9f27": 50,
  "ae74d65f0a27f71c4fe8d5bba7437104ff7bab38": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    const isValidSignature = verifySignature(sender, signature);
    if (isValidSignature) {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    } else {
      res.status(400).send({ message: "Invalid signature!" });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function verifySignature(sender, signature) {
  try {
    const messageHash = hashMessage(message);
    const publicKey = recoverPublicKey(messageHash, signature, 0);
    const address = getAddress(publicKey);
    return toHex(address) === sender;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}