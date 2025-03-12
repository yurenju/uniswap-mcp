import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

// Optimism chain constant
const OPTIMISM_CHAIN = EvmChain.OPTIMISM;

// Initialize Moralis
const initMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }
};

/**
 * Get all token balances with prices for a wallet address on Optimism
 * @param address Wallet address
 * @returns Array of tokens with balances and prices
 */
export async function getWalletTokens(address: string) {
  try {
    await initMoralis();
    
    // Get ERC20 token balances
    const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain: OPTIMISM_CHAIN,
    });

    // Get native token balance
    const nativeBalanceResponse = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain: OPTIMISM_CHAIN,
    });

    // Add native token to the response
    const nativeToken = {
      token_address: "0x0000000000000000000000000000000000000000", // ETH address
      name: "Ethereum",
      symbol: "ETH",
      logo: null,
      thumbnail: null,
      decimals: 18,
      balance: nativeBalanceResponse.raw.balance,
    };
    
    return [nativeToken, ...tokenResponse.raw];
  } catch (error) {
    console.error('Error fetching wallet tokens:', error);
    return { error: 'Failed to fetch wallet tokens' };
  }
}

/**
 * Get specific token balance for a wallet address on Optimism
 * @param address Wallet address
 * @param tokenAddress Token contract address
 * @returns Token balance information
 */
export async function getTokenBalance(address: string, tokenAddress: string) {
  try {
    await initMoralis();
    
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain: OPTIMISM_CHAIN,
      tokenAddresses: [tokenAddress],
    });
    
    return response.raw[0] || null;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return { error: 'Failed to fetch token balance' };
  }
}

/**
 * Get token metadata (name, symbol, decimals) on Optimism
 * @param tokenAddress Token contract address
 * @returns Token metadata
 */
export async function getTokenMetadata(tokenAddress: string) {
  try {
    await initMoralis();
    
    const response = await Moralis.EvmApi.token.getTokenMetadata({
      addresses: [tokenAddress],
      chain: OPTIMISM_CHAIN,
    });
    
    return response.raw[0] || null;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return { error: 'Failed to fetch token metadata' };
  }
}

/**
 * Get token price on Optimism
 * @param tokenAddress Token contract address
 * @returns Token price information
 */
export async function getTokenPrice(tokenAddress: string) {
  try {
    await initMoralis();
    
    const response = await Moralis.EvmApi.token.getTokenPrice({
      address: tokenAddress,
      chain: OPTIMISM_CHAIN,
    });
    
    return response.raw;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return { error: 'Failed to fetch token price' };
  }
}