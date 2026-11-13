use crate::error::AppError;
use crate::sync::SyncData;

pub struct CloudSync {
    // 云端同步（预留）
}

impl CloudSync {
    pub fn new() -> Self {
        Self {}
    }

    pub async fn upload_data(&self, _data: &SyncData) -> Result<(), AppError> {
        // TODO: 实现云端上传
        Ok(())
    }

    pub async fn download_data(&self) -> Result<SyncData, AppError> {
        // TODO: 实现云端下载
        Err(AppError::Sync("Cloud sync not implemented".to_string()))
    }
}
