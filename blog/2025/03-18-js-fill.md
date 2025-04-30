---
title: JS用fill([])创建二维数组的坑
description: JS用fill([])创建二维数组的坑
slug: js-fill
tags: [front-end, broswer]
---

本文介绍了JavaScript中使用Array.fill([])创建二维数组时的常见陷阱。当使用fill方法传入空数组作为参数时，所有元素会引用同一个数组对象，导致修改一行时其他行也会被意外修改。文章提供了正确的二维数组创建方法，并结合LeetCode实例展示了实际应用场景。


<!--truncate-->
# JS用fill([])创建二维数组的坑

## 问题：使用fill([])，导致每一行的数组用相同的引用

``` javascript
//创建二维数组
let visited = new Array(3).fill([]) //visited[0] 和 visted[1]用的是同一个数组,引用相同
console.log(visited[0] === visited[1]) //true
```

## 正确的用法：

``` javascript
//创建二维数组
let visited = new Array(3).fill(0).map(m => new Array(3).fill(0))
```

附上做的leetcode题[200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)

```javascript
/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
    //深度优先解法
    let visited = new Array(grid.length).fill(0).map(m => new Array(grid[0].length).fill(0))
    let ans = 0;
    const map = [[-1, 0], [1, 0], [0, -1], [0, 1]]//上下左右
    const dfs = (row, col) => {
        if (row < 0 || row >= grid.length) return;
        if (col < 0 || col >= grid[0].length) return;
        if (grid[row][col] == 0) return;
        if (visited[row][col] === 1) return;
        visited[row][col] = 1;
        for (let i = 0; i < map.length; i++) {
            let nextRow = map[i][0] + row;
            let nextCol = map[i][1] + col;
            dfs(nextRow, nextCol);
        }
    }
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (visited[i][j] === 1) {
                continue;
            }
            let cur = grid[i][j];
            if (cur == 1) {
                ans++;
                //将周围的陆地标记为visited，即将该岛的陆地都标记掉
                dfs(i, j);
            }
        }
    }
    return ans;
};
```

