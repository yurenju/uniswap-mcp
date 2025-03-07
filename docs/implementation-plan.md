# Uniswap MCP 執行計畫

## 1. 整體架構

我們將把現有的天氣 MCP 改寫為 Uniswap MCP，主要實現三個功能：
1. 查詢代幣資訊 (get-token-info)
2. 取得報價 (get-quote)
3. 交換代幣 (swap-tokens)

## 2. 檔案結構

```
src/
  |- index.ts (主程式)
  |- constants.ts (常數定義)
  |- utils/
     |- providers.ts (提供者相關功能)
     |- tokens.ts (代幣相關功能)
     |- quoting.ts (報價相關功能)
     |- swapping.ts (交換相關功能)
     |- tokenList.ts (代幣列表和查詢功能)
     |- subgraph.ts (Uniswap Subgraph 查詢功能)
examples/
  |- get-token-info.js (查詢代幣資訊範例)
  |- get-quote.js (報價範例)
  |- swap-tokens.js (交換代幣範例)
```

## 3. 功能實現

### 3.1 查詢代幣資訊 (get-token-info)

這個功能將允許使用者：
- 透過代幣符號（如 USDC、ETH）查詢代幣地址
- 獲取代幣的詳細資訊（小數位數、名稱等）
- 查詢 Optimism 上支援的代幣列表

**參數**：
- `symbol`: 代幣符號（如 USDC、ETH）
- `chainId`: 鏈 ID（預設為 Optimism 的鏈 ID：10）

**回傳**：
- 代幣地址
- 代幣小數位數
- 代幣全名
- 代幣符號

### 3.2 取得報價 (get-quote)

這個功能將允許使用者：
- 指定輸入代幣和輸出代幣（使用符號或地址）
- 指定輸入金額
- 獲取在 Optimism 上的 Uniswap V3 交易對中的報價

**參數**：
- `tokenInSymbol`: 輸入代幣符號（如 ETH、USDC）
- `tokenOutSymbol`: 輸出代幣符號（如 USDC、DAI）
- `amountIn`: 輸入金額
- `tokenIn`: 輸入代幣地址（可選，如果提供了 tokenInSymbol 則不需要）
- `tokenOut`: 輸出代幣地址（可選，如果提供了 tokenOutSymbol 則不需要）
- `decimalsIn`: 輸入代幣小數位數 (可選，預設自動檢測)
- `decimalsOut`: 輸出代幣小數位數 (可選，預設自動檢測)

**回傳**：
- 預期獲得的輸出代幣數量
- 當前匯率
- 價格影響

### 3.3 交換代幣 (swap-tokens)

這個功能將允許使用者：
- 指定輸入代幣和輸出代幣（使用符號或地址）
- 指定輸入金額
- 設定滑點容忍度
- 執行交換交易

**參數**：
- `tokenInSymbol`: 輸入代幣符號（如 ETH、USDC）
- `tokenOutSymbol`: 輸出代幣符號（如 USDC、DAI）
- `amountIn`: 輸入金額
- `tokenIn`: 輸入代幣地址（可選，如果提供了 tokenInSymbol 則不需要）
- `tokenOut`: 輸出代幣地址（可選，如果提供了 tokenOutSymbol 則不需要）
- `slippageTolerance`: 滑點容忍度 (百分比，預設 0.5%)
- `recipient`: 接收代幣的地址 (可選，預設為發送者地址)
- `deadline`: 交易截止時間 (可選，預設為當前時間 + 20 分鐘)
- `privateKey`: 私鑰 (用於簽署交易)

**回傳**：
- 交易哈希
- 交易狀態

## 4. 技術細節

### 4.1 代幣符號到地址的映射方法

我們有幾種方式來實現代幣符號到地址的映射：

1. **內建代幣列表**：
   - 在 `tokenList.ts` 中維護一個 Optimism 上常用代幣的列表
   - 包含代幣符號、地址、小數位數和名稱
   - 優點：不需要外部依賴，速度快
   - 缺點：需要手動更新，可能不包含所有代幣

