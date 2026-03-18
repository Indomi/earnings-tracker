#!/usr/bin/env node
/**
 * AI Earnings Tracker 演示脚本 (v2.0)
 * 展示三大市场 + 行业板块功能
 */

const { 
  getMarkets, 
  getSectors, 
  getAllSectors,
  getWeeklyPreview, 
  queryCompany, 
  generateSummary 
} = require('./core');

async function runDemo() {
  console.log('='.repeat(70));
  console.log('🦞 AI Earnings Tracker v2.0 完整演示');
  console.log('支持：美股 🇺🇸 | 港股 🇭🇰 | A股 🇨🇳');
  console.log('='.repeat(70));
  console.log();

  // 演示1: 支持的股市列表
  console.log('─'.repeat(70));
  console.log('🌍 演示1: 支持的股市列表');
  console.log('─'.repeat(70));
  console.log();
  
  const markets = getMarkets();
  markets.forEach(m => {
    const emoji = m.code === 'us' ? '🇺🇸' : m.code === 'hk' ? '🇭🇰' : '🇨🇳';
    console.log(`${emoji} ${m.name} (${m.code.toUpperCase()})`);
    console.log(`   时区: ${m.timezone} | 货币: ${m.currency}`);
  });
  console.log();

  // 演示2: 行业板块列表
  console.log('─'.repeat(70));
  console.log('📂 演示2: 行业板块列表（美股）');
  console.log('─'.repeat(70));
  console.log();
  
  const usSectors = getSectors('us');
  usSectors.forEach(s => {
    console.log(`• ${s.name} (${s.id})`);
    console.log(`  关键词: ${s.keywords.join('、')}`);
  });
  console.log();

  // 演示3: 跨市场板块
  console.log('─'.repeat(70));
  console.log('📂 演示3: 跨市场板块覆盖');
  console.log('─'.repeat(70));
  console.log();
  
  const allSectors = getAllSectors();
  allSectors.slice(0, 5).forEach(s => {
    const marketEmojis = s.markets.map(m => {
      if (m === 'us') return '🇺🇸';
      if (m === 'hk') return '🇭🇰';
      return '🇨🇳';
    }).join(' ');
    console.log(`• ${s.name}: ${marketEmojis}`);
  });
  console.log();

  // 演示4: 获取下周财报预览（所有市场）
  console.log('─'.repeat(70));
  console.log('📊 演示4: 获取下周财报预览（所有市场）');
  console.log('─'.repeat(70));
  console.log();
  
  const preview = await getWeeklyPreview();
  console.log(preview.formatted);
  console.log();

  // 演示5: 按市场筛选（美股）
  console.log('─'.repeat(70));
  console.log('📊 演示5: 按市场筛选（美股）');
  console.log('─'.repeat(70));
  console.log();
  
  const usPreview = await getWeeklyPreview({ market: 'us' });
  console.log(usPreview.formatted);
  console.log();

  // 演示6: 按板块筛选（科技）
  console.log('─'.repeat(70));
  console.log('📊 演示6: 按板块筛选（科技板块）');
  console.log('─'.repeat(70));
  console.log();
  
  const techPreview = await getWeeklyPreview({ sector: 'tech' });
  console.log(techPreview.formatted);
  console.log();

  // 演示7: 查询美股公司
  console.log('─'.repeat(70));
  console.log('🔍 演示7: 查询美股公司 (NVDA)');
  console.log('─'.repeat(70));
  console.log();
  
  const nvdaQuery = await queryCompany('NVDA');
  console.log(nvdaQuery.formatted);
  console.log();

  // 演示8: 查询港股公司
  console.log('─'.repeat(70));
  console.log('🔍 演示8: 查询港股公司 (00700.HK - 腾讯)');
  console.log('─'.repeat(70));
  console.log();
  
  const tencentQuery = await queryCompany('00700.HK');
  console.log(tencentQuery.formatted);
  console.log();

  // 演示9: 查询A股公司
  console.log('─'.repeat(70));
  console.log('🔍 演示9: 查询A股公司 (600519 - 茅台)');
  console.log('─'.repeat(70));
  console.log();
  
  const moutaiQuery = await queryCompany('600519', 'cn');
  console.log(moutaiQuery.formatted);
  console.log();

  // 演示10: 生成财报摘要
  console.log('─'.repeat(70));
  console.log('📈 演示10: 生成财报摘要 (NVDA)');
  console.log('─'.repeat(70));
  console.log();
  
  const nvdaSummary = await generateSummary('NVDA');
  console.log(nvdaSummary.formatted);
  console.log();

  console.log('='.repeat(70));
  console.log('✅ 演示完成！支持三大市场 + 行业板块筛选');
  console.log('='.repeat(70));
}

// 如果直接运行
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
