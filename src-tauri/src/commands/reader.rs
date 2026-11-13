use crate::core::ReadingProgress;

#[tauri::command]
pub async fn get_reading_progress(_book_id: String) -> Result<Option<ReadingProgress>, String> {
    // TODO: 从数据库获取阅读进度
    Ok(None)
}

#[tauri::command]
pub async fn update_reading_progress(
    book_id: String,
    current_page: u32,
    total_pages: u32,
) -> Result<ReadingProgress, String> {
    let percentage = if total_pages > 0 {
        (current_page as f64 / total_pages as f64) * 100.0
    } else {
        0.0
    };

    let progress = ReadingProgress {
        book_id,
        current_page,
        total_pages,
        percentage,
        last_read_at: chrono::Utc::now().to_rfc3339(),
        location: None,
        cfi: None,
    };

    // TODO: 保存到数据库
    Ok(progress)
}

#[tauri::command]
pub async fn open_book(file_path: String) -> Result<String, String> {
    // TODO: 打开书籍并返回内容
    Ok(format!("Opening book: {}", file_path))
}

#[tauri::command]
pub async fn search_in_book(_book_id: String, _query: String) -> Result<Vec<SearchResult>, String> {
    // TODO: 在书籍中搜索
    Ok(vec![])
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SearchResult {
    pub page: u32,
    pub position: u32,
    pub text: String,
    pub context: String,
}
