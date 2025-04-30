---
title: 虚拟列表
description: 虚拟列表要点
tags: [front-end, interview, optimization]
---
本文详细介绍了虚拟列表的实现原理和关键技术点。虚拟列表是一种优化大数据量渲染的技术，通过只渲染可视区域内的元素来提高性能。文章分析了固定高度和不定高度两种场景的实现方案，并提供了完整的代码示例和性能优化建议。

<!--truncate-->

# 虚拟列表要点

## 基础：

固定高度

1. 三个元素：
   1. container容器，**相对定位**
   2. phantom元素，用于模拟总的高度，提供滚动；**绝对定位，top:0;left:0,**
   3. content元素,可视区域，存放实际挂载的列表项，容器滚动时，同时向下移动，**设置transformY，绝对定位，top:0;left:0,**
2. 需算出三个数据：
   1. startIndex：可视区域内的第一个列表项的index
   2. endIndex: 可视区域内的最后一个列表项的index
   3. content元素向下移动的offset，可为（startIndex -1)项的bottom

## 进阶

还需考虑下面的问题

1. 不固定高度
   1. 需要**提供预估高度**
   2. 使用**position[]缓存**，存放所有列表项的位置信息（**主要是高度**），初始化使用预估值，一旦元素挂载则更新该缓存，后续使用该缓存计算
   3. 计算startIndex和endIndex时，可使用**二分查找**在positions[]中找到**第一个bottom大于scrollTop的列表项**以及第一个bottom大于容器高度的列表项**（经实践：二分查找后仍需要线性更新高度缓存，复杂度其实还是O(n)）**
2. 白屏问题：添加首尾缓冲区
3. 滚动触发过于频繁：使用Intersection Observer API**（经实践：使用该api可能会造成在快速滚动场景下的bug）**

## 实现

