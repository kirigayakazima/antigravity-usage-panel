# ⚡ Antigravity Usage Panel (v1.4.0)

> Google 反重力桌面端（Antigravity Desktop）实时额度与用量监控面板  
> 支持内嵌顶栏胶囊 + 模态大窗、独立 Web 仪表盘、桌面置顶悬浮胶囊（HUD）与 Sidecar 辅助侧栏四种运行形态

---

## 功能概览

### 1. 四种运行形态（共享同一后台守护进程）
- **桌面端内嵌面板（Route 2，推荐）**：注入 Antigravity Desktop 顶栏胶囊与页面内大模态弹窗。点击顶栏胶囊或按 `Alt+Q` 打开/关闭面板（`Esc` 关闭），默认解锁 `F12` 开发者工具与 `Ctrl+R` / `F5` 页面热重载。
- **独立 Web 仪表盘**：守护进程启动后直接浏览器访问 `http://127.0.0.1:19388/`（或执行 `npm run dashboard`），提供完整五标签页监控视图。
- **桌面置顶悬浮胶囊（HUD）**：双击 [start-hud.cmd](start-hud.cmd)（或运行 `npm run hud`），以 Edge/Chrome `--app` 迷你窗口启动 `http://127.0.0.1:19388/hud` 并通过 Win32 `SetWindowPos` 置顶显示在屏幕右上角。
- **Antigravity Sidecar 侧栏插件**：通过 [plugin.json](plugin.json) 与 [sidecars/panel/](sidecars/panel/sidecar.json) 注册至右侧辅助面板（`SIDECAR_UI_ENTRYPOINT_AUX_PANE`），标题为「额度监控」。

### 2. 五大监控标签页与核心能力
- **顶栏实时胶囊**：固定展示 **Gemini**、**Claude / GPT** 与 **Gemini 4 Argon**（若存在）各自剩余比例最低的窗口，悬停提示当前账号、状态与 `Alt+Q` 快捷键。
- **额度**：
  - 按模型组展示 **5 小时**与**每周**剩余比例、进度条、刷新倒计时及 Prompt Credits 余额；
  - 原生独立分池展示 **Gemini**、**Claude / GPT** 与 **Gemini 4 Argon**；
  - 支持与顶部所选天数（或本页开始/截止日期）的本地 Token 消耗、缓存命中率、模型调用次数、活跃会话数同步对照。
- **用量**：
  - 支持顶部全局时间范围筛选：**今天 / 7 天 / 14 天 / 近 30 天 / 近 90 天 / 全部**，以及自定义**开始 / 截止日期**；
  - 展示总 Token、缓存读取率、输出、模型调用次数、活跃会话与步数、逐日与分模型明细。
- **额度趋势**：
  - 支持 `24 小时 / 7 天 / 30 天 / 全部` 范围切换与**按账户筛选**；
  - 绘制真实采样点 SVG 趋势曲线（包含 `gemini`、`3p`、`gemini-argon-wtu` 5h/周窗口）及额度变化摘要。
- **活动日历**：
  - 近 **182 天** GitHub 风格活动热力图（按总 Token 着色），悬停或键盘浏览任意一天可查看会话数、步数、总 Token 与缓存读取量。
- **会话**：
  - 离线扫描本地 SQLite 会话库，支持按**工作区**与**关键词**筛选会话及模型调用统计（即使客户端未运行也可查看）。