2. **使用 Uniswap V3 Subgraph**：
   - 透過 GraphQL 查詢 Uniswap V3 Optimism Subgraph
   - 根據代幣符號查詢對應的合約地址
   - 優點：資料最新，包含所有在 Uniswap 上交易的代幣
   - 缺點：依賴外部服務，有速率限制

3. **使用 Token Lists 標準**：
   - 使用 `@uniswap/token-lists` 套件
   - 從 Uniswap 的官方代幣列表或其他來源獲取代幣資訊
   - 優點：包含更多代幣，定期更新
   - 缺點：需要額外依賴，可能需要網路請求

**建議實施方案**：
- 主要使用 Uniswap V3 Subgraph 來查詢代幣符號對應的合約地址
- 結合內建代幣列表作為快取和備用方案
- 提供一個選項，允許使用者直接輸入代幣地址（如果代幣不在列表中）

### 4.2 使用 Subgraph 查詢代幣地址

我們將使用 Uniswap V3 Optimism Subgraph 來查詢代幣符號對應的合約地址：

```javascript
const UNISWAP_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/v3-optimism';

async function getTokenAddressBySymbol(symbol) {
  const query = `
    query {
      tokens(where: { symbol: "${symbol}" }) {
        id
        name
        symbol
        decimals
      }
    }
  `;

  try {
    const response = await fetch(UNISWAP_SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const token = data.data.tokens[0];
    return token ? token.id : null;
  } catch (error) {
    console.error('Failed to fetch token address:', error);
    return null;
  }
}
```

### 4.3 代幣列表來源

作為備用方案，我們可以使用以下來源獲取 Optimism 上的代幣列表：
- Optimism 官方代幣列表：https://static.optimism.io/optimism.tokenlist.json
- Uniswap 的 Optimism 代幣列表：https://gateway.ipfs.io/ipns/tokens.uniswap.org

### 4.4 RPC 提供者

- 使用 Optimism 的 RPC 端點
- 支援公共 RPC 或自定義 RPC
- 預設使用公共 RPC 提供者（如 Infura、Alchemy）

### 4.5 代幣支援

- 預設支援 Optimism 上的主要代幣 (ETH, WETH, USDC, DAI 等)
- 支援自定義代幣

### 4.6 安全考慮

- 私鑰處理 (僅在執行交易時使用)
- 交易簽署在客戶端完成
- 支援使用 Web3 錢包連接

### 4.7 錯誤處理

- 代幣餘額不足
- 流動性不足
- 交易失敗
- RPC 連接問題
- 代幣符號不存在
- Subgraph API 連接問題

## 5. 範例程式碼

我們將在 examples 目錄中提供三個範例：

1. **get-token-info.js**：展示如何查詢代幣資訊
2. **get-quote.js**：展示如何使用 MCP 獲取報價
3. **swap-tokens.js**：展示如何使用 MCP 執行代幣交換

## 6. 依賴項

我們將使用以下依賴項：
- `@uniswap/sdk-core`: Uniswap SDK 核心
- `@uniswap/v3-sdk`: Uniswap V3 SDK
- `@uniswap/token-lists`: Uniswap 代幣列表標準
- `viem`: 與以太坊交互的現代、輕量級庫（替代 ethers）
- `@modelcontextprotocol/sdk`: MCP SDK

### 6.1 使用 viem 而非 ethers 的原因

雖然 Uniswap SDK 的許多範例使用 ethers.js，但我們選擇使用 viem 的原因如下：

1. **更輕量級**：viem 的體積僅為 ethers 的約 1/5，大約 27KB vs 130KB
2. **更好的性能**：viem 在許多操作上比 ethers 更快
3. **更現代的 API**：viem 提供了更現代、更符合 TypeScript 的 API
4. **活躍的維護**：viem 是一個活躍維護的專案，而 ethers v5（Uniswap 範例中使用的版本）已經不再積極維護

