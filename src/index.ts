#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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
      
      // Check if token exists in our mock data
      if (!MOCK_TOKENS[upperSymbol]) {
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
      const token = MOCK_TOKENS[upperSymbol];
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
  "Get a quote for swapping tokens",
  {
    tokenInSymbol: z.string().describe("Input token symbol (e.g., ETH, USDC)"),
    tokenOutSymbol: z.string().describe("Output token symbol (e.g., USDC, OP)"),
    amountIn: z.number().positive().describe("Amount of input token"),
    tokenIn: z.string().optional().describe("Input token address (optional if tokenInSymbol is provided)"),
    tokenOut: z.string().optional().describe("Output token address (optional if tokenOutSymbol is provided)"),
    decimalsIn: z.number().optional().describe("Input token decimals (optional, defaults to auto-detect)"),
    decimalsOut: z.number().optional().describe("Output token decimals (optional, defaults to auto-detect)"),
  },
  async ({ tokenInSymbol, tokenOutSymbol, amountIn }) => {
    try {
      // Convert symbols to uppercase for case-insensitive matching
      const upperTokenInSymbol = tokenInSymbol.toUpperCase();
      const upperTokenOutSymbol = tokenOutSymbol.toUpperCase();
      
      // Check if tokens exist in our mock data
      if (!MOCK_TOKENS[upperTokenInSymbol] || !MOCK_TOKENS[upperTokenOutSymbol]) {
        return {
          content: [
            {
              type: "text",
              text: `One or both tokens (${tokenInSymbol}, ${tokenOutSymbol}) not found.`,
            },
          ],
        };
      }

      // Mock price data (in a real implementation, this would come from Uniswap)
      const mockPrices: Record<string, number> = {
        "ETH_USDC": 3500,
        "USDC_ETH": 1 / 3500,
        "OP_USDC": 2.5,
        "USDC_OP": 1 / 2.5,
        "ETH_OP": 3500 / 2.5,
        "OP_ETH": 2.5 / 3500,
        "DAI_USDC": 0.99,
        "USDC_DAI": 1 / 0.99,
        "ETH_DAI": 3500 * 0.99,
        "DAI_ETH": 1 / (3500 * 0.99),
        "OP_DAI": 2.5 * 0.99,
        "DAI_OP": 1 / (2.5 * 0.99),
        "WETH_ETH": 1,
        "ETH_WETH": 1,
        "WETH_USDC": 3500,
        "USDC_WETH": 1 / 3500,
      };

      const pricePair = `${upperTokenInSymbol}_${upperTokenOutSymbol}`;
      const price = mockPrices[pricePair] || 1; // Default to 1:1 if pair not found
      
      // Calculate output amount
      const amountOut = amountIn * price;
      
      // Add some mock price impact and fee
      const priceImpact = 0.5; // 0.5%
      const fee = 0.3; // 0.3%
      
      // Calculate final amount with price impact and fee
      const finalAmountOut = amountOut * (1 - priceImpact / 100 - fee / 100);

      // Format response
      const responseText = `
Quote Information:
Input: ${amountIn} ${MOCK_TOKENS[upperTokenInSymbol].symbol}
Output: ${finalAmountOut.toFixed(6)} ${MOCK_TOKENS[upperTokenOutSymbol].symbol}
Exchange Rate: 1 ${MOCK_TOKENS[upperTokenInSymbol].symbol} = ${price.toFixed(6)} ${MOCK_TOKENS[upperTokenOutSymbol].symbol}
Price Impact: ${priceImpact}%
Fee: ${fee}%
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
      
      // Check if tokens exist in our mock data
      if (!MOCK_TOKENS[upperTokenInSymbol] || !MOCK_TOKENS[upperTokenOutSymbol]) {
        return {
          content: [
            {
              type: "text",
              text: `One or both tokens (${tokenInSymbol}, ${tokenOutSymbol}) not found.`,
            },
          ],
        };
      }

      // Mock price data (same as in get-quote)
      const mockPrices: Record<string, number> = {
        "ETH_USDC": 3500,
        "USDC_ETH": 1 / 3500,
        "OP_USDC": 2.5,
        "USDC_OP": 1 / 2.5,
        "ETH_OP": 3500 / 2.5,
        "OP_ETH": 2.5 / 3500,
        "DAI_USDC": 0.99,
        "USDC_DAI": 1 / 0.99,
        "ETH_DAI": 3500 * 0.99,
        "DAI_ETH": 1 / (3500 * 0.99),
        "OP_DAI": 2.5 * 0.99,
        "DAI_OP": 1 / (2.5 * 0.99),
        "WETH_ETH": 1,
        "ETH_WETH": 1,
        "WETH_USDC": 3500,
        "USDC_WETH": 1 / 3500,
      };

      const pricePair = `${upperTokenInSymbol}_${upperTokenOutSymbol}`;
      const price = mockPrices[pricePair] || 1; // Default to 1:1 if pair not found
      
      // Calculate output amount
      const amountOut = amountIn * price;
      
      // Add some mock price impact and fee
      const priceImpact = 0.5; // 0.5%
      const fee = 0.3; // 0.3%
      
      // Calculate final amount with price impact and fee
      const finalAmountOut = amountOut * (1 - priceImpact / 100 - fee / 100);

      // Generate a mock transaction hash
      const mockTxHash = "0x" + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');

      // Format response
      const responseText = `
Swap Executed Successfully!

Transaction Details:
Input: ${amountIn} ${MOCK_TOKENS[upperTokenInSymbol].symbol}
Output: ${finalAmountOut.toFixed(6)} ${MOCK_TOKENS[upperTokenOutSymbol].symbol}
Exchange Rate: 1 ${MOCK_TOKENS[upperTokenInSymbol].symbol} = ${price.toFixed(6)} ${MOCK_TOKENS[upperTokenOutSymbol].symbol}
Slippage Tolerance: ${slippageTolerance}%
Price Impact: ${priceImpact}%
Fee: ${fee}%
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