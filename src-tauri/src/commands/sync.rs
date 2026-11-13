use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncDevice {
    pub id: String,
    pub name: String,
    pub last_sync_at: String,
    pub sync_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub is_syncing: bool,
    pub progress: f64,
    pub message: Option<String>,
}

#[tauri::command]
pub async fn discover_devices() -> Result<Vec<SyncDevice>, String> {
    // TODO: 发现局域网设备
    Ok(vec![])
}

#[tauri::command]
pub async fn start_sync(_device_id: String) -> Result<SyncStatus, String> {
    // TODO: 开始同步
    Ok(SyncStatus {
        is_syncing: true,
        progress: 0.0,
        message: Some("Starting sync...".to_string()),
    })
}

#[tauri::command]
pub async fn get_sync_status() -> Result<SyncStatus, String> {
    // TODO: 获取同步状态
    Ok(SyncStatus {
        is_syncing: false,
        progress: 100.0,
        message: None,
    })
}

#[tauri::command]
pub async fn configure_webdav(
    _url: String,
    _username: String,
    _password: String,
) -> Result<(), String> {
    // TODO: 配置WebDAV
    Ok(())
}

#[tauri::command]
pub async fn test_webdav_connection() -> Result<bool, String> {
    // TODO: 测试WebDAV连接
    Ok(false)
}
