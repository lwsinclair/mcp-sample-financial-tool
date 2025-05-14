[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/prayag2003-mcp-sample-financial-tool-badge.png)](https://mseep.ai/app/prayag2003-mcp-sample-financial-tool)

# Financial Data Provider MCP Server

A Model Context Protocol (MCP) server implementation providing financial data and calculations through various APIs.

## Features

- **Stock Price Data**: Fetch real-time stock prices using Alpha Vantage API
- **Cryptocurrency Data**: Get cryptocurrency prices and stats via CoinGecko API
- **Forex Rates**: Access currency exchange rates through Exchange Rate API
- **Compound Interest Calculator**: Calculate compound interest with customizable parameters
- **Financial News**: Retrieve latest financial news from GNews API

## Available Tools

### 1. getStockPrice

```javascript
{
	ticker: string;
}
```

### 2. getCryptoPrice

```javascript
{
	symbol: string;
}
```

### 3. getForexRate

```javascript
{
	pair: string;
}
```

### 4. calculateCompoundInterest

```javascript
{
    principal: number,
    rate: number,
    time: number,
    compoundFrequency: number
}
```

### 5. getFinancialNews

```javascript
{
	category: string;
}
```

## Setup

1. Install dependencies:

```bash
npm install
pnpm install
```

2. Run the server:

```bash
npm run dev
```

## Note

- The server uses demo API keys for demonstration purposes
- For production use, replace demo API keys with your own
- Some APIs may have rate limits in their free tiers
