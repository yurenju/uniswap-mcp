#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as protocolink from "./utils/protocolink.js";
import * as quoting from "./utils/quoting.js";

// Create server instance
const server = new McpServer({
  name: "uniswap",
  version: "1.0.0",
});

// Define token interface
interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Mock data for token information
const MOCK_TOKENS: Record<string, TokenInfo> = {
  "OP": {
    address: "0x4200000000000000000000000000000000000042",
    name: "Optimism",
    symbol: "OP",
    decimals: 18
  },
  "USDC": {
    address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6
  },
  "ETH": {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  "DAI": {
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18
  },
  "WETH": {
    address: "0x4200000000000000000000000000000000000006",
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18
  }
};

/**
 * Get token information by symbol, using Protocolink
 * @param symbol Token symbol to look up
 * @returns Token information or null if not found
 */
async function getTokenInfo(symbol: string): Promise<TokenInfo | null> {
  try {
    // Get tokens from Protocolink
    const tokens = await protocolink.getTokensBySymbol(symbol);
    
    // If tokens found, return the first one
    if (tokens.length > 0) {
      return tokens[0];
    }
    
    // If not found in Protocolink, try mock data as fallback
    const upperSymbol = symbol.toUpperCase();
    if (MOCK_TOKENS[upperSymbol]) {
      return MOCK_TOKENS[upperSymbol];
    }
    
    // If still not found, return null
    return null;
  } catch (error) {
    console.error('Error getting token info:', error);
    
    // If there's an error, fall back to mock data
    const upperSymbol = symbol.toUpperCase();
    return MOCK_TOKENS[upperSymbol] || null;
  }
}

// Register token info tool
server.tool(
  "get-token-info",
  "Get token information by symbol",
  {
    symbol: z.string().describe("Token symbol (e.g., OP, USDC)"),
    chainId: z.number().optional().describe("Chain ID (defaults to Optimism's chain ID: 10)"),
  },
  async ({ symbol }) => {
    try {
      // Convert symbol to uppercase for case-insensitive matching
      const upperSymbol = symbol.toUpperCase();
      
      // Get token info
      const token = await getTokenInfo(upperSymbol);
      
      // Check if token exists
      if (!token) {
        return {
          content: [
            {
              type: "text",
              text: `Token with symbol ${symbol} not found.`,
            },
          ],
        };
      }

      // Return token information
      const responseText = `
Token Information:
Symbol: ${token.symbol}
Name: ${token.name}
Address: ${token.address}
Decimals: ${token.decimals}
Chain: Optimism (Chain ID: 10)
      `.trim();

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      console.error("Error in get-token-info:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve token information. Please try again.",
          },
        ],
      };
    }
  }
);

// Register quote tool
server.tool(
  "get-quote",
  "Get a quote for buying tokens with USDC",
  {
    tokenSymbol: z.string().describe("Token symbol you want to buy (e.g., OP, ETH)"),
    amountIn: z.number().positive().describe("Amount of USDC to spend"),
    slippage: z.number().optional().default(0.5).describe("Slippage tolerance in percentage (default: 0.5%)"),
  },
  async ({ tokenSymbol, amountIn, slippage = 0.5 }) => {
    try {
      // Convert symbol to uppercase for case-insensitive matching
      const upperTokenSymbol = tokenSymbol.toUpperCase();
      
      // Get quote from Protocolink
      const quote = await quoting.getQuote(upperTokenSymbol, amountIn.toString(), slippage);
      
      // Format response
      const responseText = `
Quote Information:
Buy: ${quote.tokenOut.symbol}
Spend: ${amountIn} USDC
Receive: ${quote.amountOut} ${quote.tokenOut.symbol}
Exchange Rate: ${quote.exchangeRate}
Fee: ${quote.fee}%
      `.trim();

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      console.error("Error in get-quote:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve quote. Please try again.",
          },
        ],
      };
    }
  }
);

