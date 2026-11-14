# VinePalma Leaf 🍃

> 一款跨平台全能电子书阅读器，支持几乎所有主流电子书格式，提供真实书籍般的阅读体验，并具备局域网、蓝牙及云端多端同步能力。

<p align="center">
  <img src="./docs/assets/logo.png" alt="VinePalma Leaf" width="120">
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术架构">技术架构</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#开发指南">开发指南</a> •
  <a href="#同步机制">同步机制</a> •
  <a href="#路线图">路线图</a>
</p>

---

## 功能特性

### 📚 全格式支持
- **文本类**：EPUB (2/3), MOBI, AZW3, FB2, TXT, HTML, Markdown
- **文档类**：PDF (含扫描版 OCR 重排), DJVU, DOCX
- **漫画类**：CBZ, CBR, CBT, CB7
- **持续扩展**：通过插件化架构支持更多格式

### 📖 拟真阅读体验
- 拟真翻页动画（页角卷曲 / 滑动翻页 / 仿真翻页）
- 专业排版引擎：自定义字体、行距、段距、边距、分栏
- 多主题：日间 / 夜间 /  sepia / 自定义 CSS
- PDF 智能重排：针对扫描版 PDF 的流式重排与裁边
- 漫画阅读模式：双页对开、日漫从右至左、卷轴连续模式

### 🔄 多端同步
- **局域网同步**：同一 WiFi 下自动发现设备，零配置同步
- **蓝牙同步**：近场设备发现与阅读进度轻量同步
- **WebDAV**：兼容坚果云、Nextcloud、群晖等自托管方案
- **云端同步**（可选）：官方云服务，端到端加密

### ✍️ 知识管理
- 高亮、划线、批注、书签
- 笔记导出：Markdown / Notion / Logseq / Obsidian
- 全文搜索：本地书籍内容索引与快速检索
- 阅读统计：阅读时长、页数、速度分析

### 🖥️ 跨平台覆盖
| 平台 | 状态 | 说明 |
|------|------|------|
| Windows | ✅ 支持 | 10 / 11 |
| macOS | ✅ 支持 | 12+ (Intel & Apple Silicon) |
| Linux | ✅ 支持 | Ubuntu 20.04+, Fedora, Arch |
| Android | 🚧 开发中 | Tauri v2 移动端适配 |
| iOS | 📋 规划中 | 后续迭代 |

---

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                      │
│  React 18 + TypeScript + Zustand + TailwindCSS              │
│  - 阅读器 UI / 书库管理 / 设置面板 / 同步界面               │
└──────────────────────┬──────────────────────────────────────┘
                       │ Tauri IPC (Commands / Events)
