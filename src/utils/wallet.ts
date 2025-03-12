/**
 * Wallet configuration and utilities
 * This module handles wallet setup and configuration for the Uniswap MCP
 */

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimism } from 'viem/chains';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Hardcoded configuration values
export const OPTIMISM_RPC_URL = 'https://mainnet.optimism.io';
export const DEFAULT_RECIPIENT_ADDRESS = ''; // Empty string means use the wallet address

/**
 * Wallet configuration interface
 */
export interface WalletConfig {
  privateKey: string;
  publicClient: any; // Using any to avoid type conflicts
  walletClient: any; // Using any to avoid type conflicts
  address: string;
}

/**
 * Load wallet configuration from environment variables
 * @returns Wallet configuration object
 */
export function loadWalletConfig(): WalletConfig {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('WALLET_PRIVATE_KEY not found in environment variables');
  }
  
  // Format private key (ensure it has 0x prefix for viem)
  const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
  
  // Create viem clients
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(OPTIMISM_RPC_URL)
  });
  
  const walletClient = createWalletClient({
    chain: optimism,
    transport: http(OPTIMISM_RPC_URL),
    account
  });
  
  return {
    privateKey: formattedPrivateKey,
    publicClient,
    walletClient,
    address: account.address
  };
}

/**
 * Get the wallet address from the private key
 * @returns Wallet address
 */
export function getWalletAddress(): string {
  const { address } = loadWalletConfig();
  return address;
}

/**
 * Get the recipient address (defaults to wallet address if not specified)
 * @param specifiedRecipient Optional recipient address
 * @returns Recipient address
 */
export function getRecipientAddress(specifiedRecipient?: string): string {
  if (specifiedRecipient) {
    return specifiedRecipient;
  }
  
  if (DEFAULT_RECIPIENT_ADDRESS) {
    return DEFAULT_RECIPIENT_ADDRESS;
  }
  
  return getWalletAddress();
} 