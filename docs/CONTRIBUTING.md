# 贡献指南

感谢你对 VinePalma Leaf 的关注！我们欢迎所有形式的贡献。

## 如何贡献

### 报告 Bug

1. 在 GitHub Issues 中搜索是否已有相同问题
2. 如果没有，创建新的 Issue
3. 提供详细的问题描述，包括：
   - 操作系统和版本
   - 应用版本
   - 复现步骤
   - 预期行为和实际行为
   - 错误日志（如有）

### 提交功能请求

1. 在 GitHub Issues 中搜索是否已有相同请求
2. 如果没有，创建新的 Issue
3. 描述功能的使用场景和期望行为

### 提交代码

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feat/your-feature-name`
3. 开发并测试
4. 提交代码: `git commit -m "feat: 添加新功能描述"`
5. 推送到你的 Fork: `git push origin feat/your-feature-name`
6. 创建 Pull Request

## 开发环境设置

### 前置要求

- Rust >= 1.75
- Node.js >= 18
- Tauri CLI

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/your-org/vinepalma-leaf.git
cd vinepalma-leaf

# 安装前端依赖
npm install

# 安装 Tauri CLI
npm install -g @tauri-apps/cli

# 开发模式运行
npm run tauri dev
```

## 代码规范

### Rust 代码

- 遵循 Rust 官方代码风格
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 检查代码质量
- 为公共 API 添加文档注释

### TypeScript 代码

- 使用 ESLint 和 Prettier
- 遵循 TypeScript 最佳实践
- 为组件和函数添加类型定义
- 使用有意义的变量和函数名

### 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(reader): 添加 PDF 夜间模式支持

- 支持 PDF 文档的夜间模式切换
- 优化对比度以提高可读性

Closes #123
```

## 分支管理

- `main`: 稳定分支，只接受 PR
- `develop`: 开发分支，功能合并到这里
- `feat/*`: 功能分支
- `fix/*`: 修复分支
- `release/*`: 发布分支

## Pull Request 流程

1. 确保代码符合项目规范
2. 添加必要的测试
3. 更新相关文档
4. 填写 PR 描述，说明改动内容
5. 等待代码审查
6. 根据反馈进行修改
7. 合并后删除功能分支

## 问题和反馈

如有任何问题，请通过以下方式联系：

- GitHub Issues: 技术问题和功能请求
- Email: 一般咨询

感谢你的贡献！