### 3. 多账号系统凭据保险箱与无缝热切换（v1.4.0）
- **Windows 凭据保险箱**：通过 [bin/cred-vault.ps1](bin/cred-vault.ps1) 调用 Win32 `advapi32.dll`（`CredRead`/`CredWrite`/`CredEnumerate`/`CredDelete`），将各账号授权凭据以 `agy-panel-vault:<email>` 安全存储在 Windows 凭据管理器中（绝不明文落盘）。
- **一键切换与新增账号**：可在面板顶部的多账号对比栏中查看离线账户快照、一键切换已有账号或点击「准备登录新账号」，自动备份当前凭据并热重启客户端。
- **WMI 脱钩与代理自适应注入**：[bin/switch-worker.mjs](bin/switch-worker.mjs) 通过 WMI `Win32_Process.Create` 脱离 Electron Job Object 独立运行，重启客户端时自动继承或注入代理（优先级：`AGY_PROXY_URL` > `HTTPS_PROXY` > `HTTP_PROXY` > 默认 `http://127.0.0.1:7890`；`NO_PROXY` 默认 `localhost,127.0.0.1`），防止重启后网络白屏。
- **多账号时间线额度折算隔离**：[lib/quota-estimates.mjs](lib/quota-estimates.mjs) 内置账号活跃时间线索引（`buildAccountTimeline`），将本地 Token 消耗精准归属到产生时所在账号，避免同一 5 小时窗口内切号导致的容量估算虚高。

---

## 目录结构

```text
antigravity-usage-panel/
├── daemon.mjs                 # 独立 HTTP 守护进程 (127.0.0.1:19388)
├── index.html                 # 独立 Web 仪表盘页面
├── hud.html                   # 桌面悬浮胶囊 HUD 页面
├── plugin.json                # Antigravity 插件清单 (注册 Sidecar 侧栏)
├── package.json               # 项目脚本与依赖 (@electron/asar)
├── install.bat                # Windows 安装入口 (调用 一键安装并重启.bat)
├── 一键安装并重启.bat          # 停止客户端 -> 校验注入 -> 同步插件联接 -> 重启服务与客户端
├── start-hud.cmd              # 启动桌面置顶悬浮胶囊 HUD
├── start-hud.ps1              # HUD 窗口定位与 Win32 置顶脚本
├── inject/
│   └── native-inject.js       # 注入 Electron 渲染层的顶栏胶囊与内嵌大模态 UI
├── bin/
│   ├── install-restart.ps1    # 一键安装、联接同步、旧进程清理与重启主控脚本
│   ├── inject-install.mjs     # 解包 app.asar.bak -> 语法校验 -> 注入 -> 打包为 app.asar
│   ├── inject-uninstall.mjs   # 从 app.asar.bak 还原纯净客户端
│   ├── lifecycle-hook.mjs     # 守护进程与注入状态自愈检查钩子
│   ├── cred-vault.ps1         # Windows 凭据管理器交互脚本 (advapi32.dll)
│   ├── switch-worker.mjs      # WMI 脱钩账号切换与重启 Worker (含代理注入)
│   └── *.test.mjs             # 单元测试 (12 项用例)
├── lib/
│   ├── install-patch.mjs      # dist/utils.js / dist/main.js / dist/preload.js 安全挂载器
│   ├── accounts.mjs           # 多账号快照存储与排序
│   ├── credential-vault.mjs   # 凭据保险箱 Node.js 适配层
│   ├── quota-estimates.mjs    # 基于时间线隔离的配额容量反推
│   ├── conversations.js       # 离线 SQLite 会话扫描器
│   └── history.js             # JSONL 历史采样存储 (HistoryStore)
├── sidecars/panel/            # Antigravity Sidecar 独立辅助面板
│   ├── sidecar.json           # Sidecar 配置与 AUX_PANE 入口声明
│   ├── main.mjs               # Sidecar 后端服务与 Language Server 握手
│   ├── index.html / app.js / styles.css
└── assets/
    └── logo.svg               # 插件图标
```

---

## 守护进程 API（`http://127.0.0.1:19388`）

