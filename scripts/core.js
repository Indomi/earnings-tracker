/**
 * AI Earnings Tracker - 核心逻辑 (v2.0)
 * 支持：美股、港股、A股 + 行业板块筛选
 */

const fs = require('fs');
const path = require('path');

// 加载配置
const CONFIG_PATH = path.join(__dirname, '../.config/watchlist.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error('配置文件加载失败:', e.message);
  process.exit(1);
}

/**
 * 获取支持的股市列表
 */
function getMarkets() {
  return Object.keys(config.markets).map(key => ({
    code: key,
    name: config.markets[key].name,
    timezone: config.markets[key].timezone,
    currency: config.markets[key].currency
  }));
}

/**
 * 获取指定股市的行业板块
 */
function getSectors(marketCode) {
  const market = config.markets[marketCode];
  if (!market) return null;
  
  return market.sectors.map(sector => ({
    id: sector.id,
    name: sector.name,
    keywords: sector.keywords,
    companyCount: market.companies.filter(c => c.sector === sector.id).length
  }));
}

/**
 * 获取所有板块（跨市场）
 */
function getAllSectors() {
  const allSectors = new Map();
  
  Object.keys(config.markets).forEach(marketCode => {
    const market = config.markets[marketCode];
    market.sectors.forEach(sector => {
      if (!allSectors.has(sector.id)) {
        allSectors.set(sector.id, {
          id: sector.id,
          name: sector.name,
          markets: []
        });
      }
      allSectors.get(sector.id).markets.push(marketCode);
    });
  });
  
  return Array.from(allSectors.values());
}

/**
 * 按行业板块筛选公司
 */
function getCompaniesBySector(sectorId, marketCode = null) {
  const results = [];
  
  Object.keys(config.markets).forEach(mCode => {
    if (marketCode && mCode !== marketCode) return;
    
    const market = config.markets[mCode];
    const companies = market.companies.filter(c => c.sector === sectorId);
    
    companies.forEach(c => {
      results.push({
        ...c,
        market: mCode,
        marketName: market.name
      });
    });
  });
  
  return results;
}

/**
 * 获取下周日期范围
 */
function getNextWeekRange() {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilNextMonday = (8 - currentDay) % 7 || 7;
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  
  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);
  
  return {
    start: nextMonday,
    end: nextFriday,
    formatted: `${formatDate(nextMonday)} - ${formatDate(nextFriday)}`,
    startFull: formatDateFull(nextMonday),
    endFull: formatDateFull(nextFriday)
  };
}

function formatDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function formatDateFull(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取下周财报预览（支持市场和板块筛选）
 */
async function getWeeklyPreview(options = {}) {
  const { market = null, sector = null } = options;
  const weekRange = getNextWeekRange();
  
  let companies = [];
  
  if (sector) {
    // 按板块筛选
    companies = getCompaniesBySector(sector, market);
  } else if (market) {
    // 按市场筛选
    const m = config.markets[market];
    if (m) {
      companies = m.companies.map(c => ({ ...c, market, marketName: m.name }));
    }
  } else {
    // 所有市场
    Object.keys(config.markets).forEach(mCode => {
      const m = config.markets[mCode];
      companies.push(...m.companies.map(c => ({ 
        ...c, 
        market: mCode, 
        marketName: m.name 
      })));
    });
  }
  
  // 模拟财报数据
  const mockData = generateMockEarnings(companies, weekRange);
  
  const formatted = formatPreviewReport(mockData, weekRange.formatted, { market, sector });
  
  return {
    week: weekRange.formatted,
    companies: mockData,
    formatted,
    market,
    sector,
    raw: mockData
  };
}

/**
 * 生成模拟财报数据
 */
function generateMockEarnings(companies, weekRange) {
  const dates = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(weekRange.start);
    date.setDate(date.getDate() + i);
    dates.push(formatDateFull(date));
  }
  
  return companies.slice(0, 8).map((company, index) => ({
    symbol: company.symbol,
    name: company.name,
    market: company.market,
    marketName: company.marketName,
    sector: company.sector,
    industry: company.industry,
    date: dates[index % dates.length],
    time: index % 2 === 0 ? 'after' : 'pre',
    expectedEPS: (Math.random() * 5 + 0.5).toFixed(2),
    expectedRevenue: `${(Math.random() * 100 + 10).toFixed(1)}`,
    currency: config.markets[company.market]?.currency || 'USD'
  }));
}

/**
 * 查询特定公司
 */
