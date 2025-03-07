# Contributing to Uniswap MCP

Thank you for your contribution to the Uniswap MCP project! This document primarily outlines our commit message conventions to ensure that the project's version control history remains clear and consistent.

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for writing commit messages, which helps with automated versioning and changelog generation.

### Basic Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Where:
- `<type>`: Indicates the type of commit
- `<scope>`: (Optional) Indicates the scope of the commit
- `<subject>`: A brief description of the commit content
- `<body>`: (Optional) A detailed description of the commit content
- `<footer>`: (Optional) Used for closing issues or marking breaking changes

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (not affecting code functionality)
- **refactor**: Code refactoring (neither a new feature nor a bug fix)
- **perf**: Performance improvements
- **test**: Adding or modifying tests
- **build**: Changes affecting the build system or external dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes not modifying src or test files

### Scopes

Scopes should be parts of the project that are affected, such as:

- **token-info**: Related to token information
- **quote**: Related to quote functionality
- **swap**: Related to swap functionality
- **subgraph**: Related to Subgraph queries
- **ui**: Related to user interface
- **deps**: Related to dependencies

### Examples

```
feat(token-info): add token info query via Subgraph

Implemented functionality to query token contract addresses using Uniswap V3 Subgraph.
Added error handling and caching mechanisms to improve query efficiency and stability.

Closes #123
```

```
fix(quote): resolve precision issues in quote calculations

Fixed precision errors that could occur when calculating quotes for large token amounts.
Using BigInt instead of Number to handle large values, ensuring calculation accuracy.
```

```
refactor(swap): restructure swap functionality implementation

Split the swap functionality implementation from a single file into multiple modules to improve code maintainability.
Optimized error handling flow to make error messages more clear.
```

### Guidelines

1. **Keep it concise**: The subject line should be brief and clear, not exceeding 50 characters
2. **Use present tense**: Use "add" rather than "added", "fix" rather than "fixed"
3. **No period at the end**: The subject line doesn't need to end with a period
4. **Explain "why" in the body**: Besides describing what was changed, explain why the change was needed
5. **Reference related issues**: If the commit is related to an issue, reference it in the footer

## Branching Strategy

We use the following branching strategy:

- **main**: Main branch containing stable code
- **develop**: Development branch containing the latest development code
- **feature/xxx**: Feature branches for developing new features
- **fix/xxx**: Fix branches for bug fixes
- **refactor/xxx**: Refactor branches for code refactoring

When developing new features or fixing bugs, please create a new feature or fix branch from the develop branch, and submit a Pull Request to the develop branch when complete.

## Pre-commit Checklist

Before committing code, please ensure:

1. The code adheres to the project's coding style
2. All tests pass
3. The commit message follows the conventions outlined above
4. No unnecessary files or changes are included

## Language Guidelines

To maintain consistency and ensure the codebase is accessible to all developers, we follow these language guidelines:

### Code and Comments

- **All code and inline comments must be written in English**
- This includes:
  - Variable, function, and class names
  - Code comments (inline, block, and JSDoc/TSDoc)
  - Error messages
  - Console logs
  - Configuration files

### Documentation

- **Documentation in the `docs/` directory may be written in Traditional Chinese (繁體中文)**
- This includes:
  - User guides
  - API documentation
  - Architecture overviews
  - Implementation plans
  - Development guides

### Examples

✅ **Correct code example:**
```typescript
// Calculate the token price based on the quote
function calculateTokenPrice(amountIn: bigint, amountOut: bigint): number {
  // Convert to decimal representation for display
  return Number(amountOut) / Number(amountIn);
}
```

❌ **Incorrect code example:**
```typescript
// 根據報價計算代幣價格
function 計算代幣價格(輸入金額: bigint, 輸出金額: bigint): number {
  // 轉換為小數表示以便顯示
  return Number(輸出金額) / Number(輸入金額);
}
```

Thank you for your contribution! 