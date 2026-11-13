use crate::sync::SyncData;
use crate::error::AppError;

pub struct Protocol;

impl Protocol {
    pub fn serialize(data: &SyncData) -> Result<Vec<u8>, AppError> {
        serde_json::to_vec(data).map_err(|e| AppError::Sync(e.to_string()))
    }

    pub fn deserialize(data: &[u8]) -> Result<SyncData, AppError> {
        serde_json::from_slice(data).map_err(|e| AppError::Sync(e.to_string()))
    }
}
