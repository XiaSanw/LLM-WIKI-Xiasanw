---
type: entity
confidence: opinion
created: 2026-05-24
updated: 2026-05-24
tags: [stock, quantitative-analysis, fastapi, react, opensource, local-first]
sources: [gupiao-project-analysis]
---

# gupiao 股票量化辅助分析系统

> 基于通达信本地数据的量化看板 — FastAPI + React 全栈，策略规则引擎驱动

## 核心特性

- **全本地运行**：SQLite 存配置，通达信 .day 文件读行情，不依赖任何外部 API
- **完整量化链路**：原始二进制数据 → Pandas 指标计算 → 策略规则匹配 → 前端信号展示
- **策略引擎**：用户通过前端配买入/卖出/收敛规则（JSON 存库），后端自动匹配行情生成操作建议
- **进程级缓存**：行情数据只在启动时计算一次，后续请求全走内存
- **数据库轻量迁移**：不用 Alembic，通过 ensure_database_schema() 做轻量兼容更新

## 为什么重要

这是个人本地量化分析系统的典型参考实现。它证明了不需要复杂的大数据架构——FastAPI + Pandas + SQLite 就足够支撑一个功能完整的量化看板。

对于 llmwiki-base 用户的电力市场预测项目，这个项目的三层架构（api/services/database）、数据与配置分离策略、策略规则引擎模式都值得直接复用。

## 技术架构

| 层 | 技术 | 职责 |
|---|---|---|
| 前端 | React + TypeScript + Vite + Ant Design | 看板展示、策略配置 UI |
| API 层 | FastAPI，按 stock/strategy/portfolio 分模块 | 接口路由，参数校验 |
| 服务层 | Pandas 指标计算，元数据解析 | 业务逻辑，数据加工 |
| 持久层 | SQLite + SQLAlchemy | 用户配置、策略规则存储 |
| 数据源 | 通达信 .day 二进制文件 | 行情原始数据（只读） |

## 关键设计决策

1. **行情不入库**：SQLite 只存用户配置，行情数据每次从 .day 文件读后缓存在内存。数据库永远轻量，格式变化不需要数据迁移。
2. **策略用 JSON 存储**：strategy_configs 表用 rule_json 字段存规则，灵活支持不同策略类型，不需要频繁改表结构。
3. **缓存 = 重启即更新**：.day 文件按工作日更新，缓存生命周期 = 进程生命周期，不需要热更新机制。
4. **不用 Alembic**：个人项目体量下，轻量 schema 兼容更新比完整 migration 框架更实用。

## 不同素材中的观点

来源：[[gupiao-project-analysis]]
> 这个项目验证了"本地二进制数据 → Pandas 指标计算 → 策略规则匹配 → 前端信号展示"这条链路是可行且优雅的。整体架构分层可以直接复用。

## 实用信息

- 获取方式：`git clone https://github.com/zxc1518343069/gupiao`
- 基本用法：配置通达信路径 → 启动后端 → 启动前端 → 浏览器访问
- 适用场景：个人本地量化分析，不需要云服务的场景

## 来源

- https://github.com/zxc1518343069/gupiao
- raw/2026-05-24-gupiao-analysis.md

## 相关

- [[ai-ecommerce-image-generation]]
- electricity-market-dashboard（待收录）
- quantitative-analysis-architecture（待收录）
