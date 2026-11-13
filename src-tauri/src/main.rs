// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            vinepalma_leaf_lib::commands::greet,
            vinepalma_leaf_lib::commands::get_books,
            vinepalma_leaf_lib::commands::add_book,
            vinepalma_leaf_lib::commands::remove_book,
            vinepalma_leaf_lib::commands::get_reading_progress,
            vinepalma_leaf_lib::commands::update_reading_progress,
            vinepalma_leaf_lib::commands::read_file_content,
            vinepalma_leaf_lib::commands::read_file_bytes,
            vinepalma_leaf_lib::commands::save_book_to_local,
            vinepalma_leaf_lib::commands::get_app_dir,
            vinepalma_leaf_lib::commands::read_epub,
            vinepalma_leaf_lib::commands::read_epub_metadata,
            vinepalma_leaf_lib::commands::read_fb2,
            vinepalma_leaf_lib::commands::read_fb2_metadata,
            vinepalma_leaf_lib::commands::read_rtf,
            vinepalma_leaf_lib::commands::read_pdf,
            vinepalma_leaf_lib::commands::read_mobi,
            vinepalma_leaf_lib::commands::read_djvu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