┌──────────────────────▼──────────────────────────────────────┐
│                      Rust 核心层 (Core)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  格式解析引擎 │ │   排版引擎    │ │     同步引擎         │ │
│  │  - epub-rs   │ │  - 分页算法   │ │  - mDNS 发现        │ │
│  │  - pdfium    │ │  - 字体回退   │ │  - Bluetooth LE     │ │
│  │  - libmobi   │ │  - CSS 子集   │ │  - WebDAV 客户端    │ │
│  │  - 漫画解包  │ │    渲染      │ │  - 冲突合并算法      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │   数据库层    │ │   文件系统    │ │     系统服务         │ │
│  │  - SQLite    │ │  - 书籍缓存   │ │  - 后台同步守护      │ │
│  │  - FTS5 全文 │ │  - 封面缩略图 │ │  - 系统通知          │ │
│  │    搜索索引  │ │  - 笔记导出   │ │  - 自动导入监视      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 桌面框架 | [Tauri v2](https://v2.tauri.app/) | Rust 核心 + Web 前端，产物极小，内存占用低 |
| 前端框架 | React 18 + TypeScript | 组件化 UI，类型安全 |
| 状态管理 | Zustand | 轻量级全局状态 |
| UI 样式 | TailwindCSS | 原子化 CSS，快速构建 |
| 阅读渲染 | 自研 Canvas 渲染器 + iframe 沙箱 | EPUB 复杂排版与 PDF 双轨方案 |
| 后端语言 | Rust 1.75+ | 高性能、内存安全、跨平台编译 |
| 数据库 | SQLite (via `sqlx` / `rusqlite`) | 本地书库、阅读进度、笔记索引 |
| 序列化 | Protocol Buffers (`prost`) | 设备间同步数据格式 |
| 局域网 | `mdns-sd` / `zeroconf` | 服务发现，零配置组网 |
| 蓝牙 | `btleplug` (Rust) | 跨平台 BLE 通信 |
| EPUB 解析 | `epub-rs` / 自研 XML 解析 | 基于 zip + OPF 规范 |
| PDF 渲染 | `pdfium-render` (Google PDFium 绑定) | 业界最强开源 PDF 引擎 |
| MOBI/AZW3 | `libmobi` (Rust 绑定) | 原生解析，无需转换 |
| 漫画 | 自研压缩包流式解压 | 支持大文件边解压边阅读 |

---

## 快速开始

### 环境要求

- **Rust** `>= 1.75` ([安装指南](https://www.rust-lang.org/tools/install))
- **Node.js** `>= 18` ([安装指南](https://nodejs.org/))
- **Tauri CLI** 与系统依赖

#### 平台特定依赖

<details>
<summary><b>Windows</b></summary>

- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- WebView2 运行时（Windows 10/11 通常已预装）

</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Xcode Command Line Tools
xcode-select --install
```

</details>

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev   build-essential   curl   wget   file   libxdo3   libssl-dev   libayatana-appindicator3-dev   librsvg2-dev
```

</details>

<details>
<summary><b>Linux (Fedora)</b></summary>

```bash
sudo dnf install webkit2gtk4.1-devel   openssl-devel   curl   wget   libappindicator-gtk3-devel   librsvg2-devel
```

</details>

<details>
<summary><b>Android (交叉编译)</b></summary>

```bash
# 1. 安装 Android Studio 或 Command Line Tools
# 2. 通过 sdkmanager 安装:
#    - NDK (最新版)
#    - Android SDK Platform-Tools
#    - Android SDK Build-Tools
# 3. 设置环境变量 ANDROID_HOME 与 NDK_HOME
```

</details>

### 克隆与安装

```bash
# 克隆仓库
git clone https://github.com/your-org/vinepalma-leaf.git
cd vinepalma-leaf

# 安装前端依赖
npm install

# 安装 Tauri CLI (若未全局安装)
npm install -g @tauri-apps/cli
```

### 开发模式运行

```bash
# 同时启动前端 dev server 与 Tauri 桌面窗口
npm run tauri dev
```

首次编译 Rust 核心可能耗时 3-10 分钟（视机器性能），后续增量编译通常在秒级。

### 生产构建

```bash
# 构建当前平台的安装包
npm run tauri build
```

产物位于 `src-tauri/target/release/bundle/`：
- **Windows**: `.msi` (安装包) / `.exe` (便携版)
- **macOS**: `.dmg` (通用/分架构)
- **Linux**: `.AppImage` / `.deb` / `.rpm`

### Android 构建 (Tauri v2)

```bash
# 确保已配置 Android SDK 与 NDK
npm run tauri android dev        # 开发调试
npm run tauri android build      # 构建 APK / AAB
```

---

## 开发指南

### 项目结构

```
vinepalma-leaf/
├── src/                          # 前端源码 (React + TypeScript)
│   ├── components/               # 通用组件
│   │   ├── reader/               # 阅读器核心组件
│   │   ├── library/              # 书库管理组件
│   │   ├── sync/                 # 同步状态与面板
│   │   └── ui/                   # 基础 UI 组件 (Button, Modal...)
│   ├── hooks/                    # 自定义 React Hooks
│   ├── stores/                   # Zustand 状态定义
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 前端工具函数
│   └── App.tsx                   # 根组件
│
├── src-tauri/                    # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs               # 程序入口
│   │   ├── lib.rs                # 库入口与模块聚合
│   │   ├── commands/             # Tauri IPC 命令 (暴露给前端调用)
│   │   │   ├── book.rs           # 书籍 CRUD
│   │   │   ├── reader.rs         # 阅读控制 (打开、翻页、跳转)
│   │   │   ├── sync.rs           # 同步触发与状态查询
│   │   │   └── note.rs           # 笔记与高亮操作
│   │   ├── core/                 # 核心业务逻辑
│   │   │   ├── formats/          # 格式解析器
│   │   │   │   ├── epub.rs
│   │   │   │   ├── pdf.rs
│   │   │   │   ├── mobi.rs
│   │   │   │   ├── txt.rs
│   │   │   │   └── comic.rs      # CBZ/CBR 解析
│   │   │   ├── renderer/         # 排版渲染引擎
│   │   │   │   ├── paginator.rs  # 分页算法
│   │   │   │   ├── typesetter.rs # 排版计算
│   │   │   │   └── theme.rs      # 主题管理
│   │   │   └── document.rs       # 文档抽象层
│   │   ├── sync/                 # 同步模块
│   │   │   ├── lan.rs            # 局域网同步 (mDNS + TCP)
│   │   │   ├── bluetooth.rs      # 蓝牙同步 (BLE + RFCOMM)
│   │   │   ├── webdav.rs         # WebDAV 客户端
│   │   │   ├── cloud.rs          # 云端同步 (预留)
│   │   │   ├── protocol.rs       # Protobuf 序列化/反序列化
│   │   │   └── merge.rs          # 冲突合并算法
│   │   ├── database/             # 数据持久化
│   │   │   ├── mod.rs            # 连接池与初始化
│   │   │   ├── schema.sql        # 表结构定义
│   │   │   ├── book.rs           # 书籍元数据 DAO
│   │   │   ├── progress.rs       # 阅读进度 DAO
│   │   │   ├── note.rs           # 笔记与高亮 DAO
│   │   │   └── fts.rs            # 全文搜索索引
│   │   ├── fs/                   # 文件系统工具
│   │   │   ├── cache.rs          # 书籍缓存与解压
│   │   │   ├── thumbnail.rs      # 封面缩略图生成
│   │   │   └── watcher.rs        # 目录监视自动导入
│   │   └── error.rs              # 全局错误类型定义
│   ├── Cargo.toml                # Rust 依赖管理
│   ├── tauri.conf.json           # Tauri 配置
│   └── capabilities/             # Tauri v2 权限配置
│
├── shared/                       # 前后端共享类型
│   └── proto/                    # Protocol Buffers 定义
│       ├── sync.proto
│       └── book.proto
│
├── docs/                         # 项目文档
│   ├── ARCHITECTURE.md           # 架构详细设计
│   ├── SYNC_PROTOCOL.md          # 同步协议规范
│   ├── FORMAT_SUPPORT.md         # 格式支持矩阵
│   └── CONTRIBUTING.md           # 贡献者指南
│
├── scripts/                      # 构建与发布脚本
├── tests/                        # 集成测试
└── package.json
```

### 核心开发流程

#### 1. 添加新的 IPC 命令

**Rust 端** (`src-tauri/src/commands/xxx.rs`):
```rust
use tauri::State;
use crate::core::AppState;

#[tauri::command]
pub async fn get_book_progress(
    state: State<'_, AppState>,
    book_id: String,
) -> Result<Progress, String> {
    state.db.progress().get(&book_id).await.map_err(|e| e.to_string())
}
```

**注册命令** (`src-tauri/src/main.rs`):
```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_book_progress,
            // ... 其他命令
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**前端调用**:
```typescript
import { invoke } from '@tauri-apps/api/core';

const progress = await invoke<Progress>('get_book_progress', { bookId: 'uuid-xxx' });
```

#### 2. 添加新的书籍格式支持

1. 在 `src-tauri/src/core/formats/` 下新建解析器文件
2. 实现 `FormatParser` trait:
   ```rust
   pub trait FormatParser: Send + Sync {
       fn parse(&self, path: &Path) -> Result<BookDocument, ParseError>;
       fn extract_cover(&self, path: &Path) -> Result<Vec<u8>, ParseError>;
       fn supports(&self, ext: &str) -> bool;
   }
   ```
3. 在 `FormatRegistry` 中注册新解析器
4. 前端无需改动，自动获得支持

#### 3. 数据库迁移

项目使用 `sqlx` 的离线模式与迁移管理：

```bash
# 修改 schema.sql 后，重新生成查询元数据
cd src-tauri
cargo sqlx prepare
```

---

## 同步机制

### 局域网同步流程

```
┌──────────────┐                      ┌──────────────┐
│   设备 A     │                      │   设备 B     │
│ (手机/平板)  │                      │ (电脑)       │
└──────┬───────┘                      └──────┬───────┘
       │                                     │
       │  1. mDNS 广播 "_vinepalma._tcp"    │
       │◄────────────────────────────────────┤
       │  2. 发现对端，建立 TCP 连接         │
       │◄────────────────────────────────────►│
       │                                     │
       │  3. 握手交换：设备 ID + 版本号      │
       │◄────────────────────────────────────►│
       │                                     │
       │  4. A 发送本地变更集 (Protobuf)     │
       │────────────────────────────────────►│
       │  5. B 发送本地变更集                │
       │◄────────────────────────────────────│
       │                                     │
       │  6. 双方执行三向合并 (A ↔ B ↔ Base) │
       │◄────────────────────────────────────►│
       │                                     │
       │  7. 确认 ACK，关闭连接              │
       │◄────────────────────────────────────►│
```

### 冲突解决策略

| 数据类型 | 冲突场景 | 解决策略 |
|----------|----------|----------|
| **阅读进度** | 两台设备同时阅读同一本书 | 取 `last_read_at` 时间戳最新的进度 |
| **高亮/笔记** | 同一位置不同批注 | 保留两条记录，标记为 "conflict" 供用户手动合并 |
| **书签** | 相同页码重复添加 | 去重合并，保留最早创建时间 |
| **书籍元数据** | 修改书名/作者/标签 | 以最后修改时间 (mtime) 为准 |
| **书库增删** | A 删除，B 新增笔记 | 优先保留有笔记/进度的记录，标记删除为 "待清理" |

### 蓝牙同步 (轻量模式)

适用于**仅同步阅读进度和少量笔记**的场景（数据量 < 20KB）：

1. **BLE 广播**：设备作为 Peripheral 广播服务 UUID `0xLEAF`
2. **GATT 传输**：通过自定义 Characteristic 分片传输 Protobuf 数据
3. **无需配对**：使用 Just Works 模式，首次连接即信任
4. **触发条件**：用户点击「附近设备同步」或阅读器检测到已配对设备靠近

---

## 格式支持矩阵

| 格式 | 解析状态 | 排版模式 | 进度记录 | 高亮批注 | 全文搜索 | 备注 |
|------|----------|----------|----------|----------|----------|------|
| EPUB | ✅ 完整 | 流式重排 | ✅ | ✅ | ✅ | 支持 EPUB 3 多媒体 |
| PDF | ✅ 完整 | 原始 / 重排 | ✅ | ✅ | ✅ | 扫描版支持 OCR 后重排 |
| MOBI | ✅ 完整 | 流式重排 | ✅ | ✅ | ✅ | 含 AZW, AZW3 变体 |
| TXT | ✅ 完整 | 流式重排 | ✅ | ✅ | ✅ | 自动编码检测 (UTF-8/GBK/Big5) |
| FB2 | ✅ 完整 | 流式重排 | ✅ | ✅ | ✅ | FictionBook 俄语文学常用 |
| HTML | ✅ 基础 | 流式重排 | ✅ | ⚠️ 部分 | ✅ | 简单 CSS 支持 |
| Markdown | ✅ 基础 | 流式重排 | ✅ | ⚠️ 部分 | ✅ | 渲染为阅读模式 |
| CBZ | ✅ 完整 | 单页 / 双页 | ✅ | ❌ | ❌ | ZIP 压缩图片序列 |
| CBR | ✅ 完整 | 单页 / 双页 | ✅ | ❌ | ❌ | RAR 压缩，需 unrar |
| CBT | ✅ 完整 | 单页 / 双页 | ✅ | ❌ | ❌ | TAR 压缩 |
| CB7 | 🚧 开发中 | 单页 / 双页 | ✅ | ❌ | ❌ | 7z 压缩 |
| DJVU | 📋 规划中 | 原始 | - | - | - | 依赖解码库 |
| DOCX | 📋 规划中 | 流式重排 | - | - | - | 需解包 XML |

---

## 路线图

### Phase 1: 核心阅读体验 (MVP) 🎯
- [x] 项目脚手架与 Tauri v2 集成
- [x] EPUB 解析与基础排版
- [ ] PDF 渲染引擎集成 (pdfium)
- [ ] TXT / Markdown 阅读支持
- [ ] 基础书库管理 (导入、分类、搜索)
- [ ] 阅读进度与基础设置持久化

### Phase 2: 拟真体验与笔记 🎨
- [ ] 翻页动画引擎 (Canvas 页角卷曲)
- [ ] 专业排版控制 (字体、行距、分栏)
- [ ] 高亮、批注、书签系统
- [ ] 夜间模式与主题系统
- [ ] 全文搜索索引 (SQLite FTS5)

### Phase 3: 多端同步 🔄
- [ ] 局域网自动发现 (mDNS)
- [ ] 局域网 TCP 同步协议
- [ ] 蓝牙 LE 轻量同步
- [ ] 冲突合并与数据校验
- [ ] WebDAV 客户端支持

### Phase 4: 全格式与移动端 📱
- [ ] MOBI / AZW3 / FB2 支持
- [ ] 漫画阅读模式 (CBZ/CBR/CBT)
- [ ] Android 端适配 (Tauri v2)
- [ ] 扫描版 PDF OCR 重排
- [ ] 封面缩略图与元数据抓取

### Phase 5: 云端与生态 ☁️
- [ ] 可选官方云端同步 (端到端加密)
- [ ] 笔记导出插件 (Notion/Obsidian)
- [ ] 阅读统计与数据可视化
- [ ] 插件系统 (第三方格式扩展)
- [ ] iOS 端支持

---

## 贡献指南

我们欢迎所有形式的贡献！请参阅 [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) 了解：

- 代码规范 (Rust / TypeScript)
- 提交信息格式 (Conventional Commits)
- 分支管理与 PR 流程
-  Issue 与 Feature Request 模板

### 快速贡献步骤

```bash
# 1. Fork 本仓库
# 2. 克隆你的 Fork
git clone https://github.com/YOUR_NAME/vinepalma-leaf.git

# 3. 创建功能分支
git checkout -b feat/your-feature-name

# 4. 开发并提交
git commit -m "feat: 添加 PDF 夜间模式支持"

# 5. 推送到你的 Fork 并提交 Pull Request
git push origin feat/your-feature-name
```

---

## 开源协议

本项目采用 **AGPL-3.0** 协议开源。

> 选择 AGPL 是为了确保 VinePalma Leaf 及其衍生作品始终保持开源自由，防止闭源云服务私有化社区贡献。若你需要在商业闭源产品中使用本项目的部分代码，请联系维护者获取商业授权。

---

## 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [pdfium](https://pdfium.googlesource.com/pdfium/) - Google 开源 PDF 渲染引擎
- [epub-rs](https://github.com/danigm/epub-rs) - Rust EPUB 解析库
- [libmobi](https://github.com/bfabiszewski/libmobi) - MOBI/AZW 格式解析
- [KOReader](https://github.com/koreader/koreader) - 阅读体验与排版灵感来源

---

<p align="center">
  🍃 <em>Read freely, sync seamlessly.</em> 🍃
</p>
