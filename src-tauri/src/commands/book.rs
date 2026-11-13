use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookResponse {
    pub id: String,
    pub title: String,
    pub author: String,
    pub format: String,
    pub file_path: String,
    pub cover_path: Option<String>,
    pub added_at: String,
    pub last_read_at: Option<String>,
}

#[tauri::command]
pub async fn get_books() -> Result<Vec<BookResponse>, String> {
    // TODO: 从数据库获取书籍列表
    Ok(vec![])
}

#[tauri::command]
pub async fn add_book(
    title: String,
    author: String,
    format: String,
    file_path: String,
) -> Result<BookResponse, String> {
    let id = Uuid::new_v4().to_string();
    let added_at = chrono::Utc::now().to_rfc3339();

    let book = BookResponse {
        id,
        title,
        author,
        format,
        file_path,
        cover_path: None,
        added_at,
        last_read_at: None,
    };

    // TODO: 保存到数据库
    Ok(book)
}

#[tauri::command]
pub async fn remove_book(_book_id: String) -> Result<(), String> {
    // TODO: 从数据库删除书籍
    Ok(())
}

#[tauri::command]
pub async fn get_book_details(_book_id: String) -> Result<BookResponse, String> {
    // TODO: 从数据库获取书籍详情
    Err("Not implemented".to_string())
}