// Register sell quote tool
server.tool(
  "sell-quote",
  "Get a quote for selling tokens for USDC",
  {
    tokenSymbol: z.string().describe("Token symbol you want to sell (e.g., OP, ETH)"),
    amountIn: z.number().positive().describe("Amount of token to sell"),
    slippage: z.number().optional().default(0.5).describe("Slippage tolerance in percentage (default: 0.5%)"),
  },
  async ({ tokenSymbol, amountIn, slippage = 0.5 }) => {
    try {
      // Convert symbol to uppercase for case-insensitive matching
      const upperTokenSymbol = tokenSymbol.toUpperCase();
      
      // Get sell quote from Protocolink
      const quote = await quoting.getSellQuote(upperTokenSymbol, amountIn.toString(), slippage);
      
      // Format response
      const responseText = `
Sell Quote Information:
Sell: ${amountIn} ${quote.tokenIn.symbol}
Receive: ${quote.amountOut} USDC
Exchange Rate: ${quote.exchangeRate}
Fee: ${quote.fee}%
      `.trim();

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      console.error("Error in sell-quote:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve sell quote. Please try again.",
          },
        ],
      };
    }
  }
);

// Register swap tokens tool
server.tool(
  "swap-tokens",
  "Swap tokens on Uniswap",
  {
    tokenInSymbol: z.string().describe("Input token symbol (e.g., ETH, USDC)"),
    tokenOutSymbol: z.string().describe("Output token symbol (e.g., USDC, OP)"),
    amountIn: z.number().positive().describe("Amount of input token"),
    tokenIn: z.string().optional().describe("Input token address (optional if tokenInSymbol is provided)"),
    tokenOut: z.string().optional().describe("Output token address (optional if tokenOutSymbol is provided)"),
    slippageTolerance: z.number().optional().default(0.5).describe("Slippage tolerance in percentage (default: 0.5%)"),
    recipient: z.string().optional().describe("Recipient address (optional, defaults to sender)"),
    deadline: z.number().optional().describe("Transaction deadline in minutes (optional, defaults to 20 minutes)"),
  },
  async ({ tokenInSymbol, tokenOutSymbol, amountIn, slippageTolerance = 0.5 }) => {
    try {
      // Convert symbols to uppercase for case-insensitive matching
      const upperTokenInSymbol = tokenInSymbol.toUpperCase();
      const upperTokenOutSymbol = tokenOutSymbol.toUpperCase();
      
      // Get token information
      const tokenIn = await getTokenInfo(upperTokenInSymbol);
      const tokenOut = await getTokenInfo(upperTokenOutSymbol);
      
      if (!tokenIn || !tokenOut) {
        return {
          content: [
            {
              type: "text",
              text: `One or both tokens (${tokenInSymbol}, ${tokenOutSymbol}) not found.`,
            },
          ],
        };
      }
      
      // Get quote for the swap
      let quote;
      if (upperTokenInSymbol === 'USDC') {
        // Buying tokens with USDC
        quote = await quoting.getQuote(upperTokenOutSymbol, amountIn.toString(), slippageTolerance);
      } else if (upperTokenOutSymbol === 'USDC') {
        // Selling tokens for USDC
        quote = await quoting.getSellQuote(upperTokenInSymbol, amountIn.toString(), slippageTolerance);
      } else {
        // Custom token pair (not implemented yet)
        return {
          content: [
            {
              type: "text",
              text: "Custom token pairs are not supported yet. Please use USDC as either the input or output token.",
            },
          ],
        };
      }
      
      // Generate a mock transaction hash (in a real implementation, this would be a real transaction hash)
      const mockTxHash = "0x" + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');

      // Format response
      const responseText = `
Swap Executed Successfully!

Transaction Details:
Input: ${amountIn} ${tokenIn.symbol}
Output: ${quote.amountOut} ${tokenOut.symbol}
Exchange Rate: ${quote.exchangeRate}
Slippage Tolerance: ${slippageTolerance}%
Fee: ${quote.fee}%
Transaction Hash: ${mockTxHash}
Network: Optimism

Note: This is a mock transaction. In a real implementation, this would execute an actual swap on Uniswap.
      `.trim();

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    } catch (error) {
      console.error("Error in swap-tokens:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to execute swap. Please try again.",
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Uniswap MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});