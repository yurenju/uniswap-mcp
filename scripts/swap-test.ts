/**
 * Test script for token swapping functionality
 * 
 * Usage:
 * npm run swap-test <fromTokenSymbol> <toTokenSymbol> <amount> <slippage> [--round-trip|-r]
 * 
 * Example:
 * npm run swap-test USDC OP 10 0.5
 * npm run swap-test USDC OP 10 0.5 --round-trip
 */

import * as swapping from '../src/utils/swapping.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.error('Usage: npm run swap-test <fromTokenSymbol> <toTokenSymbol> <amount> <slippage> [--round-trip|-r]');
      process.exit(1);
    }
    
    // Check if round-trip flag is present
    const roundTripIndex = args.findIndex(arg => arg === '--round-trip' || arg === '-r');
    const isRoundTrip = roundTripIndex !== -1;
    
    // Remove round-trip flag from args if present
    if (isRoundTrip) {
      args.splice(roundTripIndex, 1);
    }
    
    const fromTokenSymbol = args[0];
    const toTokenSymbol = args[1];
    const amount = args[2];
    const slippage = args.length > 3 ? parseFloat(args[3]) : 0.5;
    
    console.log(`Swapping ${amount} ${fromTokenSymbol} to ${toTokenSymbol} with ${slippage}% slippage...`);
    if (isRoundTrip) {
      console.log(`Round-trip mode: Will swap back to ${fromTokenSymbol} after the first swap`);
    }
    
    // Check if private key is available
    if (!process.env.WALLET_PRIVATE_KEY) {
      console.error('Error: WALLET_PRIVATE_KEY not found in environment variables');
      console.error('Please add your private key to the .env file');
      process.exit(1);
    }
    
    // Execute first swap
    const firstSwapResult = await swapping.swapTokens({
      fromTokenSymbol,
      toTokenSymbol,
      amount,
      slippage,
    });
    
    // Check if there was an error
    if ('isError' in firstSwapResult) {
      console.error('Error executing swap:', firstSwapResult.message);
      if (firstSwapResult.details) {
        console.error('Details:', firstSwapResult.details);
      }
      process.exit(1);
    }
    
    // Display first swap result
    console.log('\nFirst Swap Executed Successfully!');
    console.log('\nTransaction Details:');
    console.log(`Input: ${firstSwapResult.fromToken.amount} ${firstSwapResult.fromToken.symbol} (${firstSwapResult.fromToken.address})`);
    console.log(`Output: ${firstSwapResult.toToken.amount} ${firstSwapResult.toToken.symbol} (${firstSwapResult.toToken.address})`);
    console.log(`Exchange Rate: ${firstSwapResult.exchangeRate}`);
    console.log(`Fee: ${firstSwapResult.fee}%`);
    console.log(`Transaction Hash: ${firstSwapResult.transactionHash}`);
    console.log('Network: Optimism');
    
    // If round-trip is enabled, execute the second swap
    if (isRoundTrip) {
      console.log('\n------------------------------------------------------');
      console.log(`\nExecuting round-trip: Swapping back ${firstSwapResult.toToken.amount} ${toTokenSymbol} to ${fromTokenSymbol}...`);
      
      // Execute second swap (back to original token)
      const secondSwapResult = await swapping.swapTokens({
        fromTokenSymbol: toTokenSymbol,
        toTokenSymbol: fromTokenSymbol,
        amount: firstSwapResult.toToken.amount,
        slippage,
      });
      
      // Check if there was an error
      if ('isError' in secondSwapResult) {
        console.error('Error executing return swap:', secondSwapResult.message);
        if (secondSwapResult.details) {
          console.error('Details:', secondSwapResult.details);
        }
        process.exit(1);
      }
      
      // Display second swap result
      console.log('\nSecond Swap Executed Successfully!');
      console.log('\nTransaction Details:');
      console.log(`Input: ${secondSwapResult.fromToken.amount} ${secondSwapResult.fromToken.symbol} (${secondSwapResult.fromToken.address})`);
      console.log(`Output: ${secondSwapResult.toToken.amount} ${secondSwapResult.toToken.symbol} (${secondSwapResult.toToken.address})`);
      console.log(`Exchange Rate: ${secondSwapResult.exchangeRate}`);
      console.log(`Fee: ${secondSwapResult.fee}%`);
      console.log(`Transaction Hash: ${secondSwapResult.transactionHash}`);
      console.log('Network: Optimism');
      
      // Display round-trip summary
      console.log('\n------------------------------------------------------');
      console.log('\nRound-Trip Summary:');
      console.log(`Initial Amount: ${firstSwapResult.fromToken.amount} ${firstSwapResult.fromToken.symbol}`);
      console.log(`Final Amount: ${secondSwapResult.toToken.amount} ${secondSwapResult.toToken.symbol}`);
      
      // Calculate and display profit/loss
      const initialAmount = parseFloat(firstSwapResult.fromToken.amount);
      const finalAmount = parseFloat(secondSwapResult.toToken.amount);
      const difference = finalAmount - initialAmount;
      const percentChange = (difference / initialAmount) * 100;
      
      console.log(`Profit/Loss: ${difference.toFixed(6)} ${fromTokenSymbol} (${percentChange.toFixed(2)}%)`);
      console.log(`Total Fees Paid: Approximately ${(firstSwapResult.fee + secondSwapResult.fee).toFixed(2)}%`);
    }
    
  } catch (error) {
    console.error('Error in swap-test script:', error);
    process.exit(1);
  }
}

main(); 