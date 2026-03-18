#!/usr/bin/env node
/**
 * Data Source Management CLI
 * 管理数据源配置
 */

const { 
  listDataSources, 
  switchDataSource, 
  testDataSource,
  getActiveDataSource 
} = require('./data-source-factory');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'list':
      case 'ls':
        console.log('📊 可用的数据源\n');
        const sources = listDataSources();
        
        sources.forEach((source, index) => {
          const status = source.isActive ? '✅ 当前使用' : (source.enabled ? '⚡ 可用' : '⏸️  禁用');
          const apiKeyStatus = source.needsApiKey ? (source.id === 'mock' || source.id === 'yahooFinance' || source.id === 'webSearch' ? '' : '🔑 需要 API Key') : '';
          
          console.log(`${index + 1}. ${source.name}`);
          console.log(`   ID: ${source.id}`);
          console.log(`   状态: ${status}`);
          console.log(`   免费额度: ${source.freeTier}`);
          if (apiKeyStatus) console.log(`   ${apiKeyStatus}`);
          console.log();
        });
        
        console.log('💡 切换数据源: node data-source.js switch <id>');
        console.log('💡 测试数据源: node data-source.js test');
        break;

      case 'switch':
      case 'use':
        const provider = args[1];
        if (!provider) {
          console.error('❌ 请提供数据源 ID，例如: node data-source.js switch fmp');
          console.log('\n可用的 ID:');
          console.log('  mock - 模拟数据');
          console.log('  fmp - Financial Modeling Prep');
          console.log('  alphaVantage - Alpha Vantage');
          console.log('  yahooFinance - Yahoo Finance');
          console.log('  polygon - Polygon.io');
          console.log('  webSearch - Web Search');
          process.exit(1);
        }
        
        console.log(`🔄 正在切换到 ${provider}...\n`);
        const result = switchDataSource(provider);
        
        if (result.success) {
          console.log(`✅ ${result.message}`);
          console.log('\n配置信息:');
          console.log(JSON.stringify(result.config, null, 2));
        } else {
          console.error(`❌ ${result.message}`);
        }
        break;

      case 'test':
        console.log('🧪 测试当前数据源连接...\n');
        const testResult = await testDataSource();
        
        if (testResult.success) {
          console.log(`✅ ${testResult.message}`);
          console.log('\n示例数据:');
          console.log(JSON.stringify(testResult.sample, null, 2));
        } else {
          console.error(`❌ ${testResult.message}`);
          if (testResult.error) {
            console.error('\n错误详情:', testResult.error);
          }
        }
        break;

      case 'current':
        const current = getActiveDataSource();
        console.log('📍 当前数据源\n');
        console.log(`提供商: ${current.provider}`);
        console.log(`配置:`, JSON.stringify(current.options, null, 2));
        break;

      case 'help':
      default:
        console.log(`
📊 Data Source Management - 数据源管理

使用方法:
  node data-source.js <command> [options]

命令:
  list, ls          列出所有可用的数据源
  switch, use <id>  切换到指定数据源
  test              测试当前数据源连接
  current           显示当前数据源
  help              显示帮助

示例:
  node data-source.js list
  node data-source.js switch fmp
  node data-source.js test

数据源 ID:
  mock            - 模拟数据（无需配置）
  fmp             - Financial Modeling Prep（推荐）
  alphaVantage    - Alpha Vantage
  yahooFinance    - Yahoo Finance（无需 API Key）
  polygon         - Polygon.io
  webSearch       - Web Search（无需 API Key）

配置 API Key:
  编辑 .config/watchlist.json 中的 dataSource.options.<provider>.apiKey
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
