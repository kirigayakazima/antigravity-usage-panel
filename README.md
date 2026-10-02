# 反重力额度 / 用量监控面板 (Antigravity Usage Panel)

专为 **Google 反重力桌面端（Google Antigravity 2.0 独立 Electron 客户端）** 打造的实时额度监控与历史用量分析大屏插件。

100% 对齐 DSH（DeepSeek Harness）插件体验，零侵入原生界面，常驻于辅助侧边栏（Auxiliary Pane），支持秒级配额同步、Token 预算反推、182 天日历热力图与离线 SQLite 会话分析。

---

## 🌟 核心特性

- ⚡ **秒级实时配额同步**：直连反重力内置语言服务器（Language Server），自动探测随机动态端口与 CSRF 凭证，同步官方 `RetrieveUserQuotaSummary` 权威额度（Gemini 5h 滚动、周总限额、重置倒计时）。
- 💊 **原生极简浮动微型 HUD（状态胶囊）**：支持常驻悬浮吸附于桌面任意位置（或反重力顶栏），极低资源消耗（~50MB 内存，0% CPU），Windows 原生顶层置顶（Always on Top），双击/点击平滑展开完整控制面板。
- 🧮 **Token 预算反推引擎**：基于当前周期的实际消耗与官方扣额比率，动态反算剩余可用 Token 数量（如 `~85.7M`）及预计还可支撑的模型生成调用次数。
- 🗓️ **DSH 标准日历热力图**：100% 还原 GitHub / DSH 翠绿调色体系（`rgba(128,128,128,.16)` 空格至 `#16a34a` 翠绿渐变），告别死黑块，支持按会话数、步数、Token、缓存读取多维度切换。
- 📊 **5 联核心 KPI 大屏**：总 Token 三段色条（输入 / 命中 / 输出）、缓存命中率（85%+）、模型调用次数、输出 Token（含思考与回复）、会话总数。
- 🔍 **全维度历史过滤**：支持【今天】、【7天】、【14天】、【近30天】、【近90天】、【全部】一键筛选与关键词实时搜索。
- 💾 **100% 离线历史读取**：直接以只读方式安全解析反重力落在磁盘上的 SQLite 数据库，即使反重力退出或未联网也能完整查看所有历史会话明细与用量。
- 🌓 **深浅色主题自适应**：原生适配 Light / Dark 模式，浅色模式下通透柔和，深色模式下科技低调。

---

## 📂 项目结构

```text
antigravity-usage-panel/
├── daemon.mjs          # 本地轻量守护服务 (监听 127.0.0.1:19388，自动探测反重力端口)
├── index.html          # 监控面板核心前端大屏 (支持 6 标签页、热力图与走势)
├── hud.html            # 极简原生悬浮微型胶囊 HUD (Dark Glassmorphism 磨砂毛玻璃)
├── start-hud.cmd       # Windows 桌面一键双击唤起浮动胶囊脚本
├── start-hud.ps1       # 浮动置顶胶囊核心启动器 (支持原生 SetWindowPos HWND_TOPMOST)
├── plugin.json         # 反重力插件清单配置
├── lib/
│   └── conversations.js # 本地 SQLite 会话库只读解析引擎
├── assets/
│   └── logo.svg        # 插件图标
└── sidecars/
    └── panel/          # Sidecar UI 扩展定义与资源
```

---

## 🚀 使用方式

### 方式 1：反重力客户端原生魔改注入 (终极吸附推荐 👑)
直接将配额胶囊**原生融入反重力桌面端内部的顶栏（Titlebar）**，无论切换会话、新开窗口、关闭面板，胶囊**永远在右上角顶栏常驻吸附**！
```bash
# 一键注入到反重力客户端 (自动创建官方纯净备份)
npm run inject:install
```
- **安装后**：在反重力桌面端窗口内按一下 **`Ctrl + R`** 刷新（或重启反重力），右上角窗口控制按钮左侧即刻出现黑金磨砂胶囊；
- **交互**：点击胶囊可就地向下展开详细卡片；再次点击外部空白处自动关闭；
- **一键无损还原**：若需要恢复出厂纯净版本，随时执行：
  ```bash
  npm run inject:uninstall
  ```

### 方式 2：唤起独立置顶微型胶囊 HUD (桌面浮动模式 🌟)
无需修改反重力文件，在桌面端任意位置悬浮吸附：
```bash
# 启动独立悬浮胶囊
npm run hud
```
- **微型常驻态**：仅 38px 高度，显示 `🟢 5h: 74.6% · ~65.8M · ⏳ 3h48m`，按住空白处可随心拖动；
- **抽屉展开态**：双击胶囊或点击箭头，即可平滑展开详细配额卡片与模型消耗简报。

### 方式 3：本地 Web 大屏模式 (6 标签页完整分析)
```bash
npm start
```
然后在浏览器访问 `http://127.0.0.1:19388` 查看 6 个标签页（额度/趋势/热力图/汇总/重置/会话）全量仪表盘。

### 方式 C：挂载到反重力全局插件目录
- **Windows (PowerShell)**:
  ```powershell
  New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.gemini\config\plugins\antigravity-usage-panel" -Target (Get-Location).Path
  ```
- **Windows (CMD)**:
  ```cmd
  mklink /J "%USERPROFILE%\.gemini\config\plugins\antigravity-usage-panel" "%CD%"
  ```
- **macOS / Linux**:
  ```bash
  ln -s "$(pwd)" "$HOME/.gemini/config/plugins\antigravity-usage-panel"
  ```

启动反重力桌面端，在右侧辅助面板（Auxiliary Pane）的顶栏中即可常驻查看 **`Antigravity Quota Dashboard`** 监控大屏。

---

## 📄 开源许可
MIT License © kirigayakazima