``` vue
<template>
  <!-- 容器元素，监听滚动事件 -->
  <div ref="containerRef" class="virtual-list-container" @scroll="onScroll">
    <!-- 幽灵元素，高度等于所有列表项的总高度，用于形成滚动条 -->
    <div ref="listRef" class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }">
      <!-- 实际内容元素，通过transform偏移到正确的位置 -->
      <div
        class="virtual-list-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <!-- 只渲染可见区域内的列表项 -->
        <div
          v-for="item in visibleData"
          :key="item.id"
          class="virtual-list-item"
          :style="itemHeight ? { height: `${itemHeight}px` } : {}"
          ref="itemsRef"
        >
          {{ item.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ListItem } from '../types/ListItem'
import { ref, computed, reactive, onMounted, nextTick, watch } from 'vue'

// 定义组件属性
const props = defineProps<{
  listData: ListItem[]           // 列表数据源
  itemHeight?: number            // 可选的固定项高度，如果提供则为定高模式
  bufferScale?: number           // 缓冲区大小倍率，默认为1
}>()

// 默认缓冲倍率，控制可视区域外渲染多少额外项
const bufferMultiple = props.bufferScale || 1

// DOM引用
const containerRef = ref<HTMLElement | null>(null)  // 容器元素引用
const listRef = ref<HTMLElement | null>(null)       // 幽灵元素引用
const itemsRef = ref<HTMLElement[]>([])             // 列表项元素引用数组

// 状态变量
const offsetY = ref(0)           // 内容元素的偏移量
const scrollTop = ref(0)         // 当前滚动位置
const viewportHeight = ref(0)    // 可视区域高度

// 固定高度模式下的每项高度，如果没有提供itemHeight，则使用默认值50
const itemSize = props.itemHeight || 50

// 项目高度缓存 - 主要用于不定高模式，通过ID缓存每个项的实际高度
const sizeCache = reactive<{ [key: string]: number }>({})
// 所有列表项的高度数组
const heights = ref<number[]>([])

/**
 * 初始化或更新高度缓存
 * 在组件挂载和数据变化时调用
 */
const updateHeightCache = () => {
  // 固定高度模式下，所有项高度相同
  if (props.itemHeight) {
    heights.value = props.listData.map(() => itemSize)
    return
  }
  
  // 不定高模式，尝试从缓存获取高度，如果没有则使用估算高度
  heights.value = props.listData.map((item) => {
    return sizeCache[item.id] || itemSize
  })
}

/**
 * 计算所有列表项的总高度
 * 用于设置幽灵元素的高度，形成正确的滚动条
 */
const totalHeight = computed(() => {
  return heights.value.reduce((total, size) => total + size, 0)
})

/**
 * 计算当前滚动位置下应该显示哪些列表项
 * 返回起始索引和结束索引
 */
const getVisibleRange = () => {
  if (!containerRef.value) return { start: 0, end: 10 }
  
  const scrollPos = scrollTop.value
  // 计算缓冲区大小 = 可视区域高度 * 缓冲倍率
  const buffer = viewportHeight.value * bufferMultiple
  
  // 计算内容起始位置
  let startOffset = 0
  let startIndex = 0
  
  // 计算起始索引：找到第一个底部位置大于(scrollPos - buffer)的项
  // 即找到第一个应该出现在可视区域上方缓冲区的项
  while (startIndex < heights.value.length && startOffset < scrollPos - buffer) {
    startOffset += heights.value[startIndex]
    startIndex++
  }  
  
  // 计算结束索引
  let endOffset = startOffset
  let endIndex = startIndex
  
  // 计算结束索引：找到第一个顶部位置大于(scrollPos + viewportHeight + buffer)的项
  // 即找到第一个超出可视区域下方缓冲区的项
  while (endIndex < heights.value.length && endOffset < scrollPos + viewportHeight.value + buffer) {
    endOffset += heights.value[endIndex]
    endIndex++
  }

  // 设置内容元素的偏移量，使其正确显示
  // startOffset就是第一个可见项的顶部位置
  offsetY.value = startOffset
  
  // 返回计算出的可见范围
  return {
    start: Math.max(0, startIndex),
    end: Math.min(props.listData.length, endIndex)
  }
}

/**
 * 计算当前需要渲染的列表项数据
 * 基于getVisibleRange计算出的索引范围
 */
const visibleData = computed(() => {
  const { start, end } = getVisibleRange()
  return props.listData.slice(start, end)
})

/**
 * 滚动事件处理函数
 * 当用户滚动列表时触发
 */
const onScroll = () => {
  if (!containerRef.value) return
  // 更新当前滚动位置
  scrollTop.value = containerRef.value.scrollTop
  // 注：由于scrollTop是响应式的，更新它会自动触发visibleData的重新计算
}

/**
 * 组件挂载时的初始化
 */
onMounted(async () => {
  if (!containerRef.value) return
  
  // 获取视口高度
  viewportHeight.value = containerRef.value.clientHeight
  
  // 初始化高度缓存
  updateHeightCache()
  
  // 触发初始滚动计算
  onScroll()
})

/**
 * 测量可见列表项的实际高度并更新缓存
 * 仅在不定高模式下使用
 */
const updateItemSizes = async () => {
  // 固定高度模式不需要测量
  if (props.itemHeight || !itemsRef.value.length) return
  
  // 确保DOM已更新
  await nextTick()
  
  // 获取当前可见范围的起始索引
  const { start } = getVisibleRange()
  let hasChanges = false
  
  // 遍历所有可见的DOM元素
  itemsRef.value.forEach((el, i) => {
    // 计算元素在原始数据中的索引
    const index = start + i
    // 获取元素的实际高度
    const realSize = el.offsetHeight
    
    // 如果实际高度与缓存中的高度不同，且是有效值
    if (heights.value[index] !== realSize && realSize > 0) {
      // 获取对应的数据项
      const item = props.listData[index]
      if (item) {
        // 更新缓存
        sizeCache[item.id] = realSize
        heights.value[index] = realSize
        hasChanges = true
      }
    }
  })
  
  // 如果有高度变化，重新计算可见范围
  if (hasChanges) {
    onScroll()
  }
}

/**
 * 监听数据源变化，重新初始化高度缓存
 */
watch(() => props.listData, () => {
  updateHeightCache()
}, { deep: false })

/**
 * 监听可见数据变化，更新高度缓存
 * 仅在不定高模式下有效
 */
watch(visibleData, async () => {
  if (!props.itemHeight) {
    await nextTick()
    updateItemSizes()
  }
})
</script>

<style scoped>
/* 容器元素样式 */
.virtual-list-container {
  height: 100%;                   /* 容器高度 */
  overflow: auto;                 /* 允许滚动 */
  position: relative;             /* 建立定位上下文 */
  -webkit-overflow-scrolling: touch;  /* 优化移动端滚动体验 */
}

/* 幽灵元素样式，用于创建滚动条 */
.virtual-list-phantom {
  position: relative;
  width: 100%;
}

/* 实际内容元素样式 */
.virtual-list-content {
  position: absolute;             /* 绝对定位 */
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
}

/* 列表项样式 */
.virtual-list-item {
  padding: 10px;
  color: #555;
  box-sizing: border-box;         /* 盒模型：内边距和边框包含在宽度内 */
  border-bottom: 1px solid #999;  /* 底部边框 */
}
</style> 
```

### 核心原理

虚拟列表的核心原理是只渲染当前可见区域（以及一定缓冲区）内的列表项，而不是渲染全部数据。这极大地提高了大数据量列表的性能。

### 主要组件结构

1. 容器元素[.virtual-list-container]：提供滚动功能，监听滚动事件
2. 幽灵元素[.virtual-list-phantom]：设置与所有列表项总高度相同的高度，形成正确的滚动条
3. 内容元素[.virtual-list-content]：通过CSS transform属性实现位移，避免重排
4. 列表项[.virtual-list-item]：只渲染可见范围内的项

### 关键算法

1. 计算可见范围（getVisibleRange）：

   - 根据当前滚动位置和缓冲区大小，计算哪些项应该被渲染

   - 计算内容元素应该偏移的位置（offsetY）

2. 高度管理：

   - 固定高度模式：所有项高度相同，高度计算简单直接

   - 不定高模式：通过ID缓存每个项的实际高度，动态测量和更新

3. 响应式处理：

   - 监听滚动事件，更新可见范围

   - 监听数据变化，更新高度缓存

   - 监听可见数据变化，动态测量实际高度

### 数据流向

1. 初始化时，基于预估高度创建高度缓存
2. 用户滚动列表时，计算新的可见范围
3. 渲染可见范围内的列表项
4. 测量实际渲染的DOM元素高度
5. 更新高度缓存，调整内容元素位置

### 性能优化点

1. 避免频繁DOM操作：只在必要时更新DOM
2. 使用CSS transform：避免触发布局重排
3. 高效的高度缓存：通过ID缓存高度，避免重复测量
4. 增量更新：只测量和更新发生变化的高度