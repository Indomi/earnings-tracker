#!/usr/bin/env node
/**
 * Sector Scanner CLI
 * 板块扫描和投资推荐
 */

const { scanSector, getAvailableSectors } = require('./sector-scanner');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'scan':
        const sector = args[1];
        const market = args[2] || 'us';
        const topN = parseInt(args[3]) || 50;
        
        if (!sector) {
          console.error('❌ 请提供板块ID');
          console.log('\n用法: node sector.js scan <sector> [market] [topN]');
          console.log('示例: node sector.js scan tech us 30');
          process.exit(1);
        }
        
        const result = await scanSector(sector, market, topN);
        
        if (result.success) {
          console.log(result.formatted);
        } else {
          console.error(`❌ ${result.message}`);
          console.log('\n💡 提示: 配置真实数据源获取准确数据');
          console.log('   node index.js data-source list');
        }
        break;

      case 'list':
      case 'sectors':
        const m = args[1] || 'us';
        console.log(`📊 ${m.toUpperCase()} 市场可用板块\n`);
        
        const sectors = getAvailableSectors(m);
        
        if (sectors.length === 0) {
          console.log('⚠️ 暂无可用板块数据');
          console.log('当前支持: us (美股)');
        } else {
          sectors.forEach(s => {
            console.log(`• ${s.name} (${s.id}) - ${s.count} 家龙头企业`);
          });
        }
        console.log('\n💡 扫描板块: node sector.js scan <sector>');
        break;

      case 'help':
      default:
        console.log(`
📊 Sector Scanner - 板块扫描器

自动扫描板块内龙头企业，生成投资推荐报告

使用方法:
  node sector.js <command> [options]

命令:
  scan <sector> [market] [topN]  扫描板块并生成推荐
  list, sectors [market]         列出可用板块
  help                           显示帮助

参数:
  sector   - 板块ID: tech(科技), finance(金融), healthcare(医疗),
                      consumer(消费), energy(能源)
  market   - 市场: us (美股,默认), hk (港股), cn (A股)
  topN     - 分析前N家企业 (默认: 50)

示例:
  node sector.js scan tech              # 扫描美股科技板块
  node sector.js scan finance us 30     # 扫描美股金融板块前30家
  node sector.js scan healthcare        # 扫描医疗板块
  node sector.js list                   # 列出可用板块

输出说明:
  🏆 强烈推荐 - 评分70+，业绩优秀，建议重点关注
  👍 推荐     - 评分50-69，表现良好，可考虑配置
  😐 中性     - 评分30-49，表现一般，谨慎观察
  ⚠️ 谨慎     - 评分<30，业绩不佳，建议回避

💡 建议:
  1. 优先关注"强烈推荐"标的
  2. 结合财报发布日期，选择入场时机
  3. 分散投资，不要集中单一股票
  4. 设置止损，控制风险

⚠️ 风险提示: 以上分析仅供参考，不构成投资建议。股市有风险，投资需谨慎。
        `);
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = { main };
