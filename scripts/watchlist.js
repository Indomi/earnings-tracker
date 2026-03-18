#!/usr/bin/env node
/**
 * Watchlist Management CLI
 * 管理关注股票列表
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../.config/watchlist.json');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('配置文件加载失败:', e.message);
    process.exit(1);
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error('保存配置失败:', e.message);
    return false;
  }
}

/**
 * 添加股票到关注列表
 */
function addStock(symbol, name, market, sector = 'tech', industry = '其他') {
  const config = loadConfig();
  
  market = market.toLowerCase();
  
  if (!config.markets[market]) {
    console.error(`❌ 未知市场: ${market}`);
    console.log('可用市场: us (美股), hk (港股), cn (A股)');
    return false;
  }
  
  // 检查是否已存在
  const existing = config.markets[market].companies.find(
    c => c.symbol.toLowerCase() === symbol.toLowerCase()
  );
  
  if (existing) {
    console.log(`⚠️ ${symbol} 已在关注列表中`);
    return false;
  }
  
  // 添加新股票
  config.markets[market].companies.push({
    symbol: symbol.toUpperCase(),
    name: name || symbol.toUpperCase(),
    sector,
    industry
  });
  
  if (saveConfig(config)) {
    console.log(`✅ 已添加 ${symbol}${name ? ` (${name})` : ''} 到 ${config.markets[market].name}关注列表`);
    return true;
  }
  
  return false;
}

/**
 * 从关注列表移除股票
 */
function removeStock(symbol, market) {
  const config = loadConfig();
  
  market = market.toLowerCase();
  
  if (!config.markets[market]) {
    console.error(`❌ 未知市场: ${market}`);
    return false;
  }
  
  const initialLength = config.markets[market].companies.length;
  config.markets[market].companies = config.markets[market].companies.filter(
    c => c.symbol.toLowerCase() !== symbol.toLowerCase()
  );
  
  if (config.markets[market].companies.length === initialLength) {
    console.log(`⚠️ ${symbol} 不在关注列表中`);
    return false;
  }
  
  if (saveConfig(config)) {
    console.log(`✅ 已从关注列表移除 ${symbol}`);
    return true;
  }
  
  return false;
}

/**
 * 列出关注列表
 */
function listWatchlist(market = null) {
  const config = loadConfig();
  
  console.log('📋 当前关注列表\n');
  
  const markets = market ? [market.toLowerCase()] : Object.keys(config.markets);
  
  for (const m of markets) {
    if (!config.markets[m]) continue;
    
    const marketConfig = config.markets[m];
    const emoji = m === 'us' ? '🇺🇸' : m === 'hk' ? '🇭🇰' : '🇨🇳';
    
    console.log(`${emoji} ${marketConfig.name} (${m.toUpperCase()}) - ${marketConfig.companies.length} 只股票`);
    console.log('─'.repeat(50));
    
    marketConfig.companies.forEach((c, i) => {
      console.log(`${i + 1}. ${c.symbol} - ${c.name} (${c.industry})`);
    });
    
    console.log();
  }
  
  const total = Object.values(config.markets).reduce(
    (sum, m) => sum + m.companies.length, 0
  );
  console.log(`总计: ${total} 只股票\n`);
}

/**
 * 搜索股票是否已存在
 */
function searchStock(symbol) {
  const config = loadConfig();
  
  for (const [marketCode, market] of Object.entries(config.markets)) {
    const found = market.companies.find(
      c => c.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    if (found) {
      const emoji = marketCode === 'us' ? '🇺🇸' : marketCode === 'hk' ? '🇭🇰' : '🇨🇳';
      console.log(`✅ 找到: ${emoji} ${found.symbol} - ${found.name} (${market.name})`);
      return true;
    }
  }
  
  console.log(`❌ ${symbol} 不在关注列表中`);
  return false;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'add':
      if (args.length < 3) {
        console.error('❌ 用法: node watchlist.js add <symbol> <market> [name] [sector] [industry]');
        console.log('示例:');
        console.log('  node watchlist.js add INTC us "英特尔" tech 芯片');
        console.log('  node watchlist.js add 09888 hk 百度集团 tech 搜索');
        process.exit(1);
      }
      
      const [symbol, market, name, sector, industry] = args.slice(1);
      addStock(symbol, name, market, sector || 'tech', industry || '其他');
      break;
      
    case 'remove':
    case 'rm':
      if (args.length < 3) {
        console.error('❌ 用法: node watchlist.js remove <symbol> <market>');
        process.exit(1);
      }
      removeStock(args[1], args[2]);
      break;
      
    case 'list':
    case 'ls':
      listWatchlist(args[1]);
      break;
      
    case 'search':
    case 'find':
      if (args.length < 2) {
        console.error('❌ 用法: node watchlist.js search <symbol>');
        process.exit(1);
      }
      searchStock(args[1]);
      break;
      
    case 'help':
    default:
      console.log(`
📋 Watchlist Management - 关注列表管理

使用方法:
  node watchlist.js <command> [options]

命令:
  add <symbol> <market> [name] [sector] [industry]  添加股票
  remove, rm <symbol> <market>                     移除股票
  list, ls [market]                                列出关注列表
  search, find <symbol>                            搜索股票
  help                                             显示帮助

参数:
  symbol   - 股票代码 (如: NVDA, 00700.HK, 600519)
  market   - 市场代码: us (美股), hk (港股), cn (A股)
  name     - 公司名称 (可选)
  sector   - 板块ID (可选, 默认: tech)
  industry - 行业 (可选, 默认: 其他)

板块ID: tech(科技), finance(金融), healthcare(医疗健康),
        consumer(消费), energy(能源), industrial(工业),
        property(地产), manufacturing(制造), materials(材料)

示例:
  node watchlist.js add INTC us "英特尔" tech 芯片
  node watchlist.js add PLTR us "Palantir" tech 大数据
  node watchlist.js add 09888 hk "百度集团" tech 搜索
  node watchlist.js add 300750 cn "宁德时代" energy 动力电池
  node watchlist.js list
  node watchlist.js list us
  node watchlist.js search NVDA
  node watchlist.js remove INTC us
`);
  }
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = { addStock, removeStock, listWatchlist, searchStock };
