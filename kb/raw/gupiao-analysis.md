# gupiao 股票量化辅助分析系统 — 原始分析

> 来源：https://github.com/zxc1518343069/gupiao
> 分析日期：2026-05-24

## 项目概况

一个本地运行的股票观察与量化辅助工具。后端 FastAPI + SQLAlchemy + Pandas，前端 React + TypeScript + Vite + Ant Design。直接读取本机通达信 .day 二进制行情文件，提供自选股分组、行业分组、标签管理、策略配置、均线/乖离率/量比分析等能力。

## 技术栈

- 后端：FastAPI + SQLAlchemy + Pandas
- 前端：React 18 + TypeScript + Vite + Ant Design
- 数据库：SQLite（只存用户配置和自选股，不存行情数据）
- 数据源：通达信本地 vipdoc 目录下的 .day 二进制日线文件

## 架构分层

```
server.py          ← FastAPI 入口
  api/             ← 路由层：stock / indicator / strategy / portfolio
    routes/        ← 具体接口实现
    utils/         ← 接口层工具
  services/        ← 业务逻辑层：行情读取、指标计算、元数据解析
  database.py      ← SQLAlchemy 数据模型 + 自动建表 + 轻量迁移
```

## 核心功能

1. 读取通达信 .day 日线数据（二进制格式，struct 解析）
2. 计算 MA5/MA10/MA20/MA60/MA120 均线
3. 计算均线斜率、乖离率、前5日均量量比
4. 根据放量、均线趋势、收敛等条件生成观察信号
5. 策略引擎：用户配买入/卖出/收敛规则 → 后端匹配行情 → 操作建议
6. 进程级内存缓存（启动时读 .day，后续请求全走内存）

## 数据库设计

5 张表：
- stock_groups：自选股分组（含行业分组）
- self_selected_stocks：自选股基础信息
- stock_group_memberships：股票↔分组多对多关系
- portfolio_tag_definitions：持仓标签定义
- strategy_configs：策略配置（支持旧版 conditions_json 和新版 rule_json）
