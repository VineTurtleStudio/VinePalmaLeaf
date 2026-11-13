# VinePalma Leaf 同步协议

## 概述

VinePalma Leaf 支持多种同步方式，包括局域网同步、蓝牙同步和 WebDAV 同步。

## 局域网同步协议

### 设备发现

使用 mDNS (Multicast DNS) 进行设备发现：

- 服务类型: `_vinepalma._tcp`
- 服务端口: 随机可用端口
- 服务属性:
  - `device_id`: 设备唯一标识
  - `device_name`: 设备名称
  - `version`: 应用版本

### 连接建立

1. **TCP 连接**: 建立可靠的 TCP 连接
2. **握手协议**: 交换设备信息和版本号
3. **能力协商**: 确定支持的同步数据类型

### 数据同步

使用 Protocol Buffers 序列化同步数据：

```protobuf
message SyncData {
  repeated SyncBook books = 1;
  repeated SyncProgress progress = 2;
  repeated SyncNote notes = 3;
  repeated SyncBookmark bookmarks = 4;
}
```

### 冲突解决

采用三向合并算法 (Three-way Merge)：

1. **本地版本**: 当前设备的数据
2. **远程版本**: 对端设备的数据
3. **基础版本**: 上次同步时的共同祖先

**解决策略**:
- 阅读进度: 取时间戳最新的
- 高亮/笔记: 保留两条，标记冲突
- 书签: 去重合并
- 书籍元数据: 以最后修改时间为准

## 蓝牙同步协议

### 服务发现

使用 BLE (Bluetooth Low Energy) 进行设备发现：

- 服务 UUID: `0xLEAF`
- 特征值: 自定义读写特征

### 数据传输

由于 BLE 数据包大小限制，采用分片传输：

1. **分片**: 将大数据分割为多个小包
2. **传输**: 逐个发送数据包
3. **重组**: 接收方重组数据
4. **校验**: CRC 校验确保数据完整性

### 适用场景

- 仅同步阅读进度和少量笔记
- 数据量 < 20KB
- 近场设备同步

## WebDAV 同步协议

### 支持的服务器

- 坚果云
- Nextcloud
- 群晖 Synology
- 自建 WebDAV 服务器

### 同步流程

1. **认证**: 使用用户名/密码或 App 密码
2. **目录结构**:
   ```
   /
   ├── vinepalma/
   │   ├── books/
   │   ├── progress/
   │   ├── notes/
   │   └── settings.json
   ```
3. **增量同步**: 仅传输变更数据
4. **冲突检测**: 基于文件修改时间

### 数据格式

同步数据使用 JSON 格式存储：

```json
{
  "version": "1.0",
  "device_id": "uuid",
  "timestamp": "ISO8601",
  "data": {
    "books": [],
    "progress": [],
    "notes": [],
    "bookmarks": []
  }
}
```

## 安全考虑

### 数据加密

- **传输加密**: 使用 TLS/SSL
- **存储加密**: 可选的本地加密
- **端到端加密**: 云端同步支持

### 隐私保护

- **本地优先**: 数据默认存储在本地
- **选择性同步**: 用户可选择同步的数据类型
- **设备管理**: 支持撤销设备访问权限
