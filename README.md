# ⚡ Antigravity Usage Panel

> Google 反重力桌面端（Antigravity Desktop）实时额度与用量监控面板  
> 反重力内嵌额度状态与本地会话用量

---

## 功能概览

- **顶栏胶囊**固定显示 Gemini、Claude / GPT 及 Gemini 4 Argon（若存在）各自剩余比例最低的窗口。点击顶栏或按 `Alt+Q` 打开面板。
- **额度**按模型组展示 5 小时和每周剩余比例、进度条和刷新时间。原生支持 **Gemini**、**Claude / GPT** 与 **Gemini 4 Argon** 独立分池统计与专属配色。
- **多账号无缝热切换与系统凭据保险箱 (v1.4.0)**：原生调用 Windows 凭据管理器（Win32 `advapi32.dll`），将各账号授权凭据安全隔离存储在系统保险箱中（`agy-panel-vault:<email>`，绝不明文落盘）。在面板顶部一键切换已有账号或「准备登录新账号」，自动完成当前凭据保护与客户端热重启（约 3~5 秒）。
- **进程脱钩与代理自适应注入 (v1.4.0)**：切换 Worker 通过 WMI 脱离 Electron Job Object 独立运行，重启过程自动继承或配置网络代理（`HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`，默认回退 `http://127.0.0.1:7890`），彻底避免重启客户端后出现网络白屏。
- **多账号时间线额度折算隔离 (v1.4.0)**：内置账号活跃时间线索引（`buildAccountTimeline`），将本地 Token 消耗精准归属至产生时所在账号，即使在同一 5 小时窗口内轮流使用多个账号，各账号的 5 小时与每周估算池完全独立，杜绝跨账号数据混入导致的容量虚高。
- **时间过滤器**支持预设天数（今天/7天/14天/30天/90天/全部）与自定义开始/截止日期筛选，全局响应并在额度页实时统计所选天数内的本地消耗与各模型组调用。
- **用量**支持今天、最近 7 / 14 / 30 / 90 天、全部历史或自定义日期区间。显示总 Token、缓存读取率、输出、调用次数、活跃会话与逐日明细。
- **额度趋势**绘制实际采样。支持按账户筛选历史采样，累计下降以百分点显示，明显回升单独计数，支持 Argon 独立配额时序监控。
- **活动日历**以总 Token 着色。悬停任一天可同时查看会话、步骤、总 Token 和缓存读取。
- **会话**支持工作区和关键词筛选，所选日期范围内的模型与会话用量按调用记录统计。

## 架构说明

```
antigravity-usage-panel/
├── daemon.mjs              # 独立 HTTP 守护进程 (端口 19388)
├── inject/
│   └── native-inject.js    # 注入到 Electron 渲染层的内嵌界面
├── bin/
│   ├── cred-vault.ps1      # 基于 Windows advapi32.dll 的凭据保险箱与切换引擎
│   ├── switch-worker.mjs   # 进程脱钩独立切换重启 Worker (支持代理注入)
│   ├── inject-install.mjs  # 解包 app.asar.bak → 注入 → 打包为 app.asar
│   ├── inject-uninstall.mjs
│   └── lifecycle-hook.mjs  # 主进程伴随守护钩子
├── lib/
│   ├── accounts.mjs        # 多账号快照管理与排序
│   ├── credential-vault.mjs # 凭据保险箱 Node.js 适配层与 WMI 脱钩调用
│   ├── quota-estimates.mjs # 基于账号时间线隔离的配额容量反推
│   ├── conversations.js    # 离线 SQLite 会话扫描器
│   └── history.js          # JSONL 历史采样存储 (HistoryStore)
└── sidecars/panel/         # 可选 Sidecar 独立窗口面板
```

### 守护进程 API（`http://127.0.0.1:19388`）

| 路由 | 说明 |
|---|---|
| `GET /api/ping` | 健康检查 |
| `GET /api/quota` | Language Server 配额数据透传 |
| `GET /api/quota-estimates` | 各模型组、各窗口的本地 Token 折算参考（支持账号时间线隔离） |
| `GET /api/conversations` | 离线 SQLite 会话扫描结果 |
| `GET /api/history?range=24h` | 历史采样点查询（支持 24h/7d/30d/all） |
| `GET /api/accounts` | 多账号快照列表与系统凭据管理器备份状态 |
| `POST /api/accounts/backup` | 备份指定/当前账号凭据至系统凭据管理器 |
| `POST /api/accounts/switch` | 一键热切换至指定账号并自动重启客户端 |
| `POST /api/accounts/prepare-add` | 备份当前账号并安全重置客户端以登录新账号 |
| `DELETE /api/accounts?email=...` | 移除指定账号的快照记录 |
| `POST /api/ls-auth` | 接收前端嗅探的 CSRF Token 与端口（适配 2.34.0+） |
| `GET /api/all` | quota + conversations 合并一次性返回 |

### 注入机制

1. `bin/inject-install.mjs` 解包**官方纯净** `app.asar.bak`（永不修改此备份）
2. 向 `dist/utils.js` 注入 `webContents.executeJavaScript` 挂载器（绕过 contextIsolation）
3. 向 `dist/main.js` 注入守护进程生命周期钩子（桌面端启动即自动拉起端口 19388）
4. 重新打包为 `app.asar` 并覆盖原文件

---

## 安装与使用

### 前置条件

- Node.js 22.12+（安装器使用 `@electron/asar` 4）
- Google Antigravity Desktop 已安装（`app.asar` 存在）
- Antigravity Language Server 运行中（用于实时配额数据）

### 安装步骤

Windows 可直接双击 `install.bat` 或 `一键安装并重启.bat`。脚本会关闭反重力客户端、安装注入、检查后台服务并重新打开客户端；请先保存正在编辑的内容。

安装器会检查备份版本、原始代码和注入后的 JavaScript 语法，再验证打包结果与 unpacked 资源。检查失败会停止安装；替换失败会恢复安装前文件。`app.asar.bak` 保留原始备份，`app.asar.previous-*` 保留每次安装前的文件。备份与客户端版本不一致时会停止，避免旧备份覆盖新版客户端。

2026-11-04 修复：新版 `devTools: (0, debugConsole_1.isDebugConsoleEnabled)(),` 的表达式包含逗号，旧安装器按第一个逗号截断后导致主进程语法错误。当前安装器仅替换已知完整表达式，不兼容的配置会停止安装。运行 `npm test` 可执行相关回归检查。

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

## 统计口径

配额服务提供剩余比例和刷新时间。界面用这些值展示各窗口余额，本地 Token 记录单独展示。

各额度窗口的 Token 参考从本机同模型组、同周期的调用记录折算。按刷新时间减去窗口长度确定样本起点，以已记录 Token 除以已用比例得到估算总量，再乘以剩余比例得到估算余额。周期有效、已用至少 5%、至少 3 次有效调用且累计达到 1,000 Token 时才计算。否则可使用同账号同窗口的近期有效样本。没有样本时显示「样本不足」。模型、缓存比例和其他设备的用量都会影响该参考值。

本地总 Token = 未命中输入 + 缓存读取 + 输出。思考和回复属于输出的拆分。缓存读取率 = 缓存读取 ÷（未命中输入 + 缓存读取）。没有输入时显示「—」。

逐日用量按调用关联的步骤时间和本地时区统计。缺少可确认日期的调用计入「全部」总量。活跃会话按会话去重；若超出明细保留数量，日期范围内显示已确认的下限。

## 开发说明

- **编码**：`inject/native-inject.js` 必须以 UTF-8 保存，防止 GBK 乱码注入
- **调试**：按 F12 打开反重力桌面端开发者工具（inject 已解锁），查看渲染日志
- **历史日志**：注入层 `console.*` 输出同步写入 `renderer.log`

---

## License

MIT © [kirigayakazima](https://github.com/kirigayakazima)
