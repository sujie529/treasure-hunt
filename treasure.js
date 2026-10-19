// ============================================================
// 寻宝游戏（异步版 / async-await）
// 模拟一场分多阶段进行的寻宝冒险，每一步都是一个异步操作。
// 相比原 Promise 链式版本，这里新增了多个有趣的寻宝情节，
// 并用 async/await + try/catch + 重试机制重写了整个流程。
// ============================================================

// 工具：延迟指定毫秒（返回 Promise，模拟探索/网络耗时）
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 工具：在基础耗时上加入随机抖动，让每次冒险的节奏略有不同
const wander = (base, spread = 300) => sleep(base + Math.random() * spread);

// 工具：带重试的异步执行器 —— 失败时自动重试，最多 maxAttempts 次
async function withRetry(task, maxAttempts = 3, retryDelay = 800) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (err) {
      if (attempt >= maxAttempts) throw err; // 重试耗尽，抛出最终错误
      console.warn(`    ↻ 第 ${attempt} 次尝试失败：${err.message}，稍后重试...`);
      await sleep(retryDelay);
    }
  }
}

// ============================================================
// 宝藏地图 API —— 每一个静态方法都代表寻宝中的一个阶段
// ============================================================
class TreasureMap {
  // 阶段1：在图书馆获取初始线索
  static async getInitialClue() {
    await wander(1000);
    return "在古老的图书馆里找到了第一个线索...";
  }

  // 阶段2：解码古代文字
  static async decodeAncientScript(clue) {
    await wander(1500);
    if (!clue) throw new Error("没有线索可以解码！");
    return "解码成功！宝藏藏在一座古老的神庙中...";
  }

  // 阶段3（新）：穿越迷雾沼泽 —— 有 30% 概率迷失方向
  static async crossFoggySwamp() {
    await wander(2000);
    if (Math.random() < 0.3) throw new Error("糟糕！在迷雾沼泽里迷失了方向！");
    return "成功穿越迷雾沼泽，前方出现一条隐秘的小路...";
  }

  // 阶段4（新）：解答神秘商人的谜题 —— 有 25% 概率答错
  static async solveMerchantRiddle() {
    await wander(2200);
    if (Math.random() < 0.25) throw new Error("答错了商人的谜题，被要求重来！");
    return "答对谜题！神秘商人送给你一张残缺的藏宝图...";
  }

  // 阶段5（新）：走出镜子迷宫 —— 有 20% 概率迷失
  static async navigateMirrorMaze() {
    await wander(2500);
    if (Math.random() < 0.2) throw new Error("在镜子迷宫里撞晕了头！");
    return "走出了镜子迷宫，古老的神庙就在眼前...";
  }

  // 阶段6：在神庙中搜寻
  static async searchTemple(location) {
    await wander(2000);
    if (Math.random() < 0.4) throw new Error("糟糕！遇到了神庙守卫！");
    return `根据线索「${location}」，找到了一个神秘的箱子...`;
  }

  // 阶段7（新）：与神庙守卫周旋 —— 用重试机制反复尝试
  static async defeatGuardian() {
    await wander(1500);
    if (Math.random() < 0.5) throw new Error("神庙守卫太强了，需要再试一次！");
    return "成功绕过了神庙守卫，来到了宝箱面前...";
  }

  // 阶段8：打开宝箱
  static async openTreasureBox() {
    await wander(1200);
    return "恭喜！你找到了传说中的宝藏！";
  }
}

// ============================================================
// 寻宝主流程 —— 用 async/await 串起所有阶段
// ============================================================
async function findTreasure() {
  console.log("🧭 寻宝之旅开始！\n");

  try {
    // 依次 await 每个阶段；有风险的情节包裹在 withRetry 里自动重试
    const clue = await TreasureMap.getInitialClue();
    console.log("📜", clue);

    const location = await TreasureMap.decodeAncientScript(clue);
    console.log("🔍", location);

    const swamp = await withRetry(() => TreasureMap.crossFoggySwamp());
    console.log("🌫️ ", swamp);

    const map = await withRetry(() => TreasureMap.solveMerchantRiddle());
    console.log("🤝", map);

    const maze = await withRetry(() => TreasureMap.navigateMirrorMaze());
    console.log("🪞", maze);

    const box = await withRetry(() => TreasureMap.searchTemple(location));
    console.log("🏛️ ", box);

    const guard = await withRetry(() => TreasureMap.defeatGuardian());
    console.log("⚔️ ", guard);

    const treasure = await TreasureMap.openTreasureBox();
    console.log("🎁", treasure);

    console.log("\n✨ 冒险圆满结束，宝藏到手！✨");
  } catch (error) {
    console.error("💀 任务失败：", error.message);
  }
}

// 启动寻宝
findTreasure();

// 导出，方便在其他模块中复用
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TreasureMap, findTreasure, withRetry, sleep };
}
