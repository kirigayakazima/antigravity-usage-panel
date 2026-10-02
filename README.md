# 反重力额度 / 用量监控面板 (Antigravity Usage Panel)

专为 **Google 反重力桌面端（Google Antigravity 2.0 独立 Electron 客户端）** 打造的实时额度监控与历史用量分析大屏插件。

100% 对齐 DSH（DeepSeek Harness）插件体验，零侵入原生界面，常驻于辅助侧边栏（Auxiliary Pane），支持秒级配额同步、Token 预算反推、182 天日历热力图与离线 SQLite 会话分析。

---

## 🌟 核心特性

- ⚡ **秒级实时配额同步**：直连反重力内置语言服务器（Language Server），自动探测随机动态端口与 CSRF 凭证，同步官方 `RetrieveUserQuotaSummary` 权威额度（Gemini 5h 滚动、周总限额、重置倒计时）。
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
├── index.html          # 监控面板核心前端大屏 (支持 3s 轮询与平滑数据渲染)
├── plugin.json         # 反重力插件清单配置
├── lib/
│   └── conversations.js # 本地 SQLite 会话库只读解析引擎
├── assets/
│   └── logo.svg        # 插件图标
└── sidecars/
    └── panel/          # Sidecar UI 扩展定义与资源
```

---

## 🚀 快速开始

### 1. 克隆仓库与启动本地守护服务
```bash
# 克隆到本地任意目录
git clone https://github.com/kirigayakazima/antigravity-usage-panel.git
cd antigravity-usage-panel

# 启动后台守护服务 (零第三方依赖，纯 Node.js 原生模块)
npm start
```
服务将在 `http://127.0.0.1:19388` 启动，并自动锁定反重力桌面端后台运行的语言服务器端口。

### 2. 在反重力桌面端中挂载
将本项目软链接（或复制）至反重力全局插件目录：

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
  ln -s "$(pwd)" "$HOME/.gemini/config/plugins/antigravity-usage-panel"
  ```

启动反重力桌面端，在右侧辅助面板（Auxiliary Pane）的顶栏中即可常驻查看 **`Antigravity Quota Dashboard`** 监控大屏。

---

## 📄 开源许可
MIT License © kirigayakazima
