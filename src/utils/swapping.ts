/**
 * Token swapping utilities using Protocolink SDK
 * This module provides functions to execute token swaps on Uniswap V3
 */

import * as api from '@protocolink/api';
import * as common from '@protocolink/common';
import { optimism } from 'viem/chains';
import * as protocolink from './protocolink.js';
import { loadWalletConfig, getRecipientAddress, OPTIMISM_RPC_URL } from './wallet.js';
import { parseUnits, formatUnits } from 'viem';

// Optimism Chain ID
const CHAIN_ID = 10;

/**
 * Swap result interface
 */
export interface SwapResult {
  transactionHash: string;
  fromToken: {
    address: string;
    symbol: string;
    amount: string;
  };
  toToken: {
    address: string;
    symbol: string;
    amount: string;
  };
  exchangeRate: string;
  fee: number;
}

/**
 * Execute token swap using Protocolink SDK
 */
export async function swapTokens(params: {
  fromTokenSymbol: string;
  toTokenSymbol: string;
  amount: string;
  slippage: number;
  recipient?: string;
}): Promise<SwapResult> {
  try {
    const { fromTokenSymbol, toTokenSymbol, amount, slippage, recipient } = params;
    
    // Get token information
    const fromTokens = await protocolink.getTokensBySymbol(fromTokenSymbol);
    const toTokens = await protocolink.getTokensBySymbol(toTokenSymbol);
    
    if (fromTokens.length === 0 || toTokens.length === 0) {
      throw new Error(`One or both tokens not found: ${fromTokenSymbol}, ${toTokenSymbol}`);
    }
    
    const fromToken = fromTokens[0];
    const toToken = toTokens[0];
    
    // Load wallet configuration
    const walletConfig = loadWalletConfig();
    
    // Get recipient address
    const recipientAddress = getRecipientAddress(recipient);
    
    // Get quotation from Protocolink
    console.log(`Getting quotation for ${amount} ${fromToken.symbol} to ${toToken.symbol}...`);
    
    // Prepare input token for Protocolink
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
    
    // Get quotation from Protocolink - using the correct format according to docs
    const swapQuotation = await api.protocols.uniswapv3.getSwapTokenQuotation(CHAIN_ID, {
      input: { 
        token: inputToken, 
        amount: amount 
      },
      tokenOut: outputToken,
      slippage: slippage * 100 // Protocolink uses basis points (1% = 100)
    });
    
    console.log(`Quotation received. Expected output: ${swapQuotation.output.amount} ${toToken.symbol}`);
    
    // Create swap logic according to docs
    console.log('Building swap transaction...');
    const swapLogic = api.protocols.uniswapv3.newSwapTokenLogic(swapQuotation);
    
    // Create router data
    const routerData = {
      chainId: CHAIN_ID,
      account: walletConfig.address,
      logics: [swapLogic]
    };
    
    // Estimate router data to check for approvals
    console.log('Estimating transaction...');
    const estimateResult = await api.estimateRouterData(routerData);
    
    // Check if approvals are needed
    if (estimateResult.approvals && estimateResult.approvals.length > 0) {
      console.log(`${estimateResult.approvals.length} approval(s) needed. Executing approvals...`);
      
      for (const approval of estimateResult.approvals) {
        console.log(`Approving token for spending...`);
        
        // Send approval transaction
        const approvalTx = await walletConfig.walletClient.sendTransaction({
          account: walletConfig.walletClient.account,
          to: approval.to as `0x${string}`,
          data: approval.data as `0x${string}`,
          value: BigInt(0)
        });
        
        console.log(`Approval transaction sent: ${approvalTx}`);
        
        // Wait for approval transaction to be confirmed
        const approvalReceipt = await walletConfig.publicClient.waitForTransactionReceipt({
          hash: approvalTx
        });
        
        console.log(`Approval confirmed: ${approvalReceipt.status}`);
      }
    } else {
      console.log('No approvals needed.');
    }
    
    // Build the transaction request
    console.log('Building transaction request...');
    const request = await api.buildRouterTransactionRequest(routerData);
    
    // Send the transaction
    console.log('Sending transaction...');
    const hash = await walletConfig.walletClient.sendTransaction({
      account: walletConfig.walletClient.account,
      to: request.to as `0x${string}`,
      data: request.data as `0x${string}`,
      value: BigInt(String(request.value || '0'))
    });
    
    console.log(`Transaction sent! Hash: ${hash}`);
    
    // Wait for transaction receipt
    console.log('Waiting for transaction confirmation...');
    const receipt = await walletConfig.publicClient.waitForTransactionReceipt({ 
      hash: hash 
    });
    
    console.log(`Transaction confirmed! Status: ${receipt.status}`);
    
    if (receipt.status !== 'success') {
      throw new Error('Transaction failed');
    }
    
    // Calculate exchange rate
    const inputAmount = parseFloat(amount);
    const outputAmount = parseFloat(swapQuotation.output.amount);
    const rate = outputAmount / inputAmount;
    
    // Return swap result
    return {
      transactionHash: hash,
      fromToken: {
        address: fromToken.address,
        symbol: fromToken.symbol,
        amount: amount
      },
      toToken: {
        address: toToken.address,
        symbol: toToken.symbol,
        amount: swapQuotation.output.amount
      },
      exchangeRate: `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`,
      fee: 0.3 // Default Uniswap V3 fee
    };
  } catch (error: unknown) {
    console.error('Error swapping tokens:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to swap tokens: ${error.message}`);
    } else {
      throw new Error('Failed to swap tokens: Unknown error');
    }
  }
} 