Uniswap SDK 本身並不強制要求使用 ethers，它只需要一個符合 EIP-1193 標準的提供者。viem 可以與 Uniswap SDK 一起使用，只需要進行一些適配器轉換。

### 6.2 使用原生 fetch 而非 axios 的原因

我們選擇使用原生的 `fetch` API 而非 `axios` 的原因如下：

1. **減少外部依賴**：使用原生 API 可以減少專案的依賴項
2. **現代瀏覽器和 Node.js 支援**：現代瀏覽器和 Node.js (17.5+) 都已經原生支援 `fetch` API
3. **足夠的功能**：對於我們的需求，原生 `fetch` 已經提供了足夠的功能
4. **更小的包體積**：不需要額外引入 `axios` 庫，減少了最終打包的體積

## 7. 實施步驟

### 漸進式開發方法

我們將採用漸進式開發方法，每完成一個步驟後進行檢查和驗證，確保方向正確後再繼續下一步。這樣可以：

1. **及早發現問題**：在每個階段都能發現並解決問題，避免問題累積
2. **確保方向正確**：如果發現方向有誤，可以及時調整，避免浪費時間
3. **提高開發效率**：每個階段都有明確的目標和驗收標準，使開發更有條理

每個步驟完成後，我們將：
- 檢查功能是否符合預期
- 進行必要的測試
- 確認是否需要調整計畫
- 決定是否繼續下一步驟

### 具體實施步驟

1. **基礎框架搭建與 Mock 功能實現**
   - 修改 src/index.ts，移除天氣相關功能
   - 添加 Uniswap MCP 的基本框架
   - 實現 mock 版本的三個主要功能（get-token-info, get-quote, swap-tokens）
   - 使用固定的回覆數據，確保在 Claude Desktop 中能正常運作
   - **檢查點**：確認 MCP 能在 Claude Desktop 中被正確調用，並返回預期的 mock 數據

2. **實現代幣查詢功能**
   - 創建 subgraph.ts，實現透過 Uniswap V3 Subgraph 查詢代幣符號對應的合約地址
   - 創建 tokenList.ts，實現代幣符號到地址的映射功能（作為備用）
   - 將 get-token-info 功能從 mock 版本升級為實際功能
   - **檢查點**：確認能夠正確查詢代幣資訊，並處理各種錯誤情況

3. **實現報價功能**
   - 創建 providers.ts 和 quoting.ts
   - 實現與 Optimism 網絡的連接
   - 將 get-quote 功能從 mock 版本升級為實際功能
   - **檢查點**：確認能夠正確獲取代幣報價，並處理各種錯誤情況

4. **實現交換功能**
   - 創建 swapping.ts
   - 實現代幣交換的核心邏輯
   - 將 swap-tokens 功能從 mock 版本升級為實際功能
   - **檢查點**：確認能夠正確執行代幣交換，並處理各種錯誤情況

5. **優化與完善**
   - 添加更多錯誤處理和邊界情況處理
   - 優化性能和用戶體驗
   - 完善文檔和註釋
   - **檢查點**：確認所有功能都能正常工作，並且代碼質量符合要求

6. **創建範例程式碼**
   - 創建 get-token-info.js 範例
   - 創建 get-quote.js 範例
   - 創建 swap-tokens.js 範例
   - **檢查點**：確認範例程式碼能夠正確運行，並且對使用者有幫助

7. **全面測試**
   - 進行單元測試
   - 進行集成測試
   - 在 Claude Desktop 中進行端到端測試
   - **檢查點**：確認整個系統能夠穩定運行，並且滿足所有需求

8. **發布與部署**
   - 準備發布版本
   - 更新文檔
   - 部署到目標環境
   - **檢查點**：確認部署成功，並且在目標環境中能夠正常運行 