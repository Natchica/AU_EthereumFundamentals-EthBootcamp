const axios = require('axios');

// get the content of the alchemy_url.txt file
const ALCHEMY_URL = fs.readFileSync('../alchemy_url.txt', 'utf8').trim();

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