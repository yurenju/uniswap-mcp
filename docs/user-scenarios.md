# Uniswap MCP 使用者情境

## 主要使用者情境

當使用者在已安裝 uniswap-mcp 的 Claude Desktop 中與 AI 助手互動時，可能會有以下幾個主要使用案例：

### 情境 1: 查詢代幣價格

**使用者**: 今天的 OP 代幣價格如何？

**系統流程**:
1. Claude 識別出使用者想要查詢 OP 代幣的價格
2. Claude 透過 uniswap-mcp 的 `get-token-info` 功能查詢 OP 代幣的合約地址
3. 系統預設使用 USDC 作為計價代幣
4. Claude 使用 uniswap-mcp 的 `get-quote` 功能，查詢 1 個 OP 代幣可以兌換多少 USDC
5. Claude 將價格資訊以易於理解的方式呈現給使用者

### 情境 2: 購買代幣

**使用者**: 那我想要買 100 USDC 的 OP 代幣

**系統流程**:
1. Claude 識別出使用者想要使用 100 USDC 購買 OP 代幣
2. Claude 透過 uniswap-mcp 的 `get-token-info` 功能獲取 OP 和 USDC 的合約地址
3. Claude 使用 uniswap-mcp 的 `get-quote` 功能，計算 100 USDC 可以兌換多少 OP 代幣
4. Claude 向使用者確認交易詳情（預計獲得的 OP 數量、滑點等）
5. 使用者確認後，Claude 使用 uniswap-mcp 的 `swap-tokens` 功能執行交易
6. Claude 將交易結果（成功/失敗、交易哈希等）呈現給使用者

### 情境 3: 查詢多個代幣價格比較

**使用者**: OP 和 ARB 代幣哪個表現比較好？

**系統流程**:
1. Claude 識別出使用者想要比較 OP 和 ARB 代幣的表現
2. Claude 透過 uniswap-mcp 的 `get-token-info` 功能查詢兩個代幣的合約地址
3. Claude 使用 uniswap-mcp 的 `get-quote` 功能，分別查詢兩個代幣對 USDC 的價格
4. Claude 可能還會查詢其他相關資訊（如交易量）
5. Claude 將比較結果以易於理解的方式呈現給使用者

## 執行計畫與使用者情境的對應分析

### 情境 1: 查詢代幣價格

我們的執行計畫中有以下功能支援此情境：

- `get-token-info`: 可以查詢 OP 代幣的合約地址
- `get-quote`: 可以查詢 OP 對 USDC 的價格

**是否完全支援**: ✅ 是

### 情境 2: 購買代幣

我們的執行計畫中有以下功能支援此情境：

- `get-token-info`: 可以查詢 OP 和 USDC 的合約地址
- `get-quote`: 可以計算 100 USDC 可以兌換多少 OP
- `swap-tokens`: 可以執行代幣交換交易

**是否完全支援**: ✅ 是

### 情境 3: 查詢多個代幣價格比較

我們的執行計畫中有以下功能支援此情境：

- `get-token-info`: 可以查詢多個代幣的合約地址
- `get-quote`: 可以查詢多個代幣對 USDC 的價格

**是否完全支援**: ✅ 是

## 環境變數設計

為了簡化程式複雜度，我們將使用環境變數來管理使用者的私鑰和其他敏感資訊：

```
PRIVATE_KEY=使用者的私鑰
RPC_URL=Optimism RPC 端點
DEFAULT_QUOTE_TOKEN=USDC (預設計價代幣)
SLIPPAGE_TOLERANCE=0.5 (預設滑點容忍度，百分比)
```

這樣設計可以讓我們專注於核心功能的實現，同時保持程式的安全性和可配置性。

## 結論

我們的執行計畫完全支援上述三個主要使用者情境。透過 Uniswap V3 Subgraph 查詢代幣地址，結合 Uniswap SDK 進行報價和交換操作，可以滿足使用者在 Claude Desktop 中查詢代幣價格和執行交易的需求。

使用環境變數管理私鑰和其他敏感設定，可以簡化程式複雜度，讓我們專注於核心功能的實現。 