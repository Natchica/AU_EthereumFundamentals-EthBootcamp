import React, { useState } from "react";
import { isAddress } from "ethers";
import { Utils } from 'alchemy-sdk';

const AddressSearch = ({ alchemy }) => {
    const [address, setAddress] = useState("");
    const [addressData, setAddressData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchAddressData = async () => {
        if (!isAddress(address)) {
            setError("Please enter a valid Ethereum address");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [balance, nonce, tokenBalances] = await Promise.all([
                alchemy.core.getBalance(address),
                alchemy.core.getTransactionCount(address),
                alchemy.core.getTokenBalances(address),
            ]);

            const tokenDetails = await Promise.all(
                tokenBalances.tokenBalances
                    .filter((token) => token.tokenBalance !== "0")
                    .map(async (token) => {
                        try {
                            const metadata = await alchemy.core.getTokenMetadata(
                                token.contractAddress
                            );

                            return {
                                ...metadata,
                                contractAddress: token.contractAddress,
                                balance: Utils.formatUnits(
                                    token.tokenBalance,
                                    metadata.decimals || 18
                                ),
                                symbol: metadata.symbol || 'UNKNOWN',
                                name: metadata.name || 'Unknown Token'
                            };
                        } catch (err) {
                            console.error(`Error fetching metadata for token ${token.contractAddress}:`, err);
                            return null;
                        }
                    })
            );

            const validTokenDetails = tokenDetails.filter(token => token !== null);

            setAddressData({
                ethBalance: Utils.formatEther(balance),
                transactionCount: nonce,
                tokens: validTokenDetails,
            });
        } catch (error) {
            console.error("Detailed error:", error);
            setError(`Error fetching address data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="address-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="search-container">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Ethereum address"
                    className="address-search-input"
                />
                <button
                    onClick={fetchAddressData}
                    disabled={loading}
                    className="search-button"
                >
                    Search Address
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading">Loading address data...</div>}

            {addressData && (
                <div className="address-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h2>Address Details</h2>

                    <div className="info-card">
                        <h3>Overview</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">ETH Balance:</span>
                                <span className="value">
                                    {parseFloat(addressData.ethBalance).toFixed(4)} ETH
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="label">Transaction Count:</span>
                                <span className="value">{addressData.transactionCount}</span>
                            </div>
                        </div>
                    </div>

                    {addressData.tokens.length > 0 && (
                        <div className="tokens-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <h3>Token Holdings</h3>
                            <div className="tokens-grid" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                {addressData.tokens.map((token) => (
                                    <div key={token.contractAddress} className="token-item">
                                        <div className="token-header">
                                            <span className="token-symbol">{token.symbol}</span>
                                            {token.name && (
                                                <span className="token-name">({token.name})</span>
                                            )}
                                        </div>
                                        <div className="token-balance">
                                            {parseFloat(token.balance).toFixed(4)}
                                        </div>
                                        <div className="token-contract">
                                            <a
                                                href={`https://etherscan.io/token/${token.contractAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View on Etherscan
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressSearch;