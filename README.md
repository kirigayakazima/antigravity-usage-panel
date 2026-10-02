# ⚡ Antigravity Usage Panel

> Google 反重力桌面端（Antigravity Desktop）实时额度与用量监控面板  
> 原生注入 Electron 主世界 · 对齐 DSH 设计语言 · 100% 动态数据绑定

---

## 功能概览

### 🔲 顶栏常驻微晶胶囊

注入到反重力桌面端右上角标题栏区域，无需打开任何窗口即可实时感知关键指标。

- **绿色呼吸脉冲点**：代表守护进程在线
- **垂直滚动轮播**（每 2.2 秒平滑切换）：
  - `5h余: 2.2% · ~2.3M` — 当前 5 小时限额剩余百分比及反推预估 Token 数
  - `今日用量: 1.06亿 · 85.6%命中` — 今日累计消耗 Token 数及缓存命中率
- **倒计时**：最紧迫配额桶的剩余重置时间
- 点击胶囊即可展开全屏监控大屏

---

### 🖥️ 全屏监控大屏（点击胶囊弹出）

内嵌于反重力桌面端页面，无需切换窗口。具备以下 6 个功能标签页：

---

#### 1. 额度标签页 `额度`

> 实时展示反重力 Language Server 上报的所有配额桶状态，数据每 120 秒采样一次。

**账号与服务状态卡片**：
- 账号邮箱、用户名
- Prompt Credits 余额
- LS 端口号与最后刷新时间

**各分组配额桶卡片**（动态生成，按分组聚合）：
| 字段 | 说明 |
|---|---|
| 当前剩余 % | 实时剩余额度百分比，配色：绿≥60%、橙≥25%、红<25% |
| 预估剩余 Token | 根据今日/近7日实际消耗量反推的可用 Token 数 |
| 窗口上限 | 反推所得的单窗口总容量估算 |
| 已用 / 剩余 | 占比条形图 |
| 重置倒计时 | 精确到秒 |
| 预计重置时间 | 本地时间格式 |
| 窗口类型 | 5h / weekly / monthly / custom |

**支持的模型状态列表**：展示 LS 上报的所有支持模型（含高亮标记）

---

#### 2. 趋势标签页 `趋势`

> 从 `~/.dsh/antigravity-usage/history.jsonl` 读取历史采样点，渲染动态时序折线图。

- 时间范围筛选：**24小时 / 7天 / 30天 / 全部**
- SVG 折线图，Y 轴 0–100% 网格线，X 轴时间刻度
- 每条桶（bucket）一条折线，不同颜色区分
- 下方展示各桶的**24h/7d 消耗量**与**重置次数**汇总卡片

---

#### 3. 热力图标签页 `热力图`

> 读取本地 Antigravity SQLite 会话数据库，渲染近 **182 天** GitHub 风格日历热力图。

- 指标切换：**会话数 / 步数 / Token / 缓存读取**
- 顶部月份标签（按列位置动态绝对定位）
- 左侧星期标签（一 / 三 / 五）
- 翠绿色系 5 级深度：`rgba(128,128,128,0.16)` → `#16a34a`
- 鼠标悬停放大 + 绿色描边，今日格子蓝色高亮
- 深色模式自动适配

---

#### 4. 汇总标签页 `汇总`

> 逐日活跃与用量统计表，全量离线数据，无需网络。

| 列 | 内容 |
|---|---|
| 日期 | `YYYY-MM-DD` |
| 会话 | 当日活跃会话数 |
| 步数 | 生成步总数 |
| 调用 | 模型调用次数（genCalls） |
| 未命中输入 | 非缓存输入 Token |
| 输出 Token | 模型输出 Token |
| 缓存读取 | 缓存命中 Token |
| 缓存命中率 | 缓存读取 / 总输入 |

顶部时间范围筛选（今天 / 7天 / 14天 / 近30天 / 近90天 / 全部）

---

#### 5. 重置标签页 `重置`

> 全量配额桶重置监控表，一览无余。

| 列 | 内容 |
|---|---|
| 配额桶 | displayName（如 Five Hour Limit Remaining） |
| 当前剩余 | 剩余百分比 |
| 预估剩余 Token | 动态反推值（如 ~2.3M） |
| 已用比例 | 1 - remaining |
| 重置倒计时 | 精确剩余时长 |
| 预计重置时间 | 本地绝对时间 |
| 窗口类型 | 5h / weekly / 自定义 |

---

#### 6. 会话标签页 `会话`

> 离线读取反重力本地 SQLite 数据库，完全不需要反重力联网。

- **工作区筛选胶囊**：点击可过滤指定工作区的会话
- **全文搜索**：对会话标题、摘要、工作区实时过滤
- **各模型用量汇总**：调用次数、输入/输出/缓存 Token、命中率
- **会话明细列表**：完整字段，按最后修改时间倒序

---

## 架构说明

```
antigravity-usage-panel/
├── daemon.mjs              # 独立 HTTP 守护进程 (端口 19388)
├── inject/
│   └── native-inject.js    # 注入到 Electron 渲染层的全量 UI 代码 (v4.4)
├── bin/
│   ├── inject-install.mjs  # 解包 app.asar.bak → 注入 → 打包为 app.asar
│   ├── inject-uninstall.mjs
│   └── lifecycle-hook.mjs  # 主进程伴随守护钩子
├── lib/
│   ├── conversations.js    # 离线 SQLite 会话扫描器
│   └── history.js          # JSONL 历史采样存储 (HistoryStore)
└── sidecars/panel/         # 可选 Sidecar 独立窗口面板
```

### 守护进程 API（`http://127.0.0.1:19388`）

| 路由 | 说明 |
|---|---|
| `GET /api/ping` | 健康检查 |
| `GET /api/quota` | Language Server 配额数据透传 |
| `GET /api/conversations` | 离线 SQLite 会话扫描结果 |
| `GET /api/history?range=24h` | 历史采样点查询（支持 24h/7d/30d/all） |
| `GET /api/all` | quota + conversations 合并一次性返回 |

### 注入机制

1. `bin/inject-install.mjs` 解包**官方纯净** `app.asar.bak`（永不修改此备份）
2. 向 `dist/utils.js` 注入 `webContents.executeJavaScript` 挂载器（绕过 contextIsolation）
3. 向 `dist/main.js` 注入守护进程生命周期钩子（桌面端启动即自动拉起端口 19388）
4. 重新打包为 `app.asar` 并覆盖原文件

---

## 安装与使用

### 前置条件

- Node.js 18+
- Google Antigravity Desktop 已安装（`app.asar` 存在）
- Antigravity Language Server 运行中（用于实时配额数据）

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/kirigayakazima/antigravity-usage-panel.git
cd antigravity-usage-panel

# 2. 安装依赖
npm install

# 3. 首次备份（仅需一次，保留纯净 app.asar.bak）
# inject-install 会自动检测并保护已存在的备份

# 4. 注入安装
npm run inject:install

# 5. 重启 Antigravity Desktop，或在桌面端内按 Ctrl+R 重载页面
```

### 日常更新

修改 `inject/native-inject.js` 后：

```bash
npm run inject:install
# 然后在 Antigravity Desktop 内按 Ctrl+R
```

### 卸载

```bash
npm run inject:uninstall
```

---

## Token 预算反推算法

由于反重力官方 API 只暴露「剩余额度百分比」而非绝对 Token 数，本面板采用以下方法估算：

```
5h  桶: cap = 今日实际消耗 Token ÷ 已用比例   (已用 ≥ 0.5% 时生效)
周  桶: cap = 近7日实际消耗 Token ÷ 已用比例  (已用 ≥ 0.5% 时生效)
兜底默认: 5h ≈ 104M，weekly ≈ 623M
预估剩余 = cap × remaining
```

---

## 开发说明

- **编码**：`inject/native-inject.js` 必须以 UTF-8 保存，防止 GBK 乱码注入
- **调试**：按 F12 打开反重力桌面端开发者工具（inject 已解锁），查看 `[Antigravity Quota HUD v4.4]` 日志
- **历史日志**：注入层 `console.*` 输出同步写入 `renderer.log`

---

## License

MIT © [kirigayakazima](https://github.com/kirigayakazima)
