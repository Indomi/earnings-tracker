/**
 * Mock Data Source - 模拟数据源
 * 无需配置，用于演示和测试
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

/**
 * 获取模拟财报日历
 */
async function getEarningsCalendar(symbol = null, market = 'us') {
  if (symbol) {
    // 返回特定公司的模拟财报
    const company = findCompany(symbol, market);
    if (!company) return null;
    
    return [{
      symbol: company.symbol,
      name: company.name,
      date: getFutureDate(7),
      time: Math.random() > 0.5 ? 'after' : 'pre',
      expectedEPS: (Math.random() * 5 + 0.5).toFixed(2),
      expectedRevenue: (Math.random() * 100 + 10).toFixed(1),
      currency: config.markets[market]?.currency || 'USD',
      isRealData: false
    }];
  }
  
  // 返回市场内所有公司的模拟财报
  const marketConfig = config.markets[market];
  if (!marketConfig) return [];
  
  return marketConfig.companies.slice(0, 8).map((company, index) => ({
    symbol: company.symbol,
    name: company.name,
    date: getFutureDate(index + 1),
    time: index % 2 === 0 ? 'after' : 'pre',
    expectedEPS: (Math.random() * 5 + 0.5).toFixed(2),
    expectedRevenue: (Math.random() * 100 + 10).toFixed(1),
    currency: marketConfig.currency,
    isRealData: false
  }));
}

/**
 * 获取模拟公司财报详情
 */
async function getCompanyEarnings(symbol, market = 'us') {
  const company = findCompany(symbol, market);
  if (!company) return null;
  
  const expectedEPS = (Math.random() * 5 + 0.5).toFixed(2);
  const actualEPS = (parseFloat(expectedEPS) * (0.9 + Math.random() * 0.3)).toFixed(2);
  const expectedRevenue = Math.floor(Math.random() * 100 + 10);
  const actualRevenue = Math.floor(expectedRevenue * (0.95 + Math.random() * 0.15));
  
  return {
    symbol: company.symbol,
    name: company.name,
    quarter: `Q${Math.floor(Math.random() * 4) + 1} ${new Date().getFullYear()}`,
    date: getFutureDate(7),
    expectedEPS,
    actualEPS,
    expectedRevenue: `${expectedRevenue}`,
    actualRevenue: `${actualRevenue}`,
    yoyGrowth: `+${Math.floor(Math.random() * 50 + 10)}%`,
    beatEPS: parseFloat(actualEPS) >= parseFloat(expectedEPS),
    beatRevenue: actualRevenue >= expectedRevenue,
    highlights: [
      '核心业务保持稳定增长',
      '成本控制效果显著',
      '研发投入持续加大'
    ],
    guidance: `下季度营收预期 ${Math.floor(actualRevenue * 1.05)} ± 2%`,
    afterHoursMove: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 5).toFixed(1)}%`,
    currency: config.markets[market]?.currency || 'USD',
    isRealData: false
  };
}

/**
 * 获取模拟公司信息
 */
async function getCompanyInfo(symbol, market = 'us') {
  const company = findCompany(symbol, market);
  if (!company) return null;
  
  return {
    symbol: company.symbol,
    name: company.name,
    sector: company.sector,
    industry: company.industry,
    market,
    marketName: config.markets[market]?.name || market,
    nextEarningsDate: getFutureDate(7),
    expectedEPS: (Math.random() * 5 + 0.5).toFixed(2),
    expectedRevenue: (Math.random() * 100 + 10).toFixed(1),
    currency: config.markets[market]?.currency || 'USD',
    isRealData: false
  };
}

// 辅助函数
function findCompany(symbol, market) {
  if (market && config.markets[market]) {
    return config.markets[market].companies.find(
      c => c.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }
  
  // 搜索所有市场
  for (const m of Object.keys(config.markets)) {
    const found = config.markets[m].companies.find(
      c => c.symbol.toLowerCase() === symbol.toLowerCase()
    );
    if (found) return { ...found, market: m };
  }
  
  return null;
}

function getFutureDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

module.exports = {
  getEarningsCalendar,
  getCompanyEarnings,
  getCompanyInfo
};
