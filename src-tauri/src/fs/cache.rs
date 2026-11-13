use crate::error::AppError;
use std::path::Path;

pub struct CacheManager {
    cache_dir: std::path::PathBuf,
}

impl CacheManager {
    pub fn new(cache_dir: &Path) -> Self {
        Self {
            cache_dir: cache_dir.to_path_buf(),
        }
    }

    pub async fn get_cached_content(&self, book_id: &str) -> Result<Option<String>, AppError> {
        let cache_file = self.cache_dir.join(format!("{}.json", book_id));
        if cache_file.exists() {
            let content = tokio::fs::read_to_string(&cache_file).await?;
            Ok(Some(content))
        } else {
            Ok(None)
        }
    }

    pub async fn cache_content(&self, book_id: &str, content: &str) -> Result<(), AppError> {
        let cache_file = self.cache_dir.join(format!("{}.json", book_id));
        tokio::fs::write(&cache_file, content).await?;
        Ok(())
    }

    pub async fn clear_cache(&self) -> Result<(), AppError> {
        if self.cache_dir.exists() {
            tokio::fs::remove_dir_all(&self.cache_dir).await?;
            tokio::fs::create_dir_all(&self.cache_dir).await?;
        }
        Ok(())
    }

    pub async fn get_cache_size(&self) -> Result<u64, AppError> {
        let mut total_size = 0;
        if self.cache_dir.exists() {
            let mut entries = tokio::fs::read_dir(&self.cache_dir).await?;
            while let Some(entry) = entries.next_entry().await? {
                let metadata = entry.metadata().await?;
                if metadata.is_file() {
                    total_size += metadata.len();
                }
            }
        }
        Ok(total_size)
    }
}