| 路由 | 方法 | 说明 |
|---|---|---|
| `/api/ping` | `GET` | 健康检查与当前检测到的 Language Server 端口 |
| `/api/ls-auth` | `POST` | 接收注入端嗅探到的端口与 CSRF Token（适配 2.34.0+） |
| `/api/quota` | `GET` | Language Server 实时配额与套餐信息 |
| `/api/quota-estimates` | `GET` | 各模型组、各窗口的本地 Token 折算参考（支持账号时间线隔离） |
| `/api/conversations` | `GET` | 离线 SQLite 会话扫描与逐日/分模型统计 |
| `/api/history?range=24h&account=` | `GET` | 历史采样点查询（支持 `24h` / `7d` / `30d` / `all` 与账户筛选） |
| `/api/all` | `GET` | 合并返回 `quota` 与 `conversations` |
| `/api/accounts` | `GET` | 多账号快照列表与系统凭据保险箱备份状态 |
| `/api/accounts?email=...` | `DELETE` | 移除指定账号的本地快照记录 |
| `/api/accounts/backup` | `POST` | 备份指定或当前登录账号凭据至 Windows 凭据管理器 |
| `/api/accounts/switch` | `POST` | 一键热切换至指定账号并自动重启客户端 |
| `/api/accounts/prepare-add` | `POST` | 备份当前账号并清理本地登录态以登录新账号 |
| `/api/accounts/vault?email=...` | `DELETE` | 删除指定账号在系统凭据保险箱中的备份凭据 |
| `/` 或 `/index.html` | `GET` | 独立 Web 仪表盘页面 |
| `/hud` 或 `/hud.html` | `GET` | 迷你悬浮胶囊页面 |

---

## 安装、迁移与日常使用

### 前置条件
- **Windows 10 / 11**（Windows 凭据保险箱、HUD 置顶与 `.bat` 一键脚本面向 Windows）
- **Node.js 22.12+**（使用 `@electron/asar` 4 与原生 `node --test`）
- **Google Antigravity Desktop** 已安装在 `%LOCALAPPDATA%\Programs\antigravity`

### 一键安装 / 迁移目录重装（推荐）
直接双击 [一键安装并重启.bat](一键安装并重启.bat)（或 [install.bat](install.bat)），脚本会自动执行以下步骤：
1. 检查并自动安装缺失依赖（`@electron/asar`）；
2. 平滑关闭 Antigravity 客户端以释放 `app.asar` 文件锁；
3. 从原始备份校验客户端版本与注入点语法，注入当前目录的动态路径并重新打包 `app.asar`；
4. 自动将 `~/.gemini/config/plugins/antigravity-usage-panel` 目录联接（Junction）同步指向当前项目目录；
5. 自动清理任何旧目录遗留的 `19388` 守护进程，从当前目录拉起新 `daemon.mjs` 并重启 Antigravity 客户端。

> **移动项目目录后**：只需在新目录双击一次 [一键安装并重启.bat](一键安装并重启.bat)，即可把客户端注入、插件目录联接与后台进程全部切换到新目录，随后即可安全删除旧目录。

### 常用命令行脚本

| 命令 | 作用 |
|---|---|
| `npm test` | 运行全部 12 项单元测试（注入补丁、配额反推、账号存储、凭据保险箱） |
| `npm start` | 在前台启动 `daemon.mjs` 守护进程（端口 `19388`） |
| `npm run dashboard` | 在默认浏览器打开独立 Web 仪表盘（`http://127.0.0.1:19388`） |
| `npm run hud` | 启动置顶迷你悬浮胶囊窗口 |
| `npm run inject:install` | 仅执行 `app.asar` 注入安装（需先关闭客户端以免文件占用报错） |
| `npm run inject:uninstall` | 从 `app.asar.bak` 还原纯净出厂版本客户端 |
| `npm run hook` | 运行 `lifecycle-hook.mjs` 自愈检查守护进程与客户端注入版本 |

