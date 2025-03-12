import { getWalletTokens } from '../src/utils/moralis';
import { loadWalletConfig } from '../src/utils/wallet';

type GetWalletInfoResult = {
  success: boolean;
  data?: {
    address: string;
    tokens: any;
  };
  error?: string;
};

/**
 * Tool to get wallet information including all token balances
 * @returns Wallet information with token balances
 */
export async function getWalletInfo(): Promise<GetWalletInfoResult> {
  try {
    // Load wallet configuration from private key
    const walletConfig = loadWalletConfig();
    const address = walletConfig.address;
    
    // Get wallet tokens with balances
    const tokens = await getWalletTokens(address);
    
    // Check if there was an error
    if ('error' in tokens) {
      return {
        success: false,
        error: tokens.error as string
      };
    }
    
    return {
      success: true,
      data: {
        address,
        tokens,
      }
    };
  } catch (error) {
    console.error('Error getting wallet info:', error);
    return {
      success: false,
      error: 'Failed to get wallet information'
    };
  }
}

/**
 * Main function to execute the wallet info retrieval
 */
async function main() {
  console.log('Fetching wallet information...');
  
  const result = await getWalletInfo();
  
  if (result.success && result.data) {
    console.log('Wallet Address:', result.data.address);
    console.log('Token Balances:');
    console.log(JSON.stringify(result.data.tokens, null, 2));
  } else {
    console.error('Error:', result.error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1); 
});