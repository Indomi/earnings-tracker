#!/usr/bin/env node
/**
 * AI Earnings Tracker - 主入口 (v2.0)
 * 支持：美股、港股、A股 + 行业板块筛选
 */

const { 
  getMarkets, 
  getSectors, 
  getAllSectors,
  getWeeklyPreview, 
  queryCompany, 
  generateSummary 
} = require('./core');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'preview':
      case 'weekly':
        console.log('📊 正在获取下周财报日历...\n');
        const options = parsePreviewOptions(args.slice(1));
        const preview = await getWeeklyPreview(options);
        console.log(preview.formatted);
        break;

      case 'markets':
        console.log('🌍 支持的股市列表\n');
        const markets = getMarkets();
        markets.forEach(m => {
          console.log(`${getMarketEmoji(m.code)} ${m.name} (${m.code.toUpperCase()})`);
          console.log(`   时区: ${m.timezone} | 货币: ${m.currency}`);
          console.log();
        });
        break;

      case 'sectors':
        const marketArg = args[1];
        if (marketArg) {
          console.log(`📂 ${marketArg.toUpperCase()} 市场行业板块\n`);
          const sectors = getSectors(marketArg.toLowerCase());
          if (!sectors) {
            console.error(`❌ 未找到市场: ${marketArg}`);
            console.log('\n可用市场: us, hk, cn');
            process.exit(1);
          }
          sectors.forEach(s => {
            console.log(`• ${s.name} (${s.id})`);
            console.log(`  关键词: ${s.keywords.join('、')}`);
            console.log(`  公司数: ${s.companyCount}`);
            console.log();
          });
        } else {
          console.log('📂 所有行业板块\n');
          const allSectors = getAllSectors();
          allSectors.forEach(s => {
            const marketEmojis = s.markets.map(m => getMarketEmoji(m)).join(' ');
            console.log(`• ${s.name} (${s.id})`);
            console.log(`  覆盖市场: ${marketEmojis}`);
            console.log();
          });
        }
        break;

      case 'sector':
        const sectorId = args[1];
        if (!sectorId) {
          console.error('❌ 请提供板块ID，例如: npm run sector tech');
          process.exit(1);
        }
        console.log(`📂 正在获取${sectorId}板块财报...\n`);
        const sectorPreview = await getWeeklyPreview({ sector: sectorId });
        console.log(sectorPreview.formatted);
        break;

      case 'query':
      case 'company':
        const symbol = args[1];
        const marketFilter = args[2];
        if (!symbol) {
          console.error('❌ 请提供股票代码，例如: npm run query NVDA');
          process.exit(1);
        }
        console.log(`🔍 查询 ${symbol.toUpperCase()}${marketFilter ? ` (${marketFilter.toUpperCase()})` : ''}...\n`);
        const result = await queryCompany(symbol, marketFilter);
        console.log(result.formatted);
        break;

      case 'summary':
      case 'report':
        const sumSymbol = args[1];
        const sumMarket = args[2];
        if (!sumSymbol) {
          console.error('❌ 请提供股票代码，例如: npm run summary NVDA');
          process.exit(1);
        }
        console.log(`📈 生成 ${sumSymbol.toUpperCase()} 财报摘要...\n`);
        const summary = await generateSummary(sumSymbol, sumMarket);
        console.log(summary.formatted);
        break;

      case 'demo':
        const { runDemo } = require('./demo');
        await runDemo();
        break;

      case 'help':
      default:
        console.log(`
🦞 AI Earnings Tracker - 财报追踪器 v2.0
支持：美股 🇺🇸 | 港股 🇭🇰 | A股 🇨🇳

使用方法:
  node index.js <command> [options]

命令:
  preview [market] [sector]  获取下周财报预览
  markets                    列出支持的股市
  sectors [market]           列出行业板块
  sector <sector-id>         按板块查询财报
  query, company <symbol>    查询特定公司
  summary, report <symbol>   生成财报摘要
  demo                       运行演示
  help                       显示帮助

示例:
  node index.js preview                    # 所有市场
  node index.js preview us                 # 仅美股
  node index.js preview hk tech            # 港股科技板块
  node index.js markets                    # 查看支持的市场
  node index.js sectors us                 # 查看美股板块
  node index.js sector tech                # 科技板块财报
  node index.js query NVDA                 # 查询NVDA
  node index.js query 00700.HK             # 查询腾讯
  node index.js query 600519 cn            # 查询茅台(A股)
  node index.js summary NVDA               # NVDA财报摘要

板块ID: tech(科技), finance(金融), healthcare(医疗健康),
        consumer(消费), energy(能源), industrial(工业),
        property(地产), manufacturing(制造), materials(材料)
        `);
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function parsePreviewOptions(args) {
  const options = {};
  if (args.length > 0) options.market = args[0].toLowerCase();
  if (args.length > 1) options.sector = args[1].toLowerCase();
  return options;
}

function getMarketEmoji(code) {
  const emojis = { us: '🇺🇸', hk: '🇭🇰', cn: '🇨🇳' };
  return emojis[code] || '📈';
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = { main };
