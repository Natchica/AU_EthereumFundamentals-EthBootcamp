require('dotenv').config();
const axios = require('axios');

const AU_API_KEY = process.env.API_KEY;

axios.post(AU_API_KEY, {
    "id": 1,
    "jsonrpc": "2.0",
    "params": [
      "0xb86120f0eDc5F32E6D2151d6FC4FCb3c0c2f537D",
      "latest"
    ],
    "method": "eth_getBalance"
}).then((response) => {
  console.log(response.data.result);
}).catch((error) => {
  console.error(error);
});