use crate::error::AppError;
use sqlx::SqlitePool;

pub struct NoteDao {
    pool: SqlitePool,
}

impl NoteDao {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_notes(&self, book_id: &str) -> Result<Vec<String>, AppError> {
        let rows: Vec<(String,)> = sqlx::query_as(
            "SELECT content FROM highlights WHERE book_id = ? AND note IS NOT NULL",
        )
        .bind(book_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(|(content,)| content).collect())
    }
}
