/**
 * Quoting utilities using Protocolink SDK
 * This module provides functions to get quotes for token swaps on Uniswap V3
 */

import * as protocolink from './protocolink.js';

// USDC token address (Optimism)
const USDC_ADDRESS = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85';

// Define the interface for quote results
export interface QuoteResult {
  tokenIn: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    chainId?: number;
  };
  tokenOut: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    chainId?: number;
  };
  amountIn: string;
  amountOut: string;
  fee: number;
  exchangeRate: string;
  path?: string;
}

/**
 * Get token quote, using USDC as the payment token by default
 * @param tokenSymbol Symbol of the token to buy
 * @param amountIn Amount of USDC to input
 * @param slippage Slippage tolerance (percentage, default 0.5%)
 * @param useUSDC Whether to use USDC as the payment token (default true)
 */
export async function getQuote(
  tokenSymbol: string,
  amountIn: string,
  slippage: number = 0.5,
  useUSDC: boolean = true
): Promise<QuoteResult> {
  try {
    console.log(`Getting quote for ${useUSDC ? 'buying' : 'selling'} ${tokenSymbol}...`);
    
    // 1. Get target token information
    const targetTokens = await protocolink.getTokensBySymbol(tokenSymbol);
    
    if (targetTokens.length === 0) {
      throw new Error(`Token not found: ${tokenSymbol}`);
    }
    
    const targetToken = targetTokens[0];
    
    // 2. Get USDC token information
    let usdcToken;
    if (useUSDC || !useUSDC) { // Need USDC info for both buying and selling
      const usdcTokens = await protocolink.getTokensBySymbol('USDC');
      if (usdcTokens.length === 0) {
        // If USDC not found, try using the address directly
        const token = await protocolink.getTokenByAddress(USDC_ADDRESS);
        if (!token) {
          throw new Error('USDC token not found');
        }
        usdcToken = token;
      } else {
        usdcToken = usdcTokens[0];
      }
    }
    
    // Ensure usdcToken is defined
    if (!usdcToken) {
      throw new Error('USDC token not found');
    }
    
    // 3. Get actual quote using Protocolink API
    const fromToken = useUSDC ? usdcToken : targetToken;
    const toToken = useUSDC ? targetToken : usdcToken;
    
    // Get quotation using Protocolink API
    const quotation = await protocolink.getQuotation({
      fromToken,
      toToken,
      amount: amountIn,
      slippage
    });
    
    // 4. Return formatted quote information
    return {
      tokenIn: fromToken,
      tokenOut: toToken,
      amountIn: amountIn,
      amountOut: quotation.amountOut,
      fee: quotation.fee,
      exchangeRate: quotation.exchangeRate,
      path: quotation.path || '',
    };
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

/**
 * Get token sell quote, selling token for USDC
 * @param tokenSymbol Symbol of the token to sell
 * @param amountIn Amount of token to sell
 * @param slippage Slippage tolerance (percentage, default 0.5%)
 */
export async function getSellQuote(
  tokenSymbol: string,
  amountIn: string,
  slippage: number = 0.5
): Promise<QuoteResult> {
  // When selling tokens, set useUSDC to false and swap input/output tokens
  return getQuote(tokenSymbol, amountIn, slippage, false);
} 