---
type: entity
confidence: emerging
created: 2026-05-05
updated: 2026-05-24
tags: [e-commerce, image-generation, vector-search, milvus, python]
sources: [6b5d0478e739f02114310c7f882b17967351d01f9543651d362173a9e1701078]
---

# Fashion AI 电商图像系统

> AI 驱动的电商图像生成与向量检索系统

## 一句话
用 AI 自动生成跨境电商服装促销照的开源 pipeline——向量搜索历史爆款 → 分析风格 → 生成新照片。

## 核心要点
- 输入新品平铺照，输出专业模特促销照，全流程自动化
- 核心理念：从历史爆款中"继承基因"，而非每次手动写 prompt
- 混合检索：Dense 向量(视觉相似) + Sparse TF-IDF(关键词) + 标量过滤(品类/销量) + RRF 融合
- 风格分析用 Qwen 3.5 多模态 LLM，生图默认用 Gemini 3.1 Flash(Nano Banana 2)，可切换 GPT-5 Image
- 所有模型走 OpenRouter API，无需本地 GPU，单张成本约 $0.07
- 749 行 Python，8 个文件，Milvus(Zilliz Cloud)做向量存储
- 项目是原型级别，有占位图可 demo，真实使用需替换服装照片

## 为什么重要
这是"向量搜索 + LLM 分析 + 图像生成"三条技术线组合解决一个垂直电商问题的典型案例。
关键洞察不是技术多新，而是**用向量搜索解决了"怎么写 prompt"的问题**——prompt 不是手写的，是从历史爆款中检索 + 分析出来的。
这种"检索 → 分析 → 生成"的流水线模式可以迁移到很多领域：Logo 设计、室内装修、食品摆盘。

## 架构简化

```
新品平铺图 → Embedding → Milvus 混合检索 → Top-K 历史爆款 → Qwen 3.5 分析风格 → Gemini 生成促销照
```

## 关键模块

| 模块 | 作用 |
|---|---|
| embeddings.py | Dense 向量(2048d via nvidia embedding) + Sparse 向量(TF-IDF) |
| milvus_store.py | Milvus Collection CRUD + 混合检索 + RRF 重排序 |
| style_analyzer.py | Qwen 3.5 分析爆款图的场景/光线/姿态/氛围 → 输出风格 prompt |
| image_generator.py | 4 种生图模型统一接口，网络重试 |
| main.py | CLI 三命令: setup / search / generate |

## 相关
- [[ai-ecommerce-image-generation]]
- milvus（待收录）
- vector-search（待收录）
- openrouter（待收录）
- image-generation-models（待收录）
