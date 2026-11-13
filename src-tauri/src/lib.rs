pub mod commands;
pub mod core;
pub mod database;
pub mod error;
pub mod fs;
pub mod sync;

use database::Database;
use std::sync::Arc;

pub struct AppStateWrapper {
    pub db: Arc<Database>,
}

impl AppStateWrapper {
    pub async fn new() -> Result<Self, error::AppError> {
        let db = Database::new().await?;
        Ok(Self {
            db: Arc::new(db),
        })
    }
}
