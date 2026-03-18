# Earnings Tracker - AI财报追踪器

> AI-powered earnings calendar tracker for US, HK, and CN markets with sector filtering.
> 自动追踪美股、港股、A股三大市场财报，支持行业板块筛选的AI财报追踪器。

**[English](#english) | [中文](#中文)**

---

<a name="english"></a>
## English

### What is this?

Earnings Tracker is an AI-powered tool that automatically monitors earnings announcements across three major stock markets (US, Hong Kong, and China A-shares) with intelligent sector filtering.

### Features

- 🌍 **Three Markets**: US stocks 🇺🇸 | Hong Kong stocks 🇭🇰 | China A-shares 🇨🇳
- 🏷️ **Sector Filtering**: 9 major sectors including Tech, Finance, Consumer, Healthcare
- 🤖 **AI Summary**: Auto-generates structured earnings reports with key metrics
- 📱 **Notifications**: Push to Feishu/Lark for mobile access
- 💱 **Multi-Currency**: USD / HKD / CNY with proper timezone handling

### Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] OpenClaw or compatible agent framework
- [ ] Web search capability (coze-web-search or similar)
- [ ] Messaging integration (Feishu/Telegram/Slack optional)

### Installation

```bash
# Install via skills CLI
npx skills add <your-github>/earnings-tracker

# Or clone manually
git clone https://github.com/<your-github>/earnings-tracker.git
cd earnings-tracker
```

### Usage Examples

**Get next week's earnings calendar:**
```
User: "Get next week's earnings calendar"
→ Returns all markets with company names, symbols, dates, and expected metrics
```

**Filter by market:**
```
User: "What are the US stock earnings next week?"
→ Returns only US stocks
```

**Filter by sector:**
```
User: "Show me tech sector earnings"
→ Returns tech companies across all three markets
```

**Query specific company:**
```
User: "When does NVDA report earnings?"
→ Returns date, time, expected EPS/revenue, and key focus areas

User: "腾讯什么时候发财报？"
→ Auto-detects as HK stock 00700.HK
```

**Generate earnings summary:**
```
User: "Generate earnings summary for NVDA"
→ Structured report with beat/miss indicators, YoY growth, highlights, guidance
```

### Supported Markets

| Market | Code | Currency | Timezone | Examples |
|--------|------|----------|----------|----------|
| 🇺🇸 US | us | USD | US/Eastern | NVDA, MSFT, AAPL, TSLA |
| 🇭🇰 Hong Kong | hk | HKD | Asia/Hong_Kong | 00700.HK (Tencent), 09988.HK (Alibaba) |
| 🇨🇳 China A-shares | cn | CNY | Asia/Shanghai | 600519 (Moutai), 002594 (BYD) |

### Supported Sectors

| Sector ID | Name | Markets | Keywords |
|-----------|------|---------|----------|
| tech | Technology | 🇺🇸🇭🇰🇨🇳 | AI, Chips, Software, Internet |
| finance | Finance | 🇺🇸🇭🇰🇨🇳 | Banking, Insurance, Securities |
| healthcare | Healthcare | 🇺🇸🇭🇰🇨🇳 | Pharmaceuticals, Biotech |
| consumer | Consumer | 🇺🇸🇭🇰🇨🇳 | E-commerce, Retail, F&B |
| energy | Energy | 🇺🇸🇭🇰🇨🇳 | Oil, Gas, Renewable Energy |
| industrial | Industrial | 🇺🇸 | Manufacturing, Aviation |
| property | Property | 🇭🇰 | Real Estate, Construction |
| manufacturing | Manufacturing | 🇨🇳 | Machinery, Automotive |
| materials | Materials | 🇨🇳 | Metals, Chemicals |

### CLI Commands

```bash
# List supported markets
node scripts/index.js markets

# List sectors for a market
node scripts/index.js sectors us

# Get earnings preview (with filters)
node scripts/index.js preview              # All markets
node scripts/index.js preview us           # US only
node scripts/index.js preview hk tech      # HK tech sector
node scripts/index.js sector tech          # Tech sector across markets

# Query company (auto-detects market)
node scripts/index.js query NVDA           # US stock
node scripts/index.js query 00700.HK       # HK stock
node scripts/index.js query 600519 cn      # CN stock

# Generate earnings summary
node scripts/index.js summary NVDA
```

### Configuration

Edit `.config/watchlist.json` to customize:
- Add/remove companies
- Define new sectors
- Adjust scheduling preferences

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "Stock not found" | Check symbol format (HK stocks need .HK suffix, CN stocks are 6 digits) |
| "No data for sector" | That sector may have no earnings scheduled for next week |
| Push notification fails | Check Feishu/Telegram authorization |
| Time display wrong | Verify system timezone settings |

---

<a name="中文"></a>
## 中文

### 这是什么？

AI财报追踪器是一个智能工具，自动监控美股、港股、A股三大市场的财报发布，支持按行业板块筛选。

### 功能特性

- 🌍 **三大市场**：美股 🇺🇸 | 港股 🇭🇰 | A股 🇨🇳
- 🏷️ **板块筛选**：科技、金融、消费、医疗等9大行业
- 🤖 **AI摘要**：自动生成结构化财报报告
- 📱 **消息推送**：飞书/钉钉移动端直达
- 💱 **多货币**：USD / HKD / CNY，自动处理时区

### 前置条件

- [ ] 已安装 Node.js 18+ (`node --version`)
- [ ] OpenClaw 或兼容的Agent框架
- [ ] 网页搜索能力（coze-web-search 或类似）
- [ ] 消息集成（飞书/钉钉/Slack，可选）

### 安装

```bash
# 通过 skills CLI 安装
npx skills add <your-github>/earnings-tracker

# 或手动克隆
git clone https://github.com/<your-github>/earnings-tracker.git
cd earnings-tracker
```

### 使用示例

**获取下周财报日历：**
```
用户："获取下周财报日历"
→ 返回三大市场的公司名、代码、日期、预期数据
```

**按市场筛选：**
```
用户："下周美股有哪些财报？"
→ 仅返回美股公司
```

**按板块筛选：**
```
用户："科技板块下周有哪些财报？"
→ 返回三大市场的科技公司
```

**查询特定公司：**
```
用户："NVDA什么时候发财报？"
→ 返回日期、时间、预期EPS/营收、关注点

用户："腾讯什么时候发财报？"
→ 自动识别为港股00700.HK
```

**生成财报摘要：**
```
用户："生成NVDA财报摘要"
→ 结构化报告，含超预期/低于预期标识、同比增速、亮点、指引
```

### 支持的市场

| 市场 | 代码 | 货币 | 时区 | 示例 |
|------|------|------|------|------|
| 🇺🇸 美股 | us | USD | US/Eastern | NVDA, MSFT, AAPL, TSLA |
| 🇭🇰 港股 | hk | HKD | Asia/Hong_Kong | 00700.HK(腾讯), 09988.HK(阿里) |
| 🇨🇳 A股 | cn | CNY | Asia/Shanghai | 600519(茅台), 002594(比亚迪) |

### 支持的板块

| 板块ID | 名称 | 覆盖市场 | 关键词 |
|--------|------|----------|--------|
| tech | 科技 | 🇺🇸🇭🇰🇨🇳 | AI、芯片、软件、互联网 |
| finance | 金融 | 🇺🇸🇭🇰🇨🇳 | 银行、保险、证券 |
| healthcare | 医疗健康 | 🇺🇸🇭🇰🇨🇳 | 制药、生物科技 |
| consumer | 消费 | 🇺🇸🇭🇰🇨🇳 | 电商、零售、餐饮 |
| energy | 能源 | 🇺🇸🇭🇰🇨🇳 | 石油、天然气、新能源 |
| industrial | 工业 | 🇺🇸 | 制造、航空 |
| property | 地产 | 🇭🇰 | 房地产、建筑 |
| manufacturing | 制造 | 🇨🇳 | 机械、汽车 |
| materials | 材料 | 🇨🇳 | 有色、化工 |

### CLI 命令

```bash
# 查看支持的市场
node scripts/index.js markets

# 查看板块
node scripts/index.js sectors us

# 财报预览（支持筛选）
node scripts/index.js preview              # 所有市场
node scripts/index.js preview us           # 仅美股
node scripts/index.js preview hk tech      # 港股科技板块
node scripts/index.js sector tech          # 科技板块跨市场

# 查询公司（自动识别市场）
node scripts/index.js query NVDA           # 美股
node scripts/index.js query 00700.HK       # 港股
node scripts/index.js query 600519 cn      # A股

# 生成财报摘要
node scripts/index.js summary NVDA
```

### 配置

编辑 `.config/watchlist.json` 自定义：
- 添加/删除公司
- 定义新板块
- 调整时间设置

### 故障排除

| 问题 | 解决方法 |
|------|----------|
| "找不到股票" | 检查代码格式（港股加.HK后缀，A股6位数字） |
| "板块无数据" | 该板块下周可能无财报安排 |
| 推送失败 | 检查飞书/钉钉授权 |
| 时间显示错误 | 检查系统时区设置 |

---

## License

MIT License - see [LICENSE](LICENSE) file

## Credits

- Built for [OpenClaw](https://openclaw.ai/) agent framework
- Inspired by the AI Earnings Tracker use case from [awesome-openclaw-usecases](https://github.com/hesamsheikh/awesome-openclaw-usecases)
