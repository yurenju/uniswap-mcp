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

/**
 * Quotation result interface
 */
export interface QuotationResult {
  amountOut: string;
  fee: number;
  exchangeRate: string;
  path?: string;
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

/**
 * Get quotation for token swap from Protocolink
 * @param params Parameters for the quotation
 * @returns Quotation result
 */
export async function getQuotation(params: {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  amount: string;
  slippage: number;
}): Promise<QuotationResult> {
  try {
    const { fromToken, toToken, amount, slippage } = params;
    
    // Convert tokens to Protocolink format
    const inputToken = {
      chainId: CHAIN_ID,
      address: fromToken.address,
      decimals: fromToken.decimals,
      symbol: fromToken.symbol,
      name: fromToken.name
    };
    
    const outputToken = {
      chainId: CHAIN_ID,
      address: toToken.address,
      decimals: toToken.decimals,
      symbol: toToken.symbol,
      name: toToken.name
    };
    
    // Get quotation from Protocolink
    const quotation = await api.protocols.uniswapv3.getSwapTokenQuotation(CHAIN_ID, {
      input: {
        token: inputToken,
        amount: amount
      },
      tokenOut: outputToken,
      slippage: slippage * 100 // Protocolink uses basis points (1% = 100)
    });
    
    // Calculate exchange rate
    const inputAmount = parseFloat(amount);
    const outputAmount = parseFloat(quotation.output.amount);
    const rate = outputAmount / inputAmount;
    
    // Return formatted result
    return {
      amountOut: quotation.output.amount,
      fee: 0.3, // Default fee for Uniswap V3 (can be improved with actual pool data)
      exchangeRate: `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`,
      path: '' // Path information not directly available from the API
    };
  } catch (error: unknown) {
    console.error('Error getting quotation from Protocolink:', error);
    
    // If API call fails, throw error to be handled by caller
    if (error instanceof Error) {
      throw new Error(`Failed to get quotation: ${error.message}`);
    } else {
      throw new Error('Failed to get quotation: Unknown error');
    }
  }
} 