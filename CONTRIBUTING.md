# Contributing to Uniswap MCP

感謝你對 Uniswap MCP 專案的貢獻！本文件主要說明我們的 commit message 規範，以確保專案的版本控制歷史清晰且一致。

## Commit Message 規範

我們採用 [Conventional Commits](https://www.conventionalcommits.org/) 規範來撰寫 commit message，這有助於自動化版本控制和變更日誌生成。

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

其中：
- `<type>`: 表示 commit 的類型
- `<scope>`: (可選) 表示 commit 影響的範圍
- `<subject>`: 簡短描述 commit 的內容
- `<body>`: (可選) 詳細描述 commit 的內容
- `<footer>`: (可選) 用於關閉 issue 或標記 breaking changes

### Commit 類型

- **feat**: 新功能
- **fix**: 錯誤修復
- **docs**: 文檔更新
- **style**: 代碼風格變更（不影響代碼功能）
- **refactor**: 代碼重構（既不是新功能，也不是錯誤修復）
- **perf**: 性能優化
- **test**: 添加或修改測試
- **build**: 影響構建系統或外部依賴的變更
- **ci**: 持續集成相關的變更
- **chore**: 其他不修改 src 或 test 的變更

### 範圍

範圍應該是專案中受影響的部分，例如：

- **token-info**: 代幣資訊相關
- **quote**: 報價功能相關
- **swap**: 交換功能相關
- **subgraph**: Subgraph 查詢相關
- **ui**: 用戶界面相關
- **deps**: 依賴項相關

### 範例

```
feat(token-info): 添加透過 Subgraph 查詢代幣資訊的功能

實現了使用 Uniswap V3 Subgraph 查詢代幣符號對應的合約地址的功能。
添加了錯誤處理和快取機制，以提高查詢效率和穩定性。

Closes #123
```

```
fix(quote): 修復報價計算中的精度問題

修復了在計算大額代幣報價時可能出現的精度誤差問題。
使用 BigInt 替代 Number 來處理大數值，確保計算的準確性。
```

```
refactor(swap): 重構交換功能的實現

將交換功能的實現從單一文件拆分為多個模塊，提高代碼的可維護性。
優化了錯誤處理流程，使錯誤信息更加明確。
```

### 注意事項

1. **保持簡潔**：subject 行應該簡短明了，不超過 50 個字符
2. **使用現在時態**：使用「添加」而非「添加了」，「修復」而非「修復了」
3. **不要以句號結尾**：subject 行不需要以句號結尾
4. **在 body 中解釋「為什麼」**：除了描述變更內容，也解釋為什麼需要這個變更
5. **引用相關 issue**：如果 commit 與某個 issue 相關，在 footer 中引用它

## 分支策略

我們使用以下分支策略：

- **main**: 主分支，包含穩定的代碼
- **develop**: 開發分支，包含最新的開發代碼
- **feature/xxx**: 功能分支，用於開發新功能
- **fix/xxx**: 修復分支，用於修復錯誤
- **refactor/xxx**: 重構分支，用於代碼重構

開發新功能或修復錯誤時，請從 develop 分支創建新的功能分支或修復分支，完成後提交 Pull Request 到 develop 分支。

## 提交前檢查

在提交代碼前，請確保：

1. 代碼符合專案的代碼風格
2. 所有測試都能通過
3. Commit message 符合上述規範
4. 不包含不必要的文件或變更

感謝你的貢獻！ 