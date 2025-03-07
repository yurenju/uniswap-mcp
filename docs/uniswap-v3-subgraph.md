<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# 

---

# 我想知道 Uniswap V3 Subgraph 的用法怎麼在這個情境使用

要透過 Uniswap V3 Subgraph 查詢 Optimism 鏈上的代幣合約地址，可依以下步驟整合至您的應用程式：

---

### **1. 確認 Subgraph 端點**

Uniswap V3 在 Optimism 鏈的 Subgraph 端點為：

```
https://api.thegraph.com/subgraphs/name/uniswap/v3-optimism
```

此端點專門索引 Optimism 鏈上 Uniswap V3 的交易對、流動性池及代幣資料[^3][^9]。

---

### **2. 撰寫 GraphQL 查詢**

使用以下查詢結構，根據代幣名稱或符號過濾結果：

```graphql
query GetTokenInfo($symbol: String!) {
  tokens(where: { symbol: $symbol }) {
    id
    name
    symbol
    decimals
  }
}
```

- **參數說明**：
    - `$symbol`：代幣符號（如 `USDC`）
- **返回字段**：
    - `id`：代幣合約地址
    - `symbol`/`name`：代幣符號與全稱
    - `decimals`：代幣精度

---

### **3. 整合程式碼範例（JavaScript）**

使用 `axios` 或 Apollo Client 發送 GraphQL 請求：

```javascript
import axios from 'axios';

const UNISWAP_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/v3-optimism';

async function fetchTokenAddress(symbol) {
  const query = `
    query GetTokenInfo($symbol: String!) {
      tokens(where: { symbol: $symbol }) {
        id
      }
    }
  `;

  try {
    const response = await axios.post(UNISWAP_SUBGRAPH_URL, {
      query,
      variables: { symbol }
    });
    return response.data.data.tokens[^0]?.id || 'Token not found';
  } catch (error) {
    console.error('Query failed:', error);
    return 'Error fetching data';
  }
}

// 使用範例
fetchTokenAddress('USDC').then(console.log); // 輸出：0x7F5c764cBc14f9669B88837ca1490cCa17c31607
```

---

### **4. 技術要點解析**

#### **Subgraph 數據結構**

- **`tokens` 表**：儲存所有代幣的合約地址、符號、流動性池數量等[^3][^6]。
- **`pools` 表**：可進一步查詢代幣對應的流動性池（如 USDC/WETH），獲取交易量與手續費層級（0.05%, 0.30%, 1%）[^5][^6]。


#### **跨鏈索引機制**

- Uniswap V3 Subgraph 透過 **Optimism 的 Layer 2 架構**索引數據，交易費用以太坊主網低 10 倍，且支持即時查詢[^7][^9]。
- 數據更新頻率取決於區塊確認速度，通常延遲在數十秒內[^3][^10]。

---

### **5. 進階應用場景**

#### **多代幣批次查詢**

擴展查詢以一次獲取多個代幣地址：

```graphql
query GetMultipleTokens($symbols: [String!]!) {
  tokens(where: { symbol_in: $symbols }) {
    id
    symbol
  }
}
```


#### **整合快取層**

為避免頻繁呼叫 Subgraph API，可加入 Redis 或本地快取：

```javascript
const tokenCache = new Map();

async function getTokenWithCache(symbol) {
  if (tokenCache.has(symbol)) {
    return tokenCache.get(symbol);
  }
  const address = await fetchTokenAddress(symbol);
  tokenCache.set(symbol, address);
  return address;
}
```

---

### **6. 錯誤處理與限制**

- **代幣不存在**：若查無結果，返回 `null` 並提示用戶確認代幣符號。
- **速率限制**：免費版 Subgraph API 每分鐘限 30 次請求，高頻使用需部署自建索引節點[^3][^8]。
- **數據延遲**：Optimism 的狀態根約每 5 分鐘提交至以太坊主網，極端情況下可能影響數據即時性[^7][^10]。

---

透過上述方法，可高效整合 Uniswap V3 Subgraph 至 Optimism 代幣查詢服務，並根據需求擴展至流動性分析或歷史交易數據檢索。

<div style="text-align: center">⁂</div>

[^1]: https://learnblockchain.cn/article/2118

[^2]: https://coinmarketcap.com/zh-tw/exchanges/uniswap-v3-optimism/

[^3]: https://thegraph.com/explorer/subgraphs/EgnS9YE1avupkvCNj9fHnJxppfEmNNywYJtghqiu2pd9?view=Query\&chain=arbitrum-one

[^4]: https://cn.bitdegree.org/dingji-jiamihuobi-jiaoyisuo/uniswap-v3-optimism

[^5]: https://www.coolwallet.io/zh/blogs/blog/what-is-uniswap-v3

[^6]: https://www.coingecko.com/zh-tw/交易平台/uniswap-v3-optimism

[^7]: https://blog.csdn.net/uid66com/article/details/124254674

[^8]: https://news.cnyes.com/news/id/5190442

[^9]: https://blog.csdn.net/Overbit/article/details/117358387

[^10]: https://support.token.im/hc/zh-tw/articles/4403902897945-Uniswap-V3-部署至-Optimism

[^11]: https://vocus.cc/article/63ea1ca6fd89780001594f5d

[^12]: https://learnblockchain.cn/article/2824

[^13]: https://www.qkxia.com/art20223783/

