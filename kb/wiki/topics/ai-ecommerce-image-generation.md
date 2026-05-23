---
type: topic
confidence: emerging
created: 2026-05-05
updated: 2026-05-24
tags: [e-commerce, image-generation, vector-search, llm, pipeline]
sources: [6b5d0478e739f02114310c7f882b17967351d01f9543651d362173a9e1701078]
---

# AI 电商图像生成的检索-分析-生成模式

> AI E-commerce Image Generation — 向量检索驱动的图像生成 Pipeline

## 一句话
用向量搜索找到历史成功案例，让 LLM 分析其风格，再生成新内容的流水线模式。

## 是什么

在电商场景中，为一个新产品生成促销照片，传统思路是：写 prompt → 调生图模型 → 反复迭代。

但 Fashion AI 这个项目展示了另一个思路：
1. **检索** — 用新产品图做向量搜索，在历史爆款库里找最相似的参考图
2. **分析** — 让多模态 LLM 分析参考图的风格要素（场景、灯光、姿态、氛围）
3. **生成** — 把新品图 + 参考图 + 风格描述一起给生图模型

核心优势：**不靠手写 prompt，而是从历史成功案例中"盗取"风格基因。** 历史爆款是经过市场验证的，继承它们的视觉基因比凭空创造 prompt 的命中率高。

## 当前共识

- 混合检索(Dense + Sparse)在这个场景中比纯向量检索效果好，因为电商搜索既需要视觉相似又需要关键词精确匹配
- RRF(Ranked Retrieval Fusion)是融合多路搜索结果的简单有效方案
- Nano Banana 2(Gemini 3.1 Flash)在参考图融合方面表现好，支持超宽比例(8:1)，但有服装-人体融合偶发不自然的问题
- GPT-5 Image 系列人像融合更自然，但需要海外网络环境

## 争议 / 未解问题

- 向量搜索到底该用哪个 embedding 模型？nvidia/llama-nemotron-embed-vl 是免费的，但 CLIP 系列和 SigLIP 在这个场景下可能更准
- "先检索再生成"的模式值不值得？随着长上下文模型越来越强，直接把整个产品库的描述喂给模型可能是更简单的方式
- Zilliz Cloud vs Milvus Lite vs LanceDB — 本地开发选哪个？目前 Milvus Lite 不支持 Windows 是个坑

## 我的立场

这种"检索 → 分析 → 生成"模式不只是电商适用。任何"有历史参考可以继承"的生成任务都可以套用——
Logo 设计（搜竞品 → 分析设计语言 → 生成候选）、室内装修（搜类似户型 → 分析风格 → 生成方案）、食品摆盘（搜爆款菜品 → 分析摆盘规律 → 生成新摆盘）。

但前提是有一个足够大的"成功案例库"。没有这个库，检索就是空转。

## 相关
- [[fashion-ai]]
- vector-search（待收录）
- milvus（待收录）
- image-generation-models（待收录）
- multimodal-llm（待收录）
- rag-vs-long-context（待收录）
