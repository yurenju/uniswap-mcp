/**
 * Test script for the get-quote functionality
 * 
 * Usage:
 * npm run quote-info <token-symbol> <amount-in> [slippage]
 * 
 * Example:
 * npm run quote-info OP 10 0.5
 */

import * as quoting from '../src/utils/quoting.js';

// Get command line arguments
const tokenSymbol = process.argv[2];
const amountIn = process.argv[3];
const slippage = process.argv[4] ? parseFloat(process.argv[4]) : 0.5;

if (!tokenSymbol || !amountIn) {
  console.error('Please provide token symbol and amount');
  console.error('Example: npm run quote-info OP 10 0.5');
  process.exit(1);
}

/**
 * Get quote information
 */
async function getQuoteInfo(tokenSymbol: string, amountIn: string, slippage: number) {
  try {
    console.log(`Getting quote for buying ${tokenSymbol} with ${amountIn} USDC (slippage: ${slippage}%)...`);
    
    // Get quote from Protocolink
    console.log('\nFetching from Protocolink...');
    const quote = await quoting.getQuote(tokenSymbol, amountIn, slippage);
    
    console.log('\nQuote details:');
    console.log(JSON.stringify(quote, null, 2));
    
    return quote;
  } catch (error) {
    console.error('\nError getting quote:', error);
    return null;
  }
}

/**
 * Get sell quote information
 */
async function getSellQuoteInfo(tokenSymbol: string, amountIn: string, slippage: number) {
  try {
    console.log(`Getting quote for selling ${amountIn} ${tokenSymbol} for USDC (slippage: ${slippage}%)...`);
    
    // Get sell quote from Protocolink
    console.log('\nFetching from Protocolink...');
    const quote = await quoting.getSellQuote(tokenSymbol, amountIn, slippage);
    
    console.log('\nSell quote details:');
    console.log(JSON.stringify(quote, null, 2));
    
    return quote;
  } catch (error) {
    console.error('\nError getting sell quote:', error);
    return null;
  }
}

// Main function
async function main() {
  try {
    // Get buy quote
    const quote = await getQuoteInfo(tokenSymbol, amountIn, slippage);
    
    if (quote) {
      console.log('\n=== Buy Quote Result ===');
      console.log(`Buy: ${quote.tokenOut.symbol}`);
      console.log(`Spend: ${quote.amountIn} ${quote.tokenIn.symbol}`);
      console.log(`Receive: ${quote.amountOut} ${quote.tokenOut.symbol}`);
      console.log(`Exchange Rate: ${quote.exchangeRate}`);
      console.log(`Fee: ${quote.fee}%`);
    } else {
      console.log('\n=== Buy Quote Result ===');
      console.log(`Failed to get quote for ${tokenSymbol}`);
    }
    
    // Get sell quote
    const sellQuote = await getSellQuoteInfo(tokenSymbol, amountIn, slippage);
    
    if (sellQuote) {
      console.log('\n=== Sell Quote Result ===');
      console.log(`Sell: ${sellQuote.amountIn} ${sellQuote.tokenIn.symbol}`);
      console.log(`Receive: ${sellQuote.amountOut} ${sellQuote.tokenOut.symbol}`);
      console.log(`Exchange Rate: ${sellQuote.exchangeRate}`);
      console.log(`Fee: ${sellQuote.fee}%`);
    } else {
      console.log('\n=== Sell Quote Result ===');
      console.log(`Failed to get sell quote for ${tokenSymbol}`);
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the main function
main().catch(console.error); 