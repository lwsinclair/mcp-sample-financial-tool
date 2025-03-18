import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const server = new McpServer({
    name: "Financial Data Provider",
    version: "1.0.0"
});

async function getStockPrice(ticker) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=demo`);
        const data = await response.json();

        if (data["Global Quote"] && Object.keys(data["Global Quote"]).length > 0) {
            return {
                ticker: ticker.toUpperCase(),
                data: {
                    price: parseFloat(data["Global Quote"]["05. price"]),
                    change: parseFloat(data["Global Quote"]["09. change"]),
                    percentChange: parseFloat(data["Global Quote"]["10. change percent"].replace('%', '')),
                    volume: parseInt(data["Global Quote"]["06. volume"])
                },
                timestamp: new Date().toISOString(),
                status: "success"
            };
        } else {
            return {
                ticker: ticker.toUpperCase(),
                status: "error",
                message: "Stock data not found or API limit reached"
            };
        }
    } catch (error) {
        return {
            ticker: ticker.toUpperCase(),
            status: "error",
            message: `Error fetching stock data: ${error.message}`
        };
    }
}

async function getCryptoPrice(symbol) {
    try {
        const coinMap = {
            "BTC": "bitcoin",
            "ETH": "ethereum",
            "SOL": "solana",
            "ADA": "cardano",
            "XRP": "ripple",
            "DOGE": "dogecoin",
            "DOT": "polkadot",
            "LINK": "chainlink",
            "UNI": "uniswap",
            "MATIC": "matic-network"
        };

        const coinId = coinMap[symbol.toUpperCase()] || symbol.toLowerCase();

        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
        const data = await response.json();

        if (data.market_data) {
            return {
                symbol: symbol.toUpperCase(),
                data: {
                    price: data.market_data.current_price.usd,
                    change: data.market_data.price_change_24h,
                    percentChange: data.market_data.price_change_percentage_24h,
                    volume: data.market_data.total_volume.usd
                },
                timestamp: new Date().toISOString(),
                status: "success"
            };
        } else {
            return {
                symbol: symbol.toUpperCase(),
                status: "error",
                message: "Cryptocurrency data not found"
            };
        }
    } catch (error) {
        return {
            symbol: symbol.toUpperCase(),
            status: "error",
            message: `Error fetching cryptocurrency data: ${error.message}`
        };
    }
}

async function getForexRate(pair) {
    try {
        const currencies = pair.toUpperCase().split('/');
        if (currencies.length !== 2) {
            return {
                pair: pair.toUpperCase(),
                status: "error",
                message: "Invalid currency pair format. Use format like 'EUR/USD'"
            };
        }

        const baseCurrency = currencies[0];
        const targetCurrency = currencies[1];

        const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        const data = await response.json();

        if (data.result === "success" && data.rates && data.rates[targetCurrency]) {
            return {
                pair: pair.toUpperCase(),
                data: {
                    rate: data.rates[targetCurrency],
                    change: null,
                    percentChange: null
                },
                timestamp: data.time_last_update_utc,
                status: "success"
            };
        } else {
            return {
                pair: pair.toUpperCase(),
                status: "error",
                message: "Forex data not found or invalid currency pair"
            };
        }
    } catch (error) {
        return {
            pair: pair.toUpperCase(),
            status: "error",
            message: `Error fetching forex data: ${error.message}`
        };
    }
}

async function calculateCompoundInterest(principal, rate, time, compoundFrequency) {
    const decimalRate = rate / 100;

    const n = compoundFrequency;
    const r = decimalRate;
    const t = time;
    const p = principal;

    const amount = p * Math.pow(1 + (r / n), n * t);
    const interest = amount - p;

    return {
        principal: p,
        rate: rate,
        time: time,
        compoundFrequency: compoundFrequency,
        finalAmount: amount.toFixed(2),
        interestEarned: interest.toFixed(2),
        status: "success"
    };
}

async function getFinancialNews(category) {
    try {
        const searchTerms = {
            "stocks": "stock+market",
            "crypto": "cryptocurrency",
            "forex": "forex+market",
            "economy": "economy+finance",
            "general": "finance+business"
        };

        const searchTerm = searchTerms[category.toLowerCase()] || "finance";

        const response = await fetch(`https://gnews.io/api/v4/search?q=${searchTerm}&lang=en&max=5&apikey=demo`);
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            return {
                category: category,
                articles: data.articles.map(article => ({
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    publishedAt: article.publishedAt,
                    source: article.source.name
                })),
                timestamp: new Date().toISOString(),
                status: "success"
            };
        } else {
            return {
                category: category,
                status: "error",
                message: "No news found or API limit reached"
            };
        }
    } catch (error) {
        return {
            category: category,
            status: "error",
            message: `Error fetching news: ${error.message}`
        };
    }
}

server.tool('getStockPrice',
    { ticker: z.string().min(1).max(5) },
    async ({ ticker }) => {
        return { content: [{ type: 'text', text: JSON.stringify(await getStockPrice(ticker)) }] };
    }
);

server.tool('getCryptoPrice',
    { symbol: z.string().min(1).max(5) },
    async ({ symbol }) => {
        return { content: [{ type: 'text', text: JSON.stringify(await getCryptoPrice(symbol)) }] };
    }
);

server.tool('getForexRate',
    { pair: z.string().min(5).max(10) },
    async ({ pair }) => {
        return { content: [{ type: 'text', text: JSON.stringify(await getForexRate(pair)) }] };
    }
);

server.tool('calculateCompoundInterest',
    {
        principal: z.number().positive(),
        rate: z.number().positive(),
        time: z.number().positive(),
        compoundFrequency: z.number().int().positive()
    },
    async ({ principal, rate, time, compoundFrequency }) => {
        return { content: [{ type: 'text', text: JSON.stringify(await calculateCompoundInterest(principal, rate, time, compoundFrequency)) }] };
    }
);

server.tool('getFinancialNews',
    { category: z.string().min(1).max(20) },
    async ({ category }) => {
        return { content: [{ type: 'text', text: JSON.stringify(await getFinancialNews(category)) }] };
    }
);

async function init() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Financial Data Provider MCP server is running...");
}

init();