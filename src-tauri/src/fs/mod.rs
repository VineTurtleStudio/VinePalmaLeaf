pub mod cache;
pub mod thumbnail;
pub mod watcher;

use crate::error::AppError;
use std::path::Path;

pub struct FileSystem {
    base_dir: std::path::PathBuf,
}

impl FileSystem {
    pub fn new(base_dir: &Path) -> Self {
        Self {
            base_dir: base_dir.to_path_buf(),
        }
    }

    pub fn get_books_dir(&self) -> std::path::PathBuf {
        self.base_dir.join("books")
    }

    pub fn get_cache_dir(&self) -> std::path::PathBuf {
        self.base_dir.join("cache")
    }

    pub fn get_covers_dir(&self) -> std::path::PathBuf {
        self.base_dir.join("covers")
    }

    pub fn get_notes_dir(&self) -> std::path::PathBuf {
        self.base_dir.join("notes")
    }

    pub fn ensure_directories(&self) -> Result<(), AppError> {
        std::fs::create_dir_all(self.get_books_dir())?;
        std::fs::create_dir_all(self.get_cache_dir())?;
        std::fs::create_dir_all(self.get_covers_dir())?;
        std::fs::create_dir_all(self.get_notes_dir())?;
        Ok(())
    }

    pub fn copy_book(&self, source: &Path, book_id: &str) -> Result<std::path::PathBuf, AppError> {
        let ext = source
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("unknown");
        let dest = self.get_books_dir().join(format!("{}.{}", book_id, ext));
        std::fs::copy(source, &dest)?;
        Ok(dest)
    }

    pub fn delete_book(&self, book_id: &str) -> Result<(), AppError> {
        let books_dir = self.get_books_dir();
        for entry in std::fs::read_dir(&books_dir)? {
            let entry = entry?;
            let path = entry.path();
            if let Some(name) = path.file_stem().and_then(|n| n.to_str()) {
                if name == book_id {
                    std::fs::remove_file(path)?;
                    break;
                }
            }
        }
        Ok(())
    }
}
