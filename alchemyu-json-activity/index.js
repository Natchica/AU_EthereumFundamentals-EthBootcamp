const axios = require('axios');

// copy-paste your URL provided in your Alchemy.com dashboard
const ALCHEMY_URL = "https://eth-sepolia.g.alchemy.com/v2/RwyA9iW1RdnTreySdGx7hTUescnfXlqn";

axios.post(ALCHEMY_URL, {
    "id": 1,
    "jsonrpc": "2.0",
    "params": [
      "0xb86120f0eDc5F32E6D2151d6FC4FCb3c0c2f537D",
      "latest"
    ],
    "method": "eth_getBalance"
}).then((response) => {
  console.log(response.data.result);
});