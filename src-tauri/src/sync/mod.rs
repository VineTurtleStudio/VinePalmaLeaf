pub mod bluetooth;
pub mod cloud;
pub mod lan;
pub mod merge;
pub mod protocol;
pub mod webdav;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncMessage {
    pub device_id: String,
    pub device_name: String,
    pub message_type: SyncMessageType,
    pub data: Vec<u8>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SyncMessageType {
    Handshake,
    DataSync,
    Ack,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncData {
    pub books: Vec<SyncBook>,
    pub progress: Vec<SyncProgress>,
    pub notes: Vec<SyncNote>,
    pub bookmarks: Vec<SyncBookmark>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncBook {
    pub id: String,
    pub title: String,
    pub author: String,
    pub format: String,
    pub file_hash: Option<String>,
    pub added_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncProgress {
    pub book_id: String,
    pub current_page: u32,
    pub total_pages: u32,
    pub last_read_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncNote {
    pub id: String,
    pub book_id: String,
    pub content: String,
    pub page: u32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncBookmark {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub page: u32,
    pub created_at: String,
}
