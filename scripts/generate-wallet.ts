/**
 * Generate a random wallet for testing purposes
 * 
 * This script generates a random private key and displays the corresponding address.
 * WARNING: This is for testing purposes only. Do not use for production.
 * 
 * Usage:
 * npm run generate-wallet
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('Generating a new random wallet for testing...');
    console.log('WARNING: This is for testing purposes only. Do not use for production.');
    console.log('------------------------------------------------------');
    
    // Generate a random private key
    const privateKey = generatePrivateKey();
    
    // Create an account from the private key
    const account = privateKeyToAccount(privateKey);
    
    // Display wallet information
    console.log('\nWallet Information:');
    console.log(`Address: ${account.address}`);
    console.log(`Private Key: ${privateKey}`);
    console.log(`Chain: Optimism (Chain ID: ${optimism.id})`);
    
    // Check if .env file exists
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      // Read existing .env file
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if WALLET_PRIVATE_KEY already exists
      if (envContent.includes('WALLET_PRIVATE_KEY=')) {
        // Replace existing WALLET_PRIVATE_KEY
        envContent = envContent.replace(
          /WALLET_PRIVATE_KEY=.*/,
          `WALLET_PRIVATE_KEY=${privateKey}`
        );
      } else {
        // Add WALLET_PRIVATE_KEY to the end
        envContent += `\nWALLET_PRIVATE_KEY=${privateKey}\n`;
      }
    } else {
      // Create new .env file with WALLET_PRIVATE_KEY
      envContent = `WALLET_PRIVATE_KEY=${privateKey}\n`;
    }
    
    // Write to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n------------------------------------------------------');
    console.log('Private key has been saved to .env file as WALLET_PRIVATE_KEY');
    console.log('You can now use this wallet for testing purposes.');
    console.log('\nReminder: This wallet has 0 balance. You would need to fund it');
    console.log('with testnet tokens before using it for transactions.');
    
  } catch (error) {
    console.error('Error generating wallet:', error);
    process.exit(1);
  }
}

main(); 