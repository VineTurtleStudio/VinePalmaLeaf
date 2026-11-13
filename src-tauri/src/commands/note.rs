use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub book_id: String,
    pub content: String,
    pub page: u32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Highlight {
    pub id: String,
    pub book_id: String,
    pub text: String,
    pub color: String,
    pub page: u32,
    pub position: HighlightPosition,
    pub note: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HighlightPosition {
    pub start: u32,
    pub end: u32,
    pub cfi: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bookmark {
    pub id: String,
    pub book_id: String,
    pub title: String,
    pub page: u32,
    pub created_at: String,
}

#[tauri::command]
pub async fn get_notes(_book_id: String) -> Result<Vec<Note>, String> {
    // TODO: 从数据库获取笔记
    Ok(vec![])
}

#[tauri::command]
pub async fn add_note(
    book_id: String,
    content: String,
    page: u32,
) -> Result<Note, String> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let note = Note {
        id,
        book_id,
        content,
        page,
        created_at: now.clone(),
        updated_at: now,
    };

    // TODO: 保存到数据库
    Ok(note)
}

#[tauri::command]
pub async fn update_note(_note_id: String, _content: String) -> Result<Note, String> {
    // TODO: 更新笔记
    Err("Not implemented".to_string())
}

#[tauri::command]
pub async fn delete_note(_note_id: String) -> Result<(), String> {
    // TODO: 删除笔记
    Ok(())
}

#[tauri::command]
pub async fn get_highlights(_book_id: String) -> Result<Vec<Highlight>, String> {
    // TODO: 从数据库获取高亮
    Ok(vec![])
}

#[tauri::command]
pub async fn add_highlight(
    book_id: String,
    text: String,
    color: String,
    page: u32,
    start: u32,
    end: u32,
) -> Result<Highlight, String> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let highlight = Highlight {
        id,
        book_id,
        text,
        color,
        page,
        position: HighlightPosition {
            start,
            end,
            cfi: None,
        },
        note: None,
        created_at: now,
    };

    // TODO: 保存到数据库
    Ok(highlight)
}

#[tauri::command]
pub async fn get_bookmarks(_book_id: String) -> Result<Vec<Bookmark>, String> {
    // TODO: 从数据库获取书签
    Ok(vec![])
}

#[tauri::command]
pub async fn add_bookmark(
    book_id: String,
    title: String,
    page: u32,
) -> Result<Bookmark, String> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let bookmark = Bookmark {
        id,
        book_id,
        title,
        page,
        created_at: now,
    };

    // TODO: 保存到数据库
    Ok(bookmark)
}

#[tauri::command]
pub async fn delete_bookmark(_bookmark_id: String) -> Result<(), String> {
    // TODO: 删除书签
    Ok(())
}
