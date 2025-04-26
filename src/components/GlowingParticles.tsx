import React, { useEffect, useRef } from "react";

/**
 * GlowingParticles组件
 *
 * 这是一个创建炫酷发光粒子特效的React组件。
 * 特性包括:
 * - 多彩的发光粒子和光束
 * - 鼠标交互和点击效果
 * - 自适应暗色/亮色模式
 * - 动态欢迎消息和交互提示
 * - 优化的渲染性能
 *
 * @returns React组件
 */
export default function GlowingParticles(): React.ReactElement {
  // 创建对Canvas元素的引用
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 所有的动画和特效逻辑都在useEffect内实现，确保只在客户端执行
  useEffect(() => {
    // 调试开关 - 仅在开发环境中启用
    const DEBUG = process.env.NODE_ENV === "development";

    // 自定义日志函数，只在调试模式打印
    const debugLog = (...args: any[]) => {
      if (DEBUG) {
        console.log(...args);
      }
    };

    // 获取Canvas元素
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取2D绘图上下文
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 检测当前是否启用暗色主题
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    // 定义主题颜色 - 根据当前主题调整颜色
    const PRIMARY_COLOR = isDark ? "#d19947" : "#ffd460"; // 主要颜色
    const SECONDARY_COLOR = isDark ? "#ca8c32" : "#ffcc47"; // 次要颜色
    const TERTIARY_COLOR = isDark ? "#e2be8a" : "#ffecb0"; // 第三颜色

    // 预定义固定的发光效果颜色，避免颜色解析错误
    const PRIMARY_GLOW = isDark
      ? "rgba(209, 153, 71, 0.15)"
      : "rgba(255, 212, 96, 0.15)";
    const SECONDARY_GLOW = isDark
      ? "rgba(202, 140, 50, 0.15)"
      : "rgba(255, 204, 71, 0.15)";
    const TERTIARY_GLOW = isDark
      ? "rgba(226, 190, 138, 0.15)"
      : "rgba(255, 236, 176, 0.15)";

    // 发光基础色（更高不透明度）
    const PRIMARY_BASE = isDark
      ? "rgba(209, 153, 71, 0.8)"
      : "rgba(255, 212, 96, 0.8)";
    const SECONDARY_BASE = isDark
      ? "rgba(202, 140, 50, 0.8)"
      : "rgba(255, 204, 71, 0.8)";
    const TERTIARY_BASE = isDark
      ? "rgba(226, 190, 138, 0.8)"
      : "rgba(255, 236, 176, 0.8)";

    /**
     * 将十六进制颜色转换为rgba格式
     * @param hex 十六进制颜色值
     * @param alpha 透明度值
     * @returns rgba格式的颜色字符串
     */
    const hexToRgba = (hex: string, alpha: number) => {
      // 验证输入格式，如无效则返回默认颜色
      if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
        return isDark
          ? `rgba(209, 153, 71, ${alpha})`
          : `rgba(255, 212, 96, ${alpha})`;
      }
      try {
        // 解析RGB值
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } catch (e) {
        // 解析出错时返回默认颜色
        return isDark
          ? `rgba(209, 153, 71, ${alpha})`
          : `rgba(255, 212, 96, ${alpha})`;
      }
    };

    // Canvas尺寸设置 - 自适应父元素宽高
    let width = (canvas.width =
      canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height =
      canvas.parentElement?.offsetHeight || window.innerHeight);

    // 创建离屏Canvas用于优化渲染性能
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenCtx = offscreenCanvas.getContext("2d", { alpha: true });
    if (!offscreenCtx) return;

    // 粒子系统初始化
    const particles: Particle[] = []; // 粒子数组
    const maxParticles = 100; // 粒子最大数量（减少以提高性能）
    const beamCount = 3; // 光束数量
    const beams: Beam[] = []; // 光束数组
    const orbs: Orb[] = []; // 光球数组

    // 用户交互反馈消息
    const messages = [
      "欢迎来到我的博客！📚", // 欢迎消息
    ];
    let currentMessage = ""; // 当前显示的消息
    let messageTimer: number = 0; // 消息定时器
    let showMessage = false; // 是否显示消息

    // 动画属性
    let time = 0; // 动画时间累加器
    let lastRenderTime = 0; // 上次渲染时间戳
    const targetFPS = 60; // 目标帧率
    const frameDelay = 1000 / targetFPS; // 每帧延迟时间
    const timeSpeed = 0.3; // 降低全局动画速度

    // 创建鼠标状态
    const mouse = {
      x: null,
      y: null,
      active: false,
      radius: 150, // 鼠标影响半径
    };

    /**
     * 处理窗口大小变化
     * 重新设置画布尺寸并调整现有元素位置
     */
    function handleResize() {
      // 更新画布尺寸
      width = canvas.width =
        canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.height =
        canvas.parentElement?.offsetHeight || window.innerHeight;
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;

      // 重新初始化特效元素
      initBeams();
      initOrbs();

      // 调整现有粒子位置，确保在新的画布范围内
      particles.forEach((p) => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    }

    /**
     * 简化版噪声生成器
     * 用于创建有机的运动效果
     */
    class SimplexNoise {
      /**
       * 2D噪声函数
       * @param x X坐标
       * @param y Y坐标
       * @returns 噪声值
       */
      noise2D(x: number, y: number) {
        // 简化版噪音函数，避免复杂实现
        return Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2.0;
      }
    }

    // 噪声工具对象
    const noise = {
      simplex2: new SimplexNoise(),
      /**
       * 获取指定坐标的噪声值
       */
      get: function (x: number, y: number) {
        return this.simplex2.noise2D(x, y);
      },
    };

    /**
     * 缓动函数集合 - 用于平滑动画过渡
     */
    const easing = {
      // 五次方缓出函数 - 适合快速开始，缓慢结束的效果
      easeOutQuint: (t: number) => 1 - Math.pow(1 - t, 5),
      // 三次方缓入缓出函数 - 适合平滑的过渡效果
      easeInOutCubic: (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    };

    /**
     * 粒子类 - 实现发光粒子效果
     */
    class Particle {
      x: number; // 粒子X坐标
      y: number; // 粒子Y坐标
      size: number; // 当前大小
      baseSize: number; // 基础大小
      speedX: number; // X方向速度
      speedY: number; // Y方向速度
      color: string; // 粒子颜色
      glowColor: string; // 发光效果颜色
      glowSize: number; // 发光范围大小
      life: number; // 当前生命值
      maxLife: number; // 最大生命值
      fadeSpeed: number; // 淡入淡出速度
      individualTime: number; // 粒子时间
      opacity: number; // 粒子不透明度
      seed: number; // 粒子随机种子

      /**
       * 创建一个新粒子
       * @param x 初始X坐标，若为null则随机生成
       * @param y 初始Y坐标，若为null则随机生成
       */
      constructor(x: number | null = null, y: number | null = null) {
        // 初始化位置 - 指定位置或随机位置
        this.x = x !== null ? x : Math.random() * width;
        this.y = y !== null ? y : Math.random() * height;
        // 随机大小 - 范围更小更均衡
        this.baseSize = Math.random() * 2 + 0.8;
        this.size = this.baseSize;
        // 随机初始速度 - 降低速度
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;

        // 随机选择颜色
        const colorChoice = Math.random();
        if (colorChoice < 0.6) {
          // 60%概率使用主色
          this.color = PRIMARY_COLOR;
          this.glowColor = hexToRgba(PRIMARY_COLOR, 0.3); // 进一步降低发光不透明度
        } else if (colorChoice < 0.9) {
          // 30%概率使用次要色
          this.color = SECONDARY_COLOR;
          this.glowColor = hexToRgba(SECONDARY_COLOR, 0.3); // 进一步降低发光不透明度
        } else {
          // 10%概率使用第三色
          this.color = TERTIARY_COLOR;
          this.glowColor = hexToRgba(TERTIARY_COLOR, 0.3); // 进一步降低发光不透明度
        }

        // 设置发光效果大小 - 略微减小
        this.glowSize = this.baseSize * 4; // 减小发光半径
        // 初始化生命周期 - 延长生命周期使运动更平缓
        this.life = 0;
        this.maxLife = 150 + Math.random() * 200;
        this.fadeSpeed = 0.007 + Math.random() * 0.007; // 降低淡入淡出速度
        this.individualTime = 0;
        // 初始透明度很低，使初始出现更加平滑
        this.opacity = 0.1;
        this.seed = Math.random();
      }

      /**
       * 更新粒子状态
       * @param time 当前动画时间
       */
      update(time?: number) {
        // 更新生命周期
        this.life += 1;
        // 更新个体时间 - 每个粒子有独特的时间流
        this.individualTime += 0.003 + Math.random() * 0.001; // 降低时间流速

        // 检查粒子位置区域
        const isInLeftArea = this.x < 50;

        // 淡入淡出效果，根据生命周期调整不透明度 - 延长淡入期，使其更平滑
        if (this.life < 40) {
          // 淡入期延长到40帧
          this.opacity = (this.life / 40) * 0.7; // 最大只到70%不透明度
        } else if (this.life > this.maxLife - 60) {
          // 淡出期延长到60帧
          this.opacity = ((this.maxLife - this.life) / 60) * 0.7;
        } else {
          // 中间稍微波动一下不透明度，但幅度减小
          this.opacity = 0.65 + Math.sin(this.life * 0.02) * 0.05;
        }

        // 检查是否完全淡出 - 只有当粒子完全不可见时才重置
        if (this.life >= this.maxLife) {
          this.resetParticle();
          return;
        }

        // 检查左侧区域停滞粒子 - 标记为待淡出而不是立即重置
        if (
          isInLeftArea &&
          Math.abs(this.speedX) < 0.03 &&
          Math.abs(this.speedY) < 0.03
        ) {
          // 将生命周期设置为接近最大值，强制进入淡出阶段
          this.life = Math.max(this.life, this.maxLife - 60);
        }

        // 使用时间参数增加一点全局影响 - 降低强度
        const globalInfluence = time ? Math.sin(time * 0.0005) * 0.003 : 0;

        // 计算噪声影响 - 降低强度
        const particleSeed = this.seed || 0;
        const noiseX =
          Math.sin(this.individualTime * 0.6 + particleSeed) * 0.01 +
          globalInfluence;
        const noiseY =
          Math.sin(this.individualTime * 0.8 + particleSeed * 2) * 0.01 +
          globalInfluence;

        // 随时间变化的速度修改因子 - 降低变化幅度
        const xSpeedFactor = 1 + Math.sin(this.individualTime * 1.2) * 0.08;
        const ySpeedFactor = 1 + Math.sin(this.individualTime * 1.5) * 0.08;

        // 应用噪声到速度上 - 降低噪声影响
        this.speedX += noiseX * (isInLeftArea ? 0.3 : 0.7);
        this.speedY += noiseY * 0.7;

        // 应用阻力减速 - 增大阻力
        let resistanceX = isInLeftArea ? 0.0008 : 0.003 + Math.random() * 0.001;
        let resistanceY = 0.003;
        this.speedX *= 1 - resistanceX * 1.5;
        this.speedY *= 1 - resistanceY * 1.5;

        // 应用变化因子使速度更自然
        this.speedX *= xSpeedFactor;
        this.speedY *= ySpeedFactor;

        // 计算下一位置 - 降低移动步长
        const nextX = this.x + this.speedX * 0.7;
        const nextY = this.y + this.speedY * 0.7;

        // 特殊处理边界情况
        this.handleBoundaries(nextX, nextY);

        // 基于当前生命周期和随机波动更新粒子大小
        // 使粒子大小在中期稍微波动，增加活跃感，但降低波动幅度
        const lifeCycleFactor = Math.sin((this.life / this.maxLife) * Math.PI);
        const sizeWave = Math.sin(this.individualTime * 2) * 0.08; // 降低波动幅度

        this.size = this.baseSize * (0.9 + lifeCycleFactor * 0.15 + sizeWave);
        this.glowSize =
          this.size * (4.5 + Math.sin(this.individualTime * 1.2) * 0.5); // 降低脉动频率和幅度
      }

      /**
       * 处理边界情况
       * @param nextX 下一个X坐标
       * @param nextY 下一个Y坐标
       */
      handleBoundaries(nextX: number, nextY: number) {
        // 边界处理
        // 右边界 -> 左侧
        if (nextX > width + 20) {
          // 将粒子标记为需要淡出
          if (this.opacity > 0.2) {
            // 如果不是已经在淡出
            // 将生命周期设置为进入淡出阶段
            this.life = Math.max(this.life, this.maxLife - 60);
            // 正常更新位置继续移动直到淡出
            this.x = nextX;
            this.y = nextY;
            return;
          }

          // 只有当粒子几乎不可见时才重置位置
          if (this.opacity <= 0.2) {
            // 从右边界传送到左边界，保持Y位置，但速度略有衰减同时保持足够的右移速度
            this.x = -10;
            // 小概率随机化Y位置，模拟不规则流入
            if (Math.random() < 0.2) {
              this.y = Math.random() * height;
            }
            // 确保有足够的右移速度，但值略有随机变化
            this.speedX = 0.15 + Math.random() * 0.25; // 降低速度
            // 小幅度调整Y速度，增加自然感
            this.speedY += (Math.random() - 0.5) * 0.1;
            // 重置生命周期，但保持低透明度以平滑过渡
            this.life = 0;
            this.opacity = 0.1;

            debugLog(
              `粒子从右侧循环: 位置(${this.x.toFixed(1)},${this.y.toFixed(
                1
              )}), 速度(${this.speedX.toFixed(2)},${this.speedY.toFixed(2)})`
            );
          }
        }
        // 左边界 -> 生命周期结束或提高速度
        else if (nextX < -30) {
          // 将粒子标记为需要淡出
          if (this.opacity > 0.2) {
            // 将生命周期设置为进入淡出阶段
            this.life = Math.max(this.life, this.maxLife - 60);
            // 可以调整速度，让粒子更快离开屏幕
            this.speedX *= 1.1;
            // 正常更新位置继续移动直到淡出
            this.x = nextX;
            this.y = nextY;
            return;
          }

          // 只有当粒子几乎不可见时才重置
          if (this.opacity <= 0.2) {
            // 根据概率决定是重置还是提高速度
            if (Math.random() < 0.7) {
              // 70%概率重置粒子
              this.resetParticle();
              return;
            } else {
              // 30%概率给予额外向右的推力，让粒子返回
              this.speedX = 0.2 + Math.random() * 0.2; // 降低速度
              // 微调Y位置，防止粒子堆积在同一水平线
              this.y += (Math.random() - 0.5) * 5;
              // 设为低透明度，让粒子平滑出现
              this.opacity = 0.1;
              this.life = 0;
            }
          }
        }
        // 上下边界处理 - 更自然的反弹或循环
        else if (nextY < -30) {
          // 将粒子标记为需要淡出
          if (this.opacity > 0.2) {
            // 将生命周期设置为进入淡出阶段
            this.life = Math.max(this.life, this.maxLife - 60);
            // 正常更新位置继续移动直到淡出
            this.x = nextX;
            this.y = nextY;
            return;
          }

          // 只有当粒子几乎不可见时才处理
          if (this.opacity <= 0.2) {
            // 上边界 -> 随机决定是重置还是改变方向
            if (Math.random() < 0.5) {
              // 改变方向，模拟轻微弹跳
              this.speedY = Math.abs(this.speedY) * 0.5; // 降低反弹力度
              this.y = 0;
              // 同时轻微改变X速度，增加自然感
              this.speedX += (Math.random() - 0.5) * 0.1;
              // 设为低透明度，让粒子平滑出现
              this.opacity = 0.1;
              this.life = 0;
            } else {
              // 重置粒子
              this.resetParticle();
              return;
            }
          }
        } else if (nextY > height + 30) {
          // 将粒子标记为需要淡出
          if (this.opacity > 0.2) {
            // 将生命周期设置为进入淡出阶段
            this.life = Math.max(this.life, this.maxLife - 60);
            // 正常更新位置继续移动直到淡出
            this.x = nextX;
            this.y = nextY;
            return;
          }

          // 只有当粒子几乎不可见时才处理
          if (this.opacity <= 0.2) {
            // 下边界 -> 随机决定是重置还是改变方向
            if (Math.random() < 0.5) {
              // 改变方向，模拟轻微弹跳
              this.speedY = -Math.abs(this.speedY) * 0.5; // 降低反弹力度
              this.y = height;
              // 同时轻微改变X速度，增加自然感
              this.speedX += (Math.random() - 0.5) * 0.1;
              // 设为低透明度，让粒子平滑出现
              this.opacity = 0.1;
              this.life = 0;
            } else {
              // 重置粒子
              this.resetParticle();
              return;
            }
          }
        } else {
          // 在有效范围内，正常更新位置
          this.x = nextX;
          this.y = nextY;
        }
      }

      /**
       * 重置粒子状态 - 在边缘重新生成
       */
      resetParticle() {
        // 使用更多变化的生成区域
        // 增加更多随机性，避免固定的生成模式
        const spawnChoice = Math.random();

        // 主区域生成（80%的粒子）
        if (spawnChoice < 0.8) {
          // 从三个主要生成区域随机选择一个（顶部、右侧、底部）
          const spawnArea = Math.floor(Math.random() * 3);

          switch (spawnArea) {
            case 0: // 顶部区域 - 较自然的分布
              // X位置：整个宽度范围内随机，稍微向中心集中
              this.x = 20 + Math.pow(Math.random(), 0.8) * (width - 40);
              // Y位置：刚好在画布上方，有轻微的变化
              this.y = -10 - Math.random() * 15;
              // 速度：确保向下移动但有变化，水平方向随机
              this.speedY = 0.3 + Math.random() * 0.7; // 更大的速度范围
              this.speedX = (Math.random() - 0.5) * 1.2; // 更宽的水平速度分布
              break;

            case 1: // 右侧区域 - 自然不均匀分布
              // X位置：画布右侧，有变化
              this.x = width + 5 + Math.random() * 15;
              // Y位置：整个高度范围内随机，但有轻微倾向于中心
              const centerBias = (Math.random() + Math.random()) / 2; // 产生中心偏好
              this.y = centerBias * height;
              // 速度：向左移动但速度有变化
              this.speedX = -(0.4 + Math.random() * 0.8); // 自然的速度分布
              this.speedY = (Math.random() - 0.5) * 0.9; // 垂直速度
              // 小概率有更大的垂直速度
              if (Math.random() < 0.1) {
                this.speedY *= 2;
              }
              break;

            case 2: // 底部区域 - 自然分布
              // X位置：整个宽度范围内随机，有轻微向中心的倾向
              this.x = width * (0.1 + 0.8 * Math.random()); // 避开极端边缘
              // Y位置：刚好在画布下方，有变化
              this.y = height + 5 + Math.random() * 15;
              // 速度：确保向上移动但有变化，水平方向随机
              this.speedY = -(0.3 + Math.random() * 0.7); // 更大的速度范围
              this.speedX = (Math.random() - 0.5) * 1.2; // 更宽的水平速度分布
              break;
          }
        }
        // 特殊区域生成（20%的粒子）- 增加更多变化
        else {
          // 其他随机位置，避开左侧区域
          if (Math.random() < 0.5) {
            // 随机位置在画布内
            this.x = 100 + Math.random() * (width - 120);
            this.y = Math.random() * height;
            // 更随机的速度
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.5;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
          } else {
            // 对角线生成 - 右上或右下
            if (Math.random() < 0.5) {
              // 右上
              this.x = width * (0.7 + 0.3 * Math.random());
              this.y = -10 - Math.random() * 10;
              this.speedX = -(0.2 + Math.random() * 0.4);
              this.speedY = 0.3 + Math.random() * 0.5;
            } else {
              // 右下
              this.x = width * (0.7 + 0.3 * Math.random());
              this.y = height + 10 + Math.random() * 10;
              this.speedX = -(0.2 + Math.random() * 0.4);
              this.speedY = -(0.3 + Math.random() * 0.5);
            }
          }
        }

        // 确保水平速度不会太小
        if (Math.abs(this.speedX) < 0.2) {
          this.speedX =
            Math.sign(this.speedX || 1) * (0.2 + Math.random() * 0.2);
        }

        // 安全检查 - 确保没有粒子意外出现在左侧边缘
        if (this.x < 0) {
          // 强制移到画布右侧
          this.x = width * 0.7 + Math.random() * (width * 0.3);
          this.speedX = -(0.3 + Math.random() * 0.5); // 向左移动
        }

        // 随机化粒子的物理特性 - 增加差异性
        // 大小有更多变化
        this.baseSize = 0.8 + Math.random() * 2.5;

        // 生命周期也更加随机
        this.life = 0;
        this.maxLife = 150 + Math.random() * 200; // 更长的生命周期
        this.fadeSpeed = 0.007 + Math.random() * 0.007; // 更自然的淡入淡出速度

        // 更新核心和发光大小，增加一点随机性
        this.size = this.baseSize * 0.5; // 初始时大小略小，逐渐增大
        this.glowSize = this.baseSize * 2; // 初始发光半径较小

        // 确保粒子初始透明度很低，平滑出现
        this.opacity = 0.1;

        // 调试日志可在此处添加
        debugLog(
          `粒子已重置: 位置(${this.x.toFixed(1)},${this.y.toFixed(
            1
          )}), 速度(${this.speedX.toFixed(2)},${this.speedY.toFixed(2)})`
        );
      }

      /**
       * 绘制粒子
       * @param ctx 绘图上下文
       */
      draw(ctx: CanvasRenderingContext2D) {
        // 绘制发光效果
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.4; // 发光效果使用较低不透明度
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 绘制粒子核心
        ctx.save();
        ctx.globalAlpha = this.opacity;
        // 使用噪声创建更自然的有机运动效果
        // 为每个粒子使用略微不同的噪声参数，增加随机性
        const noiseScale =
          0.003 + Math.sin(this.individualTime * 0.001) * 0.0005; // 轻微变化的噪声尺度
        const noiseX =
          noise.get(this.x * noiseScale, this.individualTime * 0.003) * 0.7;
        const noiseY =
          noise.get(this.individualTime * 0.004, this.y * noiseScale) * 0.7;

        // 随机性波动 - 增加小的随机脉冲
        const randomPulse =
          Math.sin(this.individualTime * 0.02) * Math.random() * 0.03;

        // 应用噪声到速度 - 保持左侧区域粒子向右移动
        if (this.x < 50) {
          // 左侧区域特殊处理
          if (this.speedX <= 0) {
            // 如果向左移动，给一个向右的推力
            this.speedX = 0.3 + Math.random() * 0.4;
          } else {
            // 已经向右移动，保持并增加一点随机性
            this.speedX += Math.abs(noiseX) * 0.03 + randomPulse;
            this.speedX *= 0.98; // 轻微阻力
          }
        } else if (this.x < 100) {
          // 靠近左侧区域，增加向右的倾向
          this.speedX += noiseX * 0.07 + randomPulse;
          // 确保不会太慢
          if (this.speedX < 0.1 && this.speedX > -0.1) {
            this.speedX += Math.random() * 0.2 - 0.05;
          }
          this.speedX *= 0.97; // 中等阻力
        } else {
          // 正常区域 - 完全自然运动
          this.speedX += noiseX * 0.1 + randomPulse;
          // 随机速度脉冲，增加运动的不规则性
          if (Math.random() < 0.01) {
            this.speedX += (Math.random() - 0.5) * 0.3;
          }
          this.speedX *= 0.96; // 正常阻力
        }

        // Y轴速度更加自由和随机，增加更多自然感
        this.speedY += noiseY * 0.1;
        // 增加垂直方向的随机变化
        if (Math.random() < 0.02) {
          this.speedY += (Math.random() - 0.5) * 0.25;
        }
        this.speedY *= 0.96;

        // 速度限制，防止粒子移动过快
        const maxSpeed = 2.0;
        if (Math.abs(this.speedX) > maxSpeed) {
          this.speedX = Math.sign(this.speedX) * maxSpeed;
        }
        if (Math.abs(this.speedY) > maxSpeed) {
          this.speedY = Math.sign(this.speedY) * maxSpeed;
        }

        // 完全新的处理方式：先检查更新后的位置是否会落在特殊区域，然后再更新
        const nextX = this.x + this.speedX;
        const nextY = this.y + this.speedY;

        // 预先处理边界情况
        if (nextX > width + 30) {
          // 将要超出右边界，直接传送到左侧
          this.x = -5;
          // 设置随机化的向右速度 - 更自然的变化
          this.speedX = 0.7 + Math.random() * 0.7;
          // 保持Y位置和速度，但轻微改变以增加随机性
          this.y += this.speedY + (Math.random() - 0.5) * 5;
          // 轻微改变Y速度增加随机性
          this.speedY += (Math.random() - 0.5) * 0.2;
        } else if (nextX < -30) {
          // 将要超出左边界太远，重置粒子
          this.resetParticle();
          return;
        } else {
          // 正常更新位置
          this.x = nextX;
          this.y = nextY;
        }

        // 简化的上下边界处理 - 更随机的重新进入
        if (this.y < -30) {
          this.y = height + Math.random() * 10;
          // 轻微改变水平速度增加随机性
          this.speedX += (Math.random() - 0.5) * 0.3;
        }
        if (this.y > height + 30) {
          this.y = -5 - Math.random() * 10;
          // 轻微改变水平速度增加随机性
          this.speedX += (Math.random() - 0.5) * 0.3;
        }

        // 生命周期和大小更新 - 添加随机性波动
        this.life += this.fadeSpeed * (0.9 + Math.random() * 0.2);
        if (this.life >= this.maxLife) {
          this.resetParticle();
          return;
        }

        // 根据生命周期和随机波动计算大小
        const lifeRatio = this.life / this.maxLife;
        const sizeVariation = Math.sin(this.individualTime * 0.05) * 0.15; // 小的大小波动

        if (lifeRatio < 0.2) {
          // 淡入阶段 - 带有更自然的波动
          this.size =
            this.baseSize *
            easing.easeOutQuint(lifeRatio * 5) *
            (1 + sizeVariation);
          this.glowSize = this.size * (6 + Math.random() * 0.5);
        } else if (lifeRatio > 0.8) {
          // 淡出阶段 - 带有更自然的波动
          this.size =
            this.baseSize *
            easing.easeOutQuint((1 - lifeRatio) * 5) *
            (1 + sizeVariation);
          this.glowSize = this.size * (6 + Math.random() * 0.5);
        } else {
          // 保持阶段 - 轻微波动
          this.size = this.baseSize * (1 + sizeVariation);
          this.glowSize =
            this.size * (6 + Math.sin(this.individualTime * 0.03) * 0.8);
        }

        // 鼠标交互效果 - 更自然的反应
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            // 计算一个更自然的力，包含距离衰减和随机性
            const force =
              (1 - dist / mouse.radius) * (0.2 + Math.random() * 0.05);
            // 添加轻微的旋转效果
            const angle = Math.atan2(dy, dx);
            const rotEffect = 0.2;
            this.speedX +=
              (dx * Math.cos(angle) - dy * Math.sin(angle) * rotEffect) * force;
            this.speedY +=
              (dy * Math.cos(angle) + dx * Math.sin(angle) * rotEffect) * force;
            // 大小变化更加自然
            this.size += this.baseSize * force * (1 + Math.random() * 0.3);
            this.glowSize = this.size * (6 + Math.random());
          }
        }

        // 填充粒子核心
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /**
     * 创建爆炸效果 - 点击交互时触发
     * @param x 爆炸中心X坐标
     * @param y 爆炸中心Y坐标
     * @param count 产生的粒子数量
     */
    function createExplosion(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        // 在点击位置创建新粒子
        const particle = new Particle(x, y);
        // 设置较大的随机速度，但比原来慢
        particle.speedX = (Math.random() - 0.5) * 2;
        particle.speedY = (Math.random() - 0.5) * 2;
        // 设置合适的粒子尺寸，避免过大
        particle.baseSize = Math.random() * 3 + 1.5;
        particle.size = particle.baseSize;
        particle.glowSize = particle.size * 4;
        // 设置较短的生命周期，但比原来长
        particle.life = 0;
        particle.maxLife = 60 + Math.random() * 30;
        // 设置初始透明度较低，逐渐显现
        particle.opacity = 0.6;
        particles.push(particle);
      }
    }

    /**
     * 光束类 - 创建戏剧性的光线效果
     */
    class Beam {
      x: number; // 起始X坐标
      y: number; // 起始Y坐标
      targetX: number; // 目标X坐标
      targetY: number; // 目标Y坐标
      width: number; // 光束宽度
      length: number; // 光束长度
      colorIndex: number; // 颜色索引（使用索引避免存储颜色字符串）
      angle: number; // 光束角度
      speed: number; // 移动速度

      /**
       * 创建一个新光束
       */
      constructor() {
        // 初始化在画布上方随机位置
        this.x = Math.random() * width;
        this.y = -100; // 从画布上方开始
        // 设置目标位置（通常向下穿过画布）
        this.targetX = Math.random() * width;
        this.targetY = height + 100;
        // 设置光束尺寸
        this.width = 20 + Math.random() * 30;
        this.length = height * 1.5;

        // 使用索引选择颜色，避免存储颜色字符串
        this.colorIndex =
          Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2;

        // 设置角度和速度 - 主要向下方向，但速度更慢
        this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.4; // 主要向下
        this.speed = 0.0005 + Math.random() * 0.0008; // 降低速度
      }

      /**
       * 重置光束状态
       */
      resetBeam() {
        // 重新初始化光束位置和属性
        this.x = Math.random() * width;
        this.y = -100;
        this.targetX = Math.random() * width;
        this.targetY = height + 100;
        this.width = 20 + Math.random() * 30;
        this.length = height * 1.5;
        this.colorIndex =
          Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2;
        this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        this.speed = 0.0005 + Math.random() * 0.0008;
      }

      /**
       * 更新光束状态
       * @param time 当前动画时间
       */
      update(time: number) {
        // 缓慢移动光束，降低移动幅度
        this.x += Math.sin(time * this.speed * 0.5) * 0.3;
        this.angle = Math.PI / 2 + Math.sin(time * this.speed * 0.3) * 0.1;

        // 小概率重置光束 - 创造变化感
        if (Math.random() < 0.001) {
          // 降低重置概率
          this.resetBeam();
        }
      }

      /**
       * 绘制光束
       * @param ctx 绘图上下文
       */
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // 根据颜色索引获取预定义颜色 - 避免动态生成
        let glowColor = PRIMARY_GLOW;
        let baseColor = PRIMARY_BASE;

        if (this.colorIndex === 1) {
          glowColor = SECONDARY_GLOW;
          baseColor = SECONDARY_BASE;
        } else if (this.colorIndex === 2) {
          glowColor = TERTIARY_GLOW;
          baseColor = TERTIARY_BASE;
        }

        // 创建光束渐变色
        const gradientX = this.x + Math.cos(this.angle) * this.length;
        const gradientY = this.y + Math.sin(this.angle) * this.length;

        const gradient = ctx.createLinearGradient(
          this.x,
          this.y,
          gradientX,
          gradientY
        );

        // 设置渐变色停止点
        gradient.addColorStop(0, baseColor); // 起始点较亮
        gradient.addColorStop(0.4, glowColor); // 中部较淡
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // 末端透明

        // 使用叠加混合模式增强发光效果
        ctx.globalCompositeOperation = "screen";
        // 移动到光束起点并旋转
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 绘制光束三角形
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.width / 2, this.length);
        ctx.lineTo(this.width / 2, this.length);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
      }
    }

    /**
     * 光球类 - 创建漂浮的光源
     */
    class Orb {
      x: number; // X坐标
      y: number; // Y坐标
      size: number; // 大小
      color: string; // 颜色
      baseGlowSize: number; // 基础发光大小
      glowSize: number; // 当前发光大小
      pulseSpeed: number; // 脉动速度
      pulsePhase: number; // 脉动相位
      speedX: number; // X方向速度
      speedY: number; // Y方向速度
      lastGlowSize: number; // 上一帧的发光大小，用于平滑过渡
      fadeState: number; // 淡入淡出状态: 0=淡入, 1=稳定, 2=淡出
      life: number; // 生命周期
      maxLife: number; // 最大生命值
      opacity: number; // 不透明度

      /**
       * 创建一个新光球
       */
      constructor() {
        // 随机位置
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // 较大的粒子大小 - 缩小初始大小范围
        this.size = 2 + Math.random() * 3;

        // 选择颜色 - 安全解析
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
          this.color = PRIMARY_COLOR; // 50%概率使用主色
        } else if (colorChoice < 0.85) {
          this.color = SECONDARY_COLOR; // 35%概率使用次要色
        } else {
          this.color = TERTIARY_COLOR; // 15%概率使用第三色
        }

        // 设置发光大小和脉动效果 - 降低初始基础发光大小
        this.baseGlowSize = this.size * 6;
        // 初始时让发光大小稍小，避免一开始就很亮
        this.glowSize = this.baseGlowSize * 0.7;
        this.lastGlowSize = this.glowSize; // 初始化上一帧大小
        this.pulseSpeed = 0.01 + Math.random() * 0.01; // 进一步降低脉动速度
        this.pulsePhase = Math.random() * Math.PI * 2; // 随机相位，让每个光球有独特的脉动

        // 设置较慢的移动速度
        this.speedX = (Math.random() - 0.5) * 0.1; // 进一步降低速度
        this.speedY = (Math.random() - 0.5) * 0.1;

        // 初始化生命周期
        this.fadeState = 0; // 开始淡入
        this.life = 0;
        this.maxLife = 500 + Math.random() * 500; // 更长的生命周期
        this.opacity = 0.1; // 初始透明度低
      }

      /**
       * 更新光球状态
       * @param time 当前动画时间
       */
      update(time: number) {
        // 更新生命周期
        this.life += 1;

        // 淡入淡出控制
        if (this.fadeState === 0) {
          // 淡入
          this.opacity = Math.min(0.85, this.life / 80);
          if (this.opacity >= 0.85) this.fadeState = 1;
        } else if (this.fadeState === 1) {
          // 稳定期
          this.opacity =
            0.85 - Math.sin(time * 0.0008 + this.pulsePhase) * 0.05;
          // 检查是否该进入淡出阶段
          if (this.life > this.maxLife - 100) this.fadeState = 2;
        } else {
          // 淡出
          this.opacity = Math.max(0, (this.maxLife - this.life) / 100);
          // 检查是否该重置
          if (this.opacity <= 0.05) {
            this.resetOrb();
            return;
          }
        }

        // 缓存上一帧的发光大小
        this.lastGlowSize = this.glowSize;

        // 脉动效果 - 大小随时间变化，降低波动速度和幅度
        // 使用加权平均平滑过渡
        const targetGlowSize =
          this.baseGlowSize *
          (0.8 +
            Math.sin(time * this.pulseSpeed * 0.5 + this.pulsePhase) * 0.15);

        // 平滑插值到目标大小，避免突变
        this.glowSize = this.lastGlowSize * 0.8 + targetGlowSize * 0.2;

        // 缓慢移动并添加微小的波动，降低波动幅度
        this.x +=
          this.speedX * 0.5 + Math.sin(time * 0.0005 + this.pulsePhase) * 0.1;
        this.y +=
          this.speedY * 0.5 + Math.cos(time * 0.0005 + this.pulsePhase) * 0.1;

        // 环绕边界处理
        if (this.x < -this.glowSize) this.x = width + this.glowSize;
        if (this.x > width + this.glowSize) this.x = -this.glowSize;
        if (this.y < -this.glowSize) this.y = height + this.glowSize;
        if (this.y > height + this.glowSize) this.y = -this.glowSize;
      }

      /**
       * 重置光球
       */
      resetOrb() {
        // 随机新位置
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        // 重置生命周期
        this.life = 0;
        this.maxLife = 500 + Math.random() * 500;
        this.fadeState = 0;
        this.opacity = 0.1;

        // 随机新颜色
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
          this.color = PRIMARY_COLOR;
        } else if (colorChoice < 0.85) {
          this.color = SECONDARY_COLOR;
        } else {
          this.color = TERTIARY_COLOR;
        }

        // 随机新大小
        this.size = 2 + Math.random() * 3;
        this.baseGlowSize = this.size * 6;
        this.glowSize = this.baseGlowSize * 0.6;
        this.lastGlowSize = this.glowSize;

        // 随机新移动
        this.speedX = (Math.random() - 0.5) * 0.1;
        this.speedY = (Math.random() - 0.5) * 0.1;

        // 随机新脉动
        this.pulseSpeed = 0.01 + Math.random() * 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      /**
       * 绘制光球
       * @param ctx 绘图上下文
       */
      draw(ctx: CanvasRenderingContext2D) {
        // 应用不透明度控制
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // 创建径向渐变发光效果
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.glowSize
        );

        // 设置渐变色停止点
        gradient.addColorStop(0, hexToRgba(this.color, 0.7)); // 中心较亮
        gradient.addColorStop(0.3, hexToRgba(this.color, 0.2)); // 中间区域较淡
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // 边缘透明

        // 使用叠加混合模式增强发光效果
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = gradient;

        // 绘制发光范围
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fill();

        // 绘制光球核心 - 纯白色
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    /**
     * 绘制交互消息
     * @param ctx 绘图上下文
     */
    function drawMessage(ctx: CanvasRenderingContext2D) {
      if (showMessage && currentMessage) {
        const fontSize = 20;
        ctx.save();
        // 设置字体和文本对齐方式
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 计算消息背景框的尺寸
        const textWidth = ctx.measureText(currentMessage).width;
        const padding = 20;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = fontSize + padding;
        const topMargin = 50; // 顶部边距

        // 绘制消息背景框 - 半透明黑色圆角矩形
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.roundRect(
          width / 2 - boxWidth / 2,
          topMargin,
          boxWidth,
          boxHeight,
          10 // 圆角半径
        );
        ctx.fill();

        // 绘制消息文本
        ctx.fillStyle = PRIMARY_COLOR; // 使用主题色
        ctx.fillText(currentMessage, width / 2, topMargin + boxHeight / 2);
        ctx.restore();
      }
    }

    /**
     * 初始化粒子系统
     * 创建均匀分布的粒子，并避免左侧边缘堆积
     */
    function initParticles() {
      particles.length = 0; // 清空数组，确保没有旧粒子

      // 分批次创建粒子，避免一次性全部出现造成闪烁
      const batchSize = 10; // 每批次创建的粒子数量
      const batchDelay = 100; // 批次之间的延迟(毫秒)
      const createBatch = (batchIndex) => {
        if (batchIndex * batchSize >= maxParticles) return;

        for (
          let i = 0;
          i < batchSize && batchIndex * batchSize + i < maxParticles;
          i++
        ) {
          const p = new Particle();

          // 为每批次粒子设置不同的初始生命周期阶段，避免同时达到最亮状态
          p.life = Math.floor(Math.random() * 30); // 随机初始生命值
          p.opacity = (p.life / 30) * 0.6; // 根据生命值计算初始透明度

          // 初始化时更均匀地分布粒子，完全避开左侧
          const edge = Math.random();
          if (edge < 0.33) {
            // 顶部区域 - 上部1/3区域
            p.x = Math.random() * width;
            p.y = Math.random() * (height / 3);
          } else if (edge < 0.66) {
            // 右侧区域 - 右部1/3区域
            p.x = Math.random() * (width / 3) + (width * 2) / 3;
            p.y = Math.random() * height;
          } else {
            // 底部区域 - 下部1/3区域
            p.x = Math.random() * width;
            p.y = Math.random() * (height / 3) + (height * 2) / 3;
          }

          // 确保没有粒子初始化在左侧边缘附近
          if (p.x < 20) {
            p.x = Math.random() * (width - 40) + 20; // 至少距离左边20像素
          }

          particles.push(p);
        }

        // 计划下一批次
        setTimeout(() => createBatch(batchIndex + 1), batchDelay);
      };

      // 开始第一批次创建
      createBatch(0);
    }

    /**
     * 初始化光束效果
     */
    function initBeams() {
      beams.length = 0; // 清空现有光束
      for (let i = 0; i < beamCount; i++) {
        beams.push(new Beam());
      }
    }

    /**
     * 初始化光球效果
     */
    function initOrbs() {
      orbs.length = 0; // 清空现有光球

      // 分批次创建光球，避免同时出现
      const createOrb = (index, total) => {
        if (index >= total) return;

        const orb = new Orb();
        // 错开每个光球的生命周期，避免同时进入淡出阶段
        orb.life = Math.floor(Math.random() * 200);
        orb.opacity = Math.min(0.5, orb.life / 80);
        orb.fadeState = orb.opacity >= 0.5 ? 1 : 0;
        orbs.push(orb);

        // 延迟创建下一个光球
        setTimeout(() => createOrb(index + 1, total), 300);
      };

      // 随机生成5-7个光球，分批创建
      const orbCount = 5 + Math.floor(Math.random() * 3);
      createOrb(0, orbCount);
    }

    /**
     * 动画渲染函数 - 每帧调用
     * @param timestamp 当前时间戳
     */
    function draw(timestamp: number) {
      // 帧率控制 - 限制最高帧率
      const elapsed = timestamp - lastRenderTime;
      if (elapsed < frameDelay) {
        requestAnimationFrame(draw);
        return;
      }
      lastRenderTime = timestamp - (elapsed % frameDelay);

      // 更新动画时间 - 减小增量使整体变化更缓慢
      time += 0.2;

      // 清空离屏画布
      offscreenCtx.clearRect(0, 0, width, height);

      // 先绘制背景层的光束
      beams.forEach((beam) => {
        beam.update(time);
        beam.draw(offscreenCtx);
      });

      // 绘制中间层的光球
      orbs.forEach((orb) => {
        orb.update(time);
        orb.draw(offscreenCtx);
      });

      // 绘制前景层的粒子
      particles.forEach((particle) => {
        particle.update(time);
        particle.draw(offscreenCtx);
      });

      // 绘制UI消息
      drawMessage(offscreenCtx);

      // 应用模糊效果增强发光
      ctx.clearRect(0, 0, width, height);
      ctx.filter = "blur(1px)"; // 轻微模糊增强发光效果
      ctx.drawImage(offscreenCanvas, 0, 0);
      ctx.filter = "none";
      ctx.drawImage(offscreenCanvas, 0, 0); // 再次绘制清晰版本增强效果

      // 请求下一帧
      requestAnimationFrame(draw);
    }

    /**
     * 处理用户点击事件
     * @param x 点击X坐标
     * @param y 点击Y坐标
     */
    function handleClick(x: number, y: number) {
      // 创建爆炸效果
      createExplosion(x, y, 15); // 在点击位置创建15个粒子
    }

    /**
     * 设置事件监听器
     */
    // 鼠标移动事件 - 更新鼠标位置
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    // 鼠标进入画布 - 激活鼠标交互
    canvas.addEventListener("mouseenter", () => {
      mouse.active = true;
    });

    // 鼠标离开画布 - 停用鼠标交互
    canvas.addEventListener("mouseleave", () => {
      mouse.active = false;
    });

    // 鼠标点击事件 - 触发粒子爆炸效果
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleClick(x, y);
    });

    /**
     * 触摸屏支持 - 移动设备交互
     */
    // 触摸开始事件
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault(); // 阻止默认行为
      mouse.active = true;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      handleClick(mouse.x, mouse.y); // 触发点击效果
    });

    // 触摸移动事件
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    });

    // 触摸结束事件
    canvas.addEventListener("touchend", () => {
      mouse.active = false;
    });

    // 窗口大小变化事件
    window.addEventListener("resize", handleResize);

    /**
     * 初始化并启动动画
     */
    // 创建初始粒子、光束和光球
    initParticles();
    initBeams();
    initOrbs();

    // 启动动画循环
    requestAnimationFrame(draw);

    /**
     * 组件卸载时的清理函数
     * 移除事件监听器和定时器，防止内存泄漏
     */
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mouseenter", () => {
        mouse.active = true;
      });
      canvas.removeEventListener("mouseleave", () => {
        mouse.active = false;
      });
      window.clearTimeout(messageTimer);
    };
  }, []); // 空依赖数组确保效果只运行一次

  /**
   * 组件渲染部分 - 只返回一个canvas元素
   */
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", // 绝对定位覆盖整个容器
        top: 0,
        left: 0,
        width: "100%", // 填满父容器
        height: "100%",
        pointerEvents: "auto", // 允许交互
        cursor: "pointer", // 显示指针样式
      }}
    />
  );
}
