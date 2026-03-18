// 演示数据 - 模拟下周财报日历
const mockEarningsData = [
  {
    symbol: "NKE",
    name: "耐克",
    date: "2026-03-24",
    time: "after",
    expectedEPS: "0.89",
    expectedRevenue: "$12.3B",
    sector: "消费"
  },
  {
    symbol: "MU",
    name: "美光科技",
    date: "2026-03-25",
    time: "after",
    expectedEPS: "1.72",
    expectedRevenue: "$8.2B",
    sector: "存储芯片"
  },
  {
    symbol: "BB",
    name: "黑莓",
    date: "2026-03-26",
    time: "pre",
    expectedEPS: "-0.04",
    expectedRevenue: "$145M",
    sector: "软件"
  },
  {
    symbol: "CCL",
    name: "嘉年华邮轮",
    date: "2026-03-27",
    time: "pre",
    expectedEPS: "0.12",
    expectedRevenue: "$5.8B",
    sector: "旅游"
  }
];

// 演示关注的科技公司财报（实际场景）
const techEarningsDemo = [
  {
    symbol: "NVDA",
    name: "英伟达",
    date: "2026-02-26",
    time: "after",
    expectedEPS: "1.52",
    expectedRevenue: "$65.7B",
    sector: "AI芯片",
    // 实际发布后数据
    actualEPS: "1.67",
    actualRevenue: "$68.1B",
    yoyGrowth: "+73%",
    highlights: [
      "数据中心收入 $41.1B，同比增长 93%",
      "Blackwell 架构芯片开始大规模出货",
      "AI 推理业务增长超预期，占比已达 40%",
      "与各大云厂商合作深化"
    ],
    guidance: "Q1 FY2027 营收预期 $72B ± 2%",
    afterHoursMove: "+3.2%"
  }
];

module.exports = {
  mockEarningsData,
  techEarningsDemo
};
