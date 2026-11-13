use crate::core::ReadingProgress;
use crate::error::AppError;
use sqlx::SqlitePool;

pub struct ProgressDao {
    pool: SqlitePool,
}

impl ProgressDao {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn get_progress(&self, book_id: &str) -> Result<Option<ReadingProgress>, AppError> {
        let row: Option<(String, u32, u32, f64, String, Option<String>, Option<String>)> =
            sqlx::query_as(
                "SELECT book_id, current_page, total_pages, percentage, last_read_at, location, cfi FROM reading_progress WHERE book_id = ?",
            )
            .bind(book_id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some((book_id, current_page, total_pages, percentage, last_read_at, location, cfi)) => {
                Ok(Some(ReadingProgress {
                    book_id,
                    current_page,
                    total_pages,
                    percentage,
                    last_read_at,
                    location,
                    cfi,
                }))
            }
            None => Ok(None),
        }
    }

    pub async fn upsert_progress(&self, progress: &ReadingProgress) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO reading_progress (book_id, current_page, total_pages, percentage, last_read_at, location, cfi)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(book_id) DO UPDATE SET
                current_page = excluded.current_page,
                total_pages = excluded.total_pages,
                percentage = excluded.percentage,
                last_read_at = excluded.last_read_at,
                location = excluded.location,
                cfi = excluded.cfi
            "#,
        )
        .bind(&progress.book_id)
        .bind(progress.current_page)
        .bind(progress.total_pages)
        .bind(progress.percentage)
        .bind(&progress.last_read_at)
        .bind(&progress.location)
        .bind(&progress.cfi)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn delete_progress(&self, book_id: &str) -> Result<(), AppError> {
        sqlx::query("DELETE FROM reading_progress WHERE book_id = ?")
            .bind(book_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn list_progress(&self) -> Result<Vec<ReadingProgress>, AppError> {
        let rows: Vec<(String, u32, u32, f64, String, Option<String>, Option<String>)> =
            sqlx::query_as(
                "SELECT book_id, current_page, total_pages, percentage, last_read_at, location, cfi FROM reading_progress",
            )
            .fetch_all(&self.pool)
            .await?;

        let progress_list = rows
            .into_iter()
            .map(|(book_id, current_page, total_pages, percentage, last_read_at, location, cfi)| {
                ReadingProgress {
                    book_id,
                    current_page,
                    total_pages,
                    percentage,
                    last_read_at,
                    location,
                    cfi,
                }
            })
            .collect();

        Ok(progress_list)
    }
}
