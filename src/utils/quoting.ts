/**
 * Quoting utilities using Protocolink SDK
 * This module provides functions to get quotes for token swaps on Uniswap V3
 */

import * as protocolink from './protocolink.js';

// USDC 代幣地址 (Optimism)
const USDC_ADDRESS = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85';

// 定義報價結果的介面
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
 * 獲取代幣報價，預設使用 USDC 作為支付代幣
 * @param tokenSymbol 想要購買的代幣符號
 * @param amountIn USDC 的輸入金額
 * @param slippage 滑點容忍度 (百分比，預設 0.5%)
 * @param useUSDC 是否使用 USDC 作為支付代幣 (預設為 true)
 */
export async function getQuote(
  tokenSymbol: string,
  amountIn: string,
  slippage: number = 0.5,
  useUSDC: boolean = true
): Promise<QuoteResult> {
  try {
    console.log(`Getting quote for ${useUSDC ? 'buying' : 'selling'} ${tokenSymbol}...`);
    
    // 1. 獲取目標代幣資訊
    const targetTokens = await protocolink.getTokensBySymbol(tokenSymbol);
    
    if (targetTokens.length === 0) {
      throw new Error(`Token not found: ${tokenSymbol}`);
    }
    
    const targetToken = targetTokens[0];
    
    // 2. 獲取 USDC 代幣資訊
    let usdcToken;
    if (useUSDC || !useUSDC) { // 無論是買入還是賣出，都需要 USDC 資訊
      const usdcTokens = await protocolink.getTokensBySymbol('USDC');
      if (usdcTokens.length === 0) {
        // 如果找不到 USDC，嘗試直接使用地址
        const token = await protocolink.getTokenByAddress(USDC_ADDRESS);
        if (!token) {
          throw new Error('USDC token not found');
        }
        usdcToken = token;
      } else {
        usdcToken = usdcTokens[0];
      }
    }
    
    // 確保 usdcToken 已定義
    if (!usdcToken) {
      throw new Error('USDC token not found');
    }
    
    // 3. 使用 Protocolink API 獲取實際報價
    const fromToken = useUSDC ? usdcToken : targetToken;
    const toToken = useUSDC ? targetToken : usdcToken;
    
    // 使用 Protocolink API 獲取報價
    const quotation = await protocolink.getQuotation({
      fromToken,
      toToken,
      amount: amountIn,
      slippage
    });
    
    // 4. 返回格式化的報價資訊
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
 * 獲取代幣賣出報價，將代幣賣出換成 USDC
 * @param tokenSymbol 想要賣出的代幣符號
 * @param amountIn 賣出的代幣金額
 * @param slippage 滑點容忍度 (百分比，預設 0.5%)
 */
export async function getSellQuote(
  tokenSymbol: string,
  amountIn: string,
  slippage: number = 0.5
): Promise<QuoteResult> {
  // 賣出代幣時，將 useUSDC 設為 false，並交換輸入/輸出代幣
  return getQuote(tokenSymbol, amountIn, slippage, false);
} 