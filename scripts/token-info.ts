/**
 * Test script for the get-token-info functionality
 * 
 * Usage:
 * npm run token-info <token-symbol>
 * 
 * Example:
 * npm run token-info USDC
 */

import * as protocolink from '../src/utils/protocolink.js';

// Get token symbol from command line arguments
const tokenSymbol = process.argv[2];

if (!tokenSymbol) {
  console.error('Please provide a token symbol as an argument');
  console.error('Example: npm run token-info USDC');
  process.exit(1);
}

/**
 * Get token information by symbol using Protocolink
 */
async function getTokenInfo(symbol: string) {
  try {
    console.log(`Searching for token: ${symbol}...`);
    
    // Get tokens from Protocolink
    console.log('\nFetching from Protocolink...');
    const tokens = await protocolink.getTokensBySymbol(symbol);
    
    if (tokens.length > 0) {
      console.log(`Found ${tokens.length} token(s):`);
      tokens.forEach((token, index) => {
        console.log(`\nToken #${index + 1}:`);
        console.log(JSON.stringify(token, null, 2));
      });
      return tokens;
    } else {
      console.log('Token not found in Protocolink');
      return [];
    }
  } catch (error) {
    console.error('\nError getting token info:', error);
    return [];
  }
}

// Main function
async function main() {
  try {
    const tokens = await getTokenInfo(tokenSymbol);
    
    if (tokens.length > 0) {
      console.log('\n=== Final Result ===');
      console.log(`Found ${tokens.length} token(s) with symbol ${tokenSymbol}`);
      
      tokens.forEach((token, index) => {
        console.log(`\nToken #${index + 1}:`);
        console.log(`Symbol: ${token.symbol}`);
        console.log(`Name: ${token.name}`);
        console.log(`Address: ${token.address}`);
        console.log(`Decimals: ${token.decimals}`);
        if (token.chainId) {
          console.log(`Chain ID: ${token.chainId}`);
        }
        if (token.logoURI) {
          console.log(`Logo URI: ${token.logoURI}`);
        }
      });
    } else {
      console.log('\n=== Final Result ===');
      console.log(`Token ${tokenSymbol} not found`);
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Run the main function
main().catch(console.error); 