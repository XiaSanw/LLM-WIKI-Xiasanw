---
type: source
confidence: opinion
created: 2026-05-24
source_url: [https://github.com/zxc1518343069/gupiao]
raw_files: [gupiao-analysis]
tags: [stock, quantitative-analysis, fastapi, react, architecture-reference]
---

# gupiao 股票量化系统调研笔记

> 本地量化看板架构分析 — FastAPI + React + 通达信数据

## 核心观点

- **本地优先架构**：SQLite 存用户配置，通达信 .day 二进制文件直接读取行情，不依赖任何外部 API 或云服务。个人量化工具的理想范式。
- **分层清晰**：api/（路由）→ services/（业务逻辑）→ database.py（持久化），三层各司其职，没有跨层耦合。可以直接复用到电力市场预测项目。
- **策略引擎设计**：用户通过前端配置买入/卖出/收敛规则（存 JSON 到 SQLite），后端 analyze_stocks.py 批量匹配行情数据，自动生成信号和操作建议。预测模型可以复用同样的"配置-匹配-建议"模式。
- **进程级缓存**：.day 文件只在启动时读取一次并计算所有指标，后续请求全走内存缓存。对于按天更新的数据源（电力市场同理），这种缓存策略简单有效。
- **数据与配置分离**：行情数据只读不存，用户配置（自选股、分组、策略）存 SQLite。这种分离避免了数据库膨胀，也降低了数据迁移复杂度。

## 实操内容保留

### 代码/配置

通达信 .day 二进制解析：
```python
record_format = 'iiiiifii'  # 日期,开盘,最高,最低,收盘,成交额,成交量
record_size = struct.calcsize(record_format)
raw_data = struct.unpack(record_format, buf)
```

均线计算：
```python
df['MA5'] = df['close'].rolling(window=5).mean()
df['MA5_slope'] = (df['MA5'] - df['MA5'].shift(2)) / df['MA5'].shift(2) * 100
df['Bias5'] = (df['close'] - df['MA5']) / df['MA5'] * 100
```

量比计算：
```python
df['vol_ma5'] = df['volume'].shift(1).rolling(window=5).mean()
df['vol_ratio'] = df['volume'] / df['vol_ma5']
```

### Prompt 模板

（本文无 Prompt 模板/步骤）

### 操作步骤

本地启动：
```bash
# 后端
pip install -r requirements.txt
uvicorn server:app --reload

# 前端
cd web && npm install && npm run dev
```

## 我的收获

这个项目验证了"本地二进制数据 → Pandas 指标计算 → 策略规则匹配 → 前端信号展示"这条链路是可行且优雅的。对于电力市场预测项目，核心不同在于数据格式（电力数据可能是 CSV 而非 .day 二进制）和预测模型（可能用 ML 而非规则引擎），但整体架构分层可以直接复用。

关键洞察：**不要把行情数据存进数据库**。gupiao 的选择是用 SQLite 只存用户配置，行情数据每次从文件读取后缓存在内存。这样数据库永远是轻量的，行情数据格式变化也不需要做数据迁移。

## 原文精彩摘录

> 本项目不内置行情数据库。数据库和行情数据是两部分：本地数据库默认使用 SQLite 文件 data.db，主要保存自选股、分组、标签和策略配置，不保存完整日线行情。

> 后端启动时会调用 database.py 中的 ensure_database_ready()，只创建缺失的表并执行轻量兼容更新，不会清空、重建或覆盖已有数据。

## 值得引用吗

值得。作为本地量化分析系统的参考实现，架构分层、数据策略、策略引擎设计对电力市场预测项目有直接参考价值。

## 相关

- [[ai-ecommerce-image-generation]] — 同样是 Python 后端 + 向量数据库的本地化方案
- electricity-market-dashboard（待收录） — 电力市场预测平台架构参考
- quantitative-analysis-architecture（待收录） — 量化分析系统的通用架构模式
