use crate::error::AppError;
use sqlx::SqlitePool;

pub struct FtsDao {
    pool: SqlitePool,
}

impl FtsDao {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn initialize_fts(&self) -> Result<(), AppError> {
        sqlx::query(
            r#"
            CREATE VIRTUAL TABLE IF NOT EXISTS books_fts USING fts5(
                title, author, content,
                content='books',
                content_rowid='rowid'
            )
            "#,
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn search(&self, query: &str) -> Result<Vec<String>, AppError> {
        let rows: Vec<(String,)> = sqlx::query_as(
            "SELECT title FROM books_fts WHERE books_fts MATCH ?",
        )
        .bind(query)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(|(title,)| title).collect())
    }
}
