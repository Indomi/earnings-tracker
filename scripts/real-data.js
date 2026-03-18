/**
 * Real Data API Module for Earnings Tracker
 * 接入真实财报数据源
 */

const { execSync } = require('child_process');
const path = require('path');

// 加载新浪财经数据源（国内直接访问）
let sinaDataSource;
try {
  sinaDataSource = require('./data-sources/sina');
} catch (e) {
  console.warn('新浪财经数据源加载失败:', e.message);
}

/**
 * 通过 Web Search 获取真实财报日历
 * @param {string} symbol - 股票代码（可选）
 * @param {string} market - 市场代码（us/hk/cn）
 */
async function getRealEarningsCalendar(symbol = null, market = 'us') {
  let searchQuery;
  
  if (symbol) {
    // 查询特定公司
    searchQuery = `${symbol} earnings date next report ${getMarketSuffix(market)}`;
  } else {
    // 获取下周财报日历
    const nextWeek = getNextWeekDateRange();
    searchQuery = `earnings calendar ${nextWeek} ${getMarketSuffix(market)}`;
  }
  
  try {
    const searchScript = path.join(__dirname, '../../coze-web-search/scripts/search.ts');
    const result = execSync(
      `npx ts-node "${searchScript}" -q "${searchQuery}" --count 15`,
      { encoding: 'utf8', timeout: 60000 }
    );
    
    // 解析搜索结果
    return parseSearchResults(result, symbol);
  } catch (error) {
    console.error('获取真实数据失败:', error.message);
    return null;
  }
}

/**
 * 获取特定公司的财报数据
 */
async function getRealCompanyEarnings(symbol, market = 'us') {
  // 优先使用新浪财经数据源（国内可用）
  if (sinaDataSource) {
    try {
      console.log(`📡 尝试从新浪财经获取 ${symbol} 数据...`);
      const sinaData = await sinaDataSource.getCompanyInfo(symbol, market);
      if (sinaData) {
        return {
          symbol: sinaData.symbol,
          name: sinaData.name,
          price: sinaData.price,
          market: sinaData.market,
          latestEPS: 'N/A',
          latestRevenue: 'N/A',
          nextEarningsDate: sinaData.nextEarningsDate,
          growth: 'N/A',
          isRealData: true,
          source: '新浪财经'
        };
      }
    } catch (e) {
      console.warn('新浪财经获取失败:', e.message);
    }
  }
  
  // 回退到 Web Search
  const queries = [
    `${symbol} Q4 2025 earnings EPS revenue ${getMarketSuffix(market)}`,
    `${symbol} latest earnings results beat miss ${getMarketSuffix(market)}`,
    `${symbol} 财报 业绩 EPS 营收 ${getMarketSuffix(market)}`
  ];
  
  const results = [];
  
  for (const query of queries) {
    try {
      const searchScript = path.join(__dirname, '../../coze-web-search/scripts/search.ts');
      const result = execSync(
        `npx ts-node "${searchScript}" -q "${query}" --count 10`,
        { encoding: 'utf8', timeout: 60000 }
      );
      results.push(result);
    } catch (e) {
      // 忽略错误，继续下一个查询
    }
  }
  
  return mergeAndParseResults(results, symbol);
}

/**
 * 解析搜索结果
 */
function parseSearchResults(searchOutput, symbol) {
  const lines = searchOutput.split('\n');
  const earnings = [];
  
  // 简单解析逻辑 - 提取标题中包含 earnings 的结果
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测财报相关标题
    if (line.includes('earnings') || line.includes('财报') || line.includes('业绩')) {
      const nextLine = lines[i + 1] || '';
      const urlMatch = nextLine.match(/URL:\s*(.+)/);
      const dateMatch = line.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
      
      if (urlMatch) {
        earnings.push({
          title: line.trim(),
          url: urlMatch[1].trim(),
          date: dateMatch ? dateMatch[1] : null,
          symbol: symbol
        });
      }
    }
  }
  
  return earnings;
}

/**
 * 合并并解析多个搜索结果
 */
function mergeAndParseResults(results, symbol) {
  const merged = {
    symbol,
    reports: [],
    latestEPS: null,
    latestRevenue: null,
    nextEarningsDate: null,
    growth: null
  };
  
  for (const result of results) {
    const lines = result.split('\n');
    
    for (const line of lines) {
      // 提取EPS
      const epsMatch = line.match(/EPS[:\s]+\$?([\d.]+)/i);
      if (epsMatch) merged.latestEPS = epsMatch[1];
      
      // 提取营收
      const revenueMatch = line.match(/revenue[:\s]+\$?([\d.]+)\s*(B|M)/i);
      if (revenueMatch) {
        merged.latestRevenue = `${revenueMatch[1]}${revenueMatch[2]}`;
      }
      
      // 提取增长率
      const growthMatch = line.match(/(?:growth|增长)[:\s]+([+\-]?\d+)%/i);
      if (growthMatch) merged.growth = `${growthMatch[1]}%`;
      
      // 提取下次财报日期
      const dateMatch = line.match(/next earnings[:\s]+(\w+ \d{1,2},? \d{4})/i);
      if (dateMatch) merged.nextEarningsDate = dateMatch[1];
    }
  }
  
  return merged;
}

/**
 * 获取下周日期范围
 */
function getNextWeekDateRange() {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const start = new Date(nextWeek);
  start.setDate(nextWeek.getDate() - nextWeek.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  
  const formatDate = (d) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  return `${formatDate(start)} to ${formatDate(end)}`;
}

/**
 * 获取市场后缀
 */
function getMarketSuffix(market) {
  const suffixes = {
    us: '',
    hk: 'HKEX Hong Kong',
    cn: 'A-share China'
  };
  return suffixes[market] || '';
}

/**
 * 获取真实财报数据（带缓存）
 */
async function getRealEarningsData(symbol, market = 'us') {
  console.log(`🔍 正在获取 ${symbol} 的真实数据...`);
  
  const data = await getRealCompanyEarnings(symbol, market);
  
  if (!data || (!data.price && !data.latestEPS && !data.nextEarningsDate)) {
    console.log(`⚠️ 未找到 ${symbol} 的实时数据`);
    return null;
  }
  
  console.log(`✅ 成功获取 ${symbol} 的${data.source || '真实'}数据`);
  return data;
}

module.exports = {
  getRealEarningsCalendar,
  getRealCompanyEarnings,
  getRealEarningsData,
  getNextWeekDateRange
};
