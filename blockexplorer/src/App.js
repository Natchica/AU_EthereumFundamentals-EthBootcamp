import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const alchemy = new Alchemy(settings);
const tokenCache = new Map();

async function getTokenMetadata(tokenAddress) {
  if (tokenCache.has(tokenAddress)) {
    return tokenCache.get(tokenAddress);
  }

  try {
    const metadata = await alchemy.core.getTokenMetadata(tokenAddress);
    tokenCache.set(tokenAddress, metadata);
    return metadata;
  } catch (error) {
    console.error(`Error fetching token metadata for ${tokenAddress}:`, error);
    return null;
  }
}

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockCount, setBlockCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchedBlock, setSearchedBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to process transfer logs (same as before)
  async function processTransferLogs(receipt) {
    const transfers = [];

      for (const log of receipt.logs) {
        // Check if this log is a Transfer event
        if (log.topics[0] === TRANSFER_EVENT_TOPIC && log.topics.length >= 3) {
          const tokenAddress = log.address;
          const tokenMetadata = await getTokenMetadata(tokenAddress);

          if (tokenMetadata) {
            // Decode the transfer event data
            const from = '0x' + log.topics[1].slice(26);
            const to = '0x' + log.topics[2].slice(26);
            const value = log.data === '0x' ? '0' : 
              Utils.formatUnits(log.data, tokenMetadata.decimals);

            transfers.push({
              token: tokenMetadata.symbol,
              tokenAddress,
              from,
              to,
              value,
              decimals: tokenMetadata.decimals
            });
          }
        }
      }

      return transfers;
    }

  // Function to fetch transaction details (same as before)
  async function fetchTransactionDetails(txHash) {
    try {
      const tx = await alchemy.core.getTransaction(txHash);
      const receipt = await alchemy.core.getTransactionReceipt(txHash);
      
      // Process ERC20 transfers
      const tokenTransfers = await processTransferLogs(receipt);

      return {
        hash: txHash,
        from: tx.from,
        to: tx.to,
        value: Utils.formatEther(tx.value),
        txFee: Utils.formatEther(receipt.gasUsed * tx.gasPrice),
        status: receipt.status === 1 ? 'Success' : 'Failed',
        tokenTransfers
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txHash}:`, error);
      return null;
    }
  }

  // Header auto-refresh effect
  useEffect(() => {
    async function updateHeader() {
      try {
        const latestBlock = await alchemy.core.getBlock("latest");
        setBlockNumber(latestBlock.number);
        setBlockCount(prev => prev + 1);
      } catch (error) {
        console.error("Error fetching latest block:", error);
      }
    }

    updateHeader();
    const interval = setInterval(updateHeader, 12000);
    return () => clearInterval(interval);
  }, []);

  // Function to handle block search
  const handleSearch = async () => {
    const searchedBlockNumber = parseInt(searchInput);
    
    // Validate input
    if (!searchedBlockNumber && searchedBlockNumber !== 0) {
      setError('Please enter a valid block number');
      return;
    }

    if (searchedBlockNumber < 0) {
      setError('Block number cannot be negative');
      return;
    }

    if (blockNumber && searchedBlockNumber > blockNumber) {
      setError('Block number cannot be greater than the latest block');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const block = await alchemy.core.getBlock(searchedBlockNumber);
      setSearchedBlock(block);

      // Fetch first 5 transactions of the block
      const txPromises = block.transactions
        .map(fetchTransactionDetails);
      
      const txDetails = await Promise.all(txPromises);
      setTransactions(txDetails.filter(tx => tx !== null));
    } catch (error) {
      console.error("Error fetching block:", error);
      setError('Error fetching block data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <div>Blocks mined since opening: {blockCount || "Loading..."}</div>
        <div>Latest Block Number: {blockNumber || "Loading..."}</div>
      </div>

      <div className="search-container">
        <input
          type="number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter block number"
          min="0"
          max={blockNumber}
          className="block-search-input"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="search-button"
        >
          Search Block
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {searchedBlock && (
        <div className="block-info">
          <h2>Block #{searchedBlock.number}</h2>
          <div className="block-details">
            <p>Timestamp: {new Date(searchedBlock.timestamp * 1000).toLocaleString()}</p>
            <p>Total Transactions: {searchedBlock.transactions.length}</p>
            <p>Gas Used: {searchedBlock.gasUsed.toString()}</p>
            <p>Gas Limit: {searchedBlock.gasLimit.toString()}</p>
          </div>
        </div>
      )}

      <div className="transactions-container">
        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.hash} className="transaction-card">
              <div className="transaction-header">
                <a 
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Transaction: {tx.hash}
                </a>
                <span className={`status status-${tx.status.toLowerCase()}`}>
                  {tx.status}
                </span>
              </div>

              {/* ETH Transfer */}
              {tx.value !== '0.0' && (
                <div className="transfer-info">
                  <h3>ETH Transfer</h3>
                  <p>From: {tx.from}</p>
                  <p>To: {tx.to ? tx.to : 'Contract Creation'}</p>
                  <p>Amount: {parseFloat(tx.value)}</p>
                  <p>Fee: {parseFloat(tx.txFee)} ETH</p>
                </div>
              )}

              {/* Token Transfers */}
              {tx.tokenTransfers.length > 0 && (
                <div className="token-transfers">
                  <h3>Token Transfers</h3>
                  {tx.tokenTransfers.map((transfer, index) => (
                    <div key={index} className="transfer-info">
                      <p>Token: {transfer.token}</p>
                      <p>From: {transfer.from}</p>
                      <p>To: {transfer.to}</p>
                      <p>Amount: {parseFloat(transfer.value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;