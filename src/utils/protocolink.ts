/**
 * Token utilities using Protocolink SDK
 * This module provides functions to query token information from Uniswap V3 via Protocolink
 */

import * as api from '@protocolink/api';

/**
 * Token information interface
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  chainId?: number;
}

// Optimism chain ID
const CHAIN_ID = 10;

/**
 * Get all tokens supported by Uniswap V3 on Optimism
 * @returns Array of token information
 */
export async function getAllTokens(): Promise<TokenInfo[]> {
  try {
    const tokenList = await api.protocols.uniswapv3.getSwapTokenTokenList(CHAIN_ID);
    
    // Map to our TokenInfo interface
    return tokenList.map((token: any) => ({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: token.chainId,
      logoURI: token.logoURI
    }));
  } catch (error) {
    console.error('Error fetching tokens from Protocolink:', error);
    return [];
  }
}

/**
 * Get token information by symbol
 * @param symbol Token symbol to look up
 * @returns Array of matching tokens (since symbols are not unique)
 */
export async function getTokensBySymbol(symbol: string): Promise<TokenInfo[]> {
  try {
    const tokenList = await getAllTokens();
    
    // Filter tokens by symbol (case-insensitive)
    const matchedTokens = tokenList.filter(token => 
      token.symbol.toUpperCase() === symbol.toUpperCase()
    );
    
    return matchedTokens;
  } catch (error) {
    console.error('Error getting tokens by symbol:', error);
    return [];
  }
}

/**
 * Get token information by address
 * @param address Token address to look up
 * @returns Token information or null if not found
 */
export async function getTokenByAddress(address: string): Promise<TokenInfo | null> {
  try {
    const tokenList = await getAllTokens();
    
    // Find token by address (case-insensitive)
    const token = tokenList.find(token => 
      token.address.toLowerCase() === address.toLowerCase()
    );
    
    return token || null;
  } catch (error) {
    console.error('Error getting token by address:', error);
    return null;
  }
}

/**
 * Search tokens by name or symbol
 * @param searchTerm Partial name or symbol to search for
 * @returns Array of matching tokens
 */
export async function searchTokens(searchTerm: string): Promise<TokenInfo[]> {
  try {
    const tokenList = await getAllTokens();
    const searchTermLower = searchTerm.toLowerCase();
    
    // Filter tokens by name or symbol
    return tokenList.filter(token => 
      token.symbol.toLowerCase().includes(searchTermLower) ||
      token.name.toLowerCase().includes(searchTermLower)
    );
  } catch (error) {
    console.error('Error searching tokens:', error);
    return [];
  }
} 