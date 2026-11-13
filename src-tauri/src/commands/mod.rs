pub mod book;
pub mod note;
pub mod reader;
pub mod sync;
pub mod formats;

pub use book::*;
pub use note::*;
pub use reader::*;
pub use sync::*;
pub use formats::*;

#[tauri::command]
pub async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! Welcome to VinePalma Leaf!", name))
}

#[tauri::command]
pub async fn read_file_content(file_path: String) -> Result<String, String> {
    std::fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn read_file_bytes(file_path: String) -> Result<String, String> {
    use base64::Engine;
    let bytes = std::fs::read(&file_path).map_err(|e| e.to_string())?;
    Ok(base64::engine::general_purpose::STANDARD.encode(&bytes))
}

#[tauri::command]
pub async fn save_book_to_local(
    file_path: String,
    book_id: String,
) -> Result<String, String> {
    let app_dir = dirs::data_dir()
        .or_else(|| dirs::home_dir())
        .ok_or_else(|| "Cannot find app directory".to_string())?;
    
    let books_dir = app_dir.join("vinepalma-leaf").join("books");
    std::fs::create_dir_all(&books_dir).map_err(|e| e.to_string())?;
    
    let source_path = std::path::Path::new(&file_path);
    let ext = source_path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("bin");
    
    let dest_path = books_dir.join(format!("{}.{}", book_id, ext));
    std::fs::copy(source_path, &dest_path).map_err(|e| e.to_string())?;
    
    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_app_dir() -> Result<String, String> {
    let app_dir = dirs::data_dir()
        .or_else(|| dirs::home_dir())
        .ok_or_else(|| "Cannot find app directory".to_string())?;
    
    Ok(app_dir.join("vinepalma-leaf").to_string_lossy().to_string())
}