async function queryCompany(symbol, marketCode = null) {
  let company = null;
  let foundMarket = null;
  
  if (marketCode) {
    const m = config.markets[marketCode];
    if (m) {
      company = m.companies.find(c => 
        c.symbol.toLowerCase() === symbol.toLowerCase()
      );
      if (company) foundMarket = marketCode;
    }
  } else {
    // 搜索所有市场
    Object.keys(config.markets).forEach(mCode => {
      if (company) return;
      const m = config.markets[mCode];
      const found = m.companies.find(c => 
        c.symbol.toLowerCase() === symbol.toLowerCase()
      );
      if (found) {
        company = found;
        foundMarket = mCode;
      }
    });
  }
  
  if (!company) {
    return {
      formatted: `❌ 未找到 ${symbol}${marketCode ? ` (${config.markets[marketCode]?.name || marketCode})` : ''}\n\n请检查股票代码是否正确，或使用以下命令查看关注列表：\n• 美股：NVDA, MSFT, AAPL...\n• 港股：00700.HK, 09988.HK...\n• A股：600519, 002594...`,
      found: false
    };
  }
  
  const market = config.markets[foundMarket];
  const mockDate = getMockEarningsDate(company.symbol);
  
  return {
    company: { ...company, market: foundMarket, marketName: market.name },
    market: foundMarket,
    nextEarnings: mockDate,
    formatted: formatCompanyQuery(company, market, mockDate),
    found: true
  };
}

/**
 * 获取模拟财报日期
 */
function getMockEarningsDate(symbol) {
  const today = new Date();
  const daysAhead = symbol.charCodeAt(0) % 30 + 1;
  const date = new Date(today);
  date.setDate(today.getDate() + daysAhead);
  
  return {
    date: formatDateFull(date),
    time: symbol.charCodeAt(0) % 2 === 0 ? 'after' : 'pre',
    expectedEPS: (Math.random() * 5 + 0.5).toFixed(2),
    expectedRevenue: `${(Math.random() * 100 + 10).toFixed(1)}`
  };
}

/**
 * 生成财报摘要
 */
async function generateSummary(symbol, marketCode = null) {
  const query = await queryCompany(symbol, marketCode);
  
  if (!query.found) {
    return { formatted: query.formatted, found: false };
  }
  
  const { company, market } = query;
  const marketConfig = config.markets[market];
  const summaryData = getMockSummaryData(company, marketConfig.currency);
  
  return {
    company,
    market,
    summary: summaryData,
    formatted: formatEarningsSummary(summaryData, marketConfig),
    found: true
  };
}

/**
 * 获取模拟摘要数据
 */
function getMockSummaryData(company, currency) {
  const expectedEPS = (Math.random() * 5 + 0.5).toFixed(2);
  const actualEPS = (parseFloat(expectedEPS) * (0.9 + Math.random() * 0.3)).toFixed(2);
  const expectedRevenue = Math.floor(Math.random() * 100 + 10);
  const actualRevenue = Math.floor(expectedRevenue * (0.95 + Math.random() * 0.15));
  
  const highlights = [
    "核心业务保持稳定增长，市场份额持续扩大",
    "新产品/服务推出，获得市场积极反馈",
    "成本控制效果显著，毛利率同比提升",
    "战略合作持续推进，生态布局完善",
    "研发投入加大，技术创新能力增强"
  ];
  
  const shuffled = highlights.sort(() => 0.5 - Math.random());
  
  return {
    symbol: company.symbol,
    name: company.name,
    quarter: `Q${Math.floor(Math.random() * 4) + 1} ${new Date().getFullYear()}`,
    date: formatDateFull(new Date()),
    time: 'after',
    expectedEPS,
    actualEPS,
    expectedRevenue: `${expectedRevenue}`,
    actualRevenue: `${actualRevenue}`,
    yoyGrowth: `+${Math.floor(Math.random() * 50 + 10)}%`,
    highlights: shuffled.slice(0, 3),
    guidance: `下季度营收预期 ${Math.floor(actualRevenue * 1.05)}${currency} ± 2%`,
    afterHoursMove: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 5).toFixed(1)}%`,
    currency
  };
}

/**
 * 格式化预览报告
 */
function formatPreviewReport(companies, weekRange, options = {}) {
  const { market, sector } = options;
  
  const marketInfo = market ? ` | ${config.markets[market]?.name || market}` : '';
  const sectorInfo = sector ? ` | ${getSectorName(sector)}板块` : '';
  
  const lines = [
    `📊 **下周财报预览 (${weekRange})${marketInfo}${sectorInfo}**`,
    '',
    `共 **${companies.length}** 家公司发布财报：`,
    ''
  ];
  
  if (companies.length === 0) {
    lines.push('⚠️ 该筛选条件下暂无财报安排');
    return lines.join('\n');
  }
  
  // 按日期分组
  const byDate = {};
  companies.forEach(c => {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  });
  
  // 按市场分组显示
  Object.keys(byDate).sort().forEach(date => {
    const dateObj = new Date(date);
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];
    lines.push(`📅 ${date} ${weekday}`);
    lines.push('');
    
    byDate[date].forEach((company, index) => {
      const timeEmoji = company.time === 'pre' ? '🌅' : '🌙';
      const timeText = company.time === 'pre' ? '盘前' : '盘后';
      const marketEmoji = getMarketEmoji(company.market);
      
      lines.push(`${index + 1}. ${marketEmoji} **${company.name} (${company.symbol})**`);
      lines.push(`   ${timeEmoji} ${timeText} | 🏷️ ${company.industry}`);
      lines.push(`   📈 预期EPS: ${company.currency} ${company.expectedEPS} | 预期营收: ${company.expectedRevenue}${company.currency}`);
      lines.push('');
    });
  });
  
  lines.push('---');
  lines.push('💡 **操作提示**：');
  lines.push('• 回复「确认追踪」可自动设置财报提醒');
  lines.push('• 回复公司代码可查看详细信息（如：NVDA）');
  lines.push('• 按板块筛选：「科技板块」「金融板块」等');
  lines.push('• 按市场筛选：「美股」「港股」「A股」');
  
  return lines.join('\n');
}

/**
 * 格式化公司查询
 */
function formatCompanyQuery(company, market, earningsDate) {
  const timeEmoji = earningsDate.time === 'pre' ? '🌅' : '🌙';
  const timeText = earningsDate.time === 'pre' ? '盘前' : '盘后';
  const marketEmoji = getMarketEmoji(market);
  
  return `
