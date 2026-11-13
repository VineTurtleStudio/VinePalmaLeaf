pub mod document;
pub mod formats;
pub mod renderer;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookDocument {
    pub id: String,
    pub title: String,
    pub author: String,
    pub format: String,
    pub file_path: String,
    pub cover_path: Option<String>,
    pub metadata: BookMetadata,
    pub content: Vec<BookChapter>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BookMetadata {
    pub publisher: Option<String>,
    pub publish_date: Option<String>,
    pub language: Option<String>,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub page_count: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookChapter {
    pub id: String,
    pub title: String,
    pub content: String,
    pub order: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingProgress {
    pub book_id: String,
    pub current_page: u32,
    pub total_pages: u32,
    pub percentage: f64,
    pub last_read_at: String,
    pub location: Option<String>,
    pub cfi: Option<String>,
}

pub trait FormatParser: Send + Sync {
    fn parse(&self, path: &std::path::Path) -> Result<BookDocument, crate::error::AppError>;
    fn extract_cover(&self, path: &std::path::Path) -> Result<Vec<u8>, crate::error::AppError>;
    fn supports(&self, ext: &str) -> bool;
}