### 注入安全性与版本保护
1. `bin/inject-install.mjs` 永远基于**官方纯净备份** `app.asar.bak` 解包注入，绝不二次修改 `app.asar.bak`。
2. 每次安装前均会校验当前 `app.asar` 与 `app.asar.bak` 的版本号是否一致、校验 `dist/utils.js` / `dist/main.js` / `dist/preload.js` 语法及 unpacked 资源一致性；**任何校验失败都会中止写入**，替换阶段也会保留 `app.asar.previous-*` 并在失败时自动回滚。
3. 若 Antigravity 客户端大版本更新覆盖了 `app.asar` 导致备份与当前版本不一致，可先移除/重命名旧 `app.asar.bak` 后再重新运行 [一键安装并重启.bat](一键安装并重启.bat)。

### 注入机制原理
1. 向 `dist/utils.js` 注入 `executeJavaScript` 主世界挂载器（绕过 `contextIsolation` 限制并解锁 `F12` / `Ctrl+R` / `F5`）；
2. 向 `dist/main.js` 注入伴随启动钩子（客户端启动时探测 `127.0.0.1:19388/api/ping`，未运行则静默拉起 `daemon.mjs`）；
3. 向 `dist/preload.js` 追加渲染层注入代码。

---

## 本地数据目录与日志排查

### 本地状态存储目录
所有历史与账号快照均保存在用户目录下的 `~/.dsh/antigravity-usage/`（不随项目目录移动而丢失）：
- `panel-accounts.json`：已记录的多账号额度快照
- `panel-quota-samples.json`：各窗口 Token 容量折算样本缓存
- `panel-cache/`：离线 SQLite 会话扫描缓存
- `history-*.jsonl`：额度趋势历史采样日志
- `panel-vault-meta.json` & `vault.log`：Windows 凭据保险箱元数据与切号重启日志

### 常见问题排查
- **修改 `inject/native-inject.js` 后生效方式**：由于注入器在加载页面时动态读取磁盘上的 `inject/native-inject.js`，通常只需在 Antigravity 窗口内按 **`Ctrl + R`** 或 **`F5`** 刷新页面即可立即生效（无需重打包 `app.asar`）。
- **顶栏胶囊未出现或一直显示「连接中」**：
  1. 按 `F12` 打开客户端开发者工具查看 Console，或查看项目根目录的 `renderer.log`；
  2. 访问 `http://127.0.0.1:19388/api/ping` 确认守护进程是否正常运行（异常日志见项目根目录 `crash.txt`）；
  3. Antigravity 2.34.0+ 客户端启动后会自动通过 `POST /api/ls-auth` 向守护进程同步 Language Server 端口与 CSRF Token，如刚启动可稍等数秒或点击面板右上角「↻ 刷新」。
- **切号重启后界面白屏/无法联网**：检查环境变量 `AGY_PROXY_URL` / `HTTPS_PROXY` / `HTTP_PROXY` 是否与本机代理端口一致（默认回退 `http://127.0.0.1:7890`），详细信息可查看 `~/.dsh/antigravity-usage/vault.log`。

---

## 统计口径

- 配额服务提供剩余比例和刷新时间，界面直接展示各窗口余额，本地 Token 记录单独统计。
- 各额度窗口的 Token 参考从本机同模型组、同周期的调用记录折算：按刷新时间减去窗口长度确定样本起点，以已记录 Token 除以已用比例得到估算总量，再乘以剩余比例得到估算余额。周期有效、已用至少 5%、至少 3 次有效调用且累计达到 1,000 Token 时才计算；否则尝试复用同账号同窗口的近期有效样本，没有样本时显示「样本不足」。
- 本地总 Token = 未命中输入 + 缓存读取 + 输出（思考与回复属于输出的拆分）；缓存读取率 = 缓存读取 ÷（未命中输入 + 缓存读取）。
- 逐日用量按调用关联的步骤时间和本地时区统计；缺少可确认日期的调用计入「全部」总量。

---

## 开发说明

- **编码要求**：`inject/native-inject.js` 必须以 **UTF-8** 保存，避免注入后中文乱码。
- **动态路径**：`daemon.mjs` 与安装脚本均基于当前模块目录动态解析路径，避免硬编码盘符目录。

---

## License

MIT © [kirigayakazima](https://github.com/kirigayakazima)
