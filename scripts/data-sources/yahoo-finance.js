/**
 * Yahoo Finance Data Source
 * 使用 yahoo-finance2 库获取免费数据
 * 安装: npm install yahoo-finance2
 * 文档: https://github.com/gadicc/node-yahoo-finance2
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../.config/watchlist.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  config = { markets: {} };
}

let yahooFinance;
try {
  yahooFinance = require('yahoo-finance2').default;
} catch (e) {
  console.warn('yahoo-finance2 未安装，请运行: npm install yahoo-finance2');
}

/**
 * 获取财报日历
 */
async function getEarningsCalendar(symbol = null, market = 'us') {
  if (!yahooFinance) {
    throw new Error('yahoo-finance2 未安装。运行: npm install yahoo-finance2');
  }
  
  try {
    if (symbol) {
      // 获取特定公司的财报日期
      const quote = await yahooFinance.quote(symbol);
      
      return [{
        symbol: quote.symbol,
        name: quote.longName || quote.shortName || quote.symbol,
        date: quote.earningsDate ? new Date(quote.earningsDate).toISOString().split('T')[0] : 'N/A',
        time: 'after',
        expectedEPS: quote.epsForward || 'N/A',
        expectedRevenue: 'N/A', // Yahoo Finance 不直接提供预期营收
        currency: quote.currency || 'USD',
        isRealData: true,
        source: 'Yahoo Finance'
      }];
    } else {
      // Yahoo Finance 不提供批量财报日历，需要逐个查询
      // 返回关注列表中的前5个
      const usCompanies = config.markets.us?.companies.slice(0, 5) || [];
      const results = [];
      
      for (const company of usCompanies) {
        try {
          const quote = await yahooFinance.quote(company.symbol);
          if (quote.earningsDate) {
            results.push({
              symbol: quote.symbol,
              name: quote.longName || quote.shortName || quote.symbol,
              date: new Date(quote.earningsDate).toISOString().split('T')[0],
              time: 'after',
              expectedEPS: quote.epsForward || 'N/A',
              expectedRevenue: 'N/A',
              currency: quote.currency || 'USD',
              isRealData: true,
              source: 'Yahoo Finance'
            });
          }
        } catch (e) {
          // 忽略单个查询错误
        }
      }
      
      return results;
    }
  } catch (error) {
    console.error('Yahoo Finance 错误:', error.message);
    return null;
  }
}

/**
 * 获取公司财报详情
 */
async function getCompanyEarnings(symbol, market = 'us') {
  if (!yahooFinance) {
    throw new Error('yahoo-finance2 未安装');
  }
  
  try {
    // 获取 quote 和基本面数据
    const quote = await yahooFinance.quote(symbol);
    
    // 尝试获取财务报表
    let financials = null;
    try {
      financials = await yahooFinance.fundamentalsTimeSeries(symbol, {
        period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period2: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      // 财务报表可能不可用
    }
    
    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      quarter: 'N/A',
      date: quote.earningsDate ? new Date(quote.earningsDate).toISOString().split('T')[0] : 'N/A',
      expectedEPS: quote.epsForward || quote.epsCurrentYear || 'N/A',
      actualEPS: quote.epsTrailingTwelveMonths || 'N/A',
      expectedRevenue: 'N/A',
      actualRevenue: 'N/A',
      yoyGrowth: quote.earningsGrowth ? (quote.earningsGrowth * 100).toFixed(1) + '%' : 'N/A',
      highlights: [
        `Trailing EPS: ${quote.epsTrailingTwelveMonths || 'N/A'}`,
        `Forward EPS: ${quote.epsForward || 'N/A'}`,
        `PE Ratio: ${quote.trailingPE || quote.forwardPE || 'N/A'}`,
        `Market Cap: ${quote.marketCap ? (quote.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A'}`
      ],
      guidance: `Earnings Growth: ${quote.earningsGrowth ? (quote.earningsGrowth * 100).toFixed(1) + '%' : 'N/A'}`,
      afterHoursMove: `${quote.regularMarketChangePercent ? (quote.regularMarketChangePercent).toFixed(2) : 0}%`,
      currency: quote.currency || 'USD',
      isRealData: true,
      source: 'Yahoo Finance'
    };
  } catch (error) {
    console.error('Yahoo Finance 错误:', error.message);
    return null;
  }
}

/**
 * 获取公司信息
 */
async function getCompanyInfo(symbol, market = 'us') {
  if (!yahooFinance) {
    throw new Error('yahoo-finance2 未安装');
  }
  
  try {
    const quote = await yahooFinance.quote(symbol);
    
    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      sector: quote.sector,
      industry: quote.industry,
      market: market,
      marketName: quote.exchange,
      nextEarningsDate: quote.earningsDate ? new Date(quote.earningsDate).toISOString().split('T')[0] : 'N/A',
      expectedEPS: quote.epsForward || 'N/A',
      expectedRevenue: 'N/A',
      currency: quote.currency || 'USD',
      description: quote.longBusinessSummary,
      website: quote.website,
      marketCap: quote.marketCap ? (quote.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A',
      isRealData: true,
      source: 'Yahoo Finance'
    };
  } catch (error) {
    console.error('Yahoo Finance 错误:', error.message);
    return null;
  }
}

module.exports = {
  getEarningsCalendar,
  getCompanyEarnings,
  getCompanyInfo
};
