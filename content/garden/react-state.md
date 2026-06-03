---
title: "React 状态管理方案比较"
date: "2026-03-15"
updated: "2026-05-28"
tags: ["React", "State", "Frontend", "Architecture"]
links:
  - "react-hooks-deep"
status: "evergreen"
---

## React 状态管理的演进

从最早的 `setState` 到现在的 Server Components，React 状态管理经历了巨大的变化。

### 方案对比

| 方案 | 适用场景 | 学习成本 |
|------|---------|---------|
| useState + useContext | 小型应用 | 低 |
| Zustand | 中型应用 | 低 |
| Jotai | 原子化状态 | 中 |
| Redux Toolkit | 大型应用 | 高 |

### 我的选择

对于大多数项目，**Zustand** 是最佳平衡点——足够简单，又足够强大。

### 核心原则

1. 状态尽量靠近使用它的组件
2. 避免过早抽象
3. 派生状态优于冗余状态
