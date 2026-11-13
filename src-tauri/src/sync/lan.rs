use crate::error::AppError;
use crate::sync::SyncData;

pub struct LanSync {
    _port: u16,
}

impl LanSync {
    pub fn new(port: u16) -> Self {
        Self {
            _port: port,
        }
    }

    pub async fn start_server(&self) -> Result<(), AppError> {
        // TODO: 启动mDNS服务和TCP服务器
        Ok(())
    }

    pub async fn discover_peers(&self) -> Result<Vec<PeerInfo>, AppError> {
        // TODO: 发现局域网设备
        Ok(vec![])
    }

    pub async fn connect_to_peer(&self, _addr: std::net::SocketAddr) -> Result<(), AppError> {
        // TODO: 连接到对端设备
        Ok(())
    }

    pub async fn send_data(&self, _data: SyncData) -> Result<(), AppError> {
        // TODO: 发送同步数据
        Ok(())
    }

    pub async fn receive_data(&self) -> Result<SyncData, AppError> {
        // TODO: 接收同步数据
        Err(AppError::Sync("Not implemented".to_string()))
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PeerInfo {
    pub id: String,
    pub name: String,
    pub address: std::net::SocketAddr,
    pub device_type: String,
}
