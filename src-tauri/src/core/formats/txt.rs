use crate::core::{BookDocument, BookMetadata, BookChapter, FormatParser};
use crate::error::AppError;
use std::path::Path;

pub struct TxtParser;

impl FormatParser for TxtParser {
    fn parse(&self, path: &Path) -> Result<BookDocument, AppError> {
        let filename = path
            .file_stem()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown");

        // 读取文件内容
        let content = std::fs::read_to_string(path)
            .map_err(|e| AppError::Io(e))?;

        // 简单分页（每1000字符一页）
        let page_size = 1000;
        let pages: Vec<BookChapter> = content
            .chars()
            .collect::<Vec<char>>()
            .chunks(page_size)
            .enumerate()
            .map(|(i, chunk)| BookChapter {
                id: format!("page_{}", i),
                title: format!("Page {}", i + 1),
                content: chunk.iter().collect(),
                order: i as u32,
            })
            .collect();

        Ok(BookDocument {
            id: uuid::Uuid::new_v4().to_string(),
            title: filename.to_string(),
            author: "Unknown Author".to_string(),
            format: "txt".to_string(),
            file_path: path.to_string_lossy().to_string(),
            cover_path: None,
            metadata: BookMetadata {
                publisher: None,
                publish_date: None,
                language: None,
                description: None,
                tags: vec![],
                page_count: Some(pages.len() as u32),
            },
            content: pages,
        })
    }

    fn extract_cover(&self, _path: &Path) -> Result<Vec<u8>, AppError> {
        // TXT文件没有封面
        Ok(vec![])
    }

    fn supports(&self, ext: &str) -> bool {
        ext.to_lowercase() == "txt"
    }
}