${marketEmoji} **${company.name} (${company.symbol})**

🏷️ 市场: ${market.name} | 行业: ${company.industry} | 板块: ${getSectorName(company.sector)}

⏰ **下次财报**
📅 日期: ${earningsDate.date}
${timeEmoji} 时间: ${timeText} (${market.timezone})

📊 **市场预期**
• EPS: ${market.currency} ${earningsDate.expectedEPS}
• 营收: ${earningsDate.expectedRevenue} ${market.currency}

🔍 **关注点**
• ${company.industry}行业整体表现
• 公司核心业务增长情况
• 下季度业绩指引
• 市场竞争格局变化
  `.trim();
}

/**
 * 格式化财报摘要
 */
function formatEarningsSummary(data, marketConfig) {
  const beatEPS = parseFloat(data.actualEPS) >= parseFloat(data.expectedEPS);
  const beatRevenue = parseFloat(data.actualRevenue) >= parseFloat(data.expectedRevenue);
  
  const timeEmoji = data.time === 'pre' ? '🌅' : '🌙';
  const timeText = data.time === 'pre' ? '盘前' : '盘后';
  
  return `
📈 **${data.name} (${data.symbol}) ${data.quarter} 财报摘要**

⏰ 发布时间: ${data.date} ${timeEmoji}${timeText}

📊 **核心指标**
• EPS: ${data.currency} ${data.actualEPS} (预期: ${data.currency} ${data.expectedEPS}) ${beatEPS ? '✅ 超预期' : '❌ 低于预期'}
• 营收: ${data.actualRevenue}${data.currency} (预期: ${data.expectedRevenue}${data.currency}) ${beatRevenue ? '✅ 超预期' : '❌ 低于预期'}
• 同比增速: ${data.yoyGrowth}

🚀 **关键亮点**
${data.highlights.map(h => `• ${h}`).join('\n')}

🎯 **下季度指引**
${data.guidance}

📰 **市场反应**
盘后涨跌: ${data.afterHoursMove}
  `.trim();
}

/**
 * 获取市场emoji
 */
function getMarketEmoji(marketCode) {
  const emojis = {
    us: '🇺🇸',
    hk: '🇭🇰',
    cn: '🇨🇳'
  };
  return emojis[marketCode] || '📈';
}

/**
 * 获取板块名称
 */
function getSectorName(sectorId) {
  const sectorNames = {
    tech: '科技',
    finance: '金融',
    healthcare: '医疗健康',
    consumer: '消费',
    energy: '能源',
    industrial: '工业',
    property: '地产',
    manufacturing: '制造',
    materials: '材料'
  };
  return sectorNames[sectorId] || sectorId;
}

module.exports = {
  getMarkets,
  getSectors,
  getAllSectors,
  getCompaniesBySector,
  getWeeklyPreview,
  queryCompany,
  generateSummary,
  config,
  getNextWeekRange: () => getNextWeekRange()
};
