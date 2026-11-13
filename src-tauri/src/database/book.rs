use crate::error::AppError;
use sqlx::SqlitePool;

pub struct BookDao {
    pool: SqlitePool,
}

impl BookDao {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create_book(&self, book: &crate::core::BookDocument) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO books (id, title, author, format, file_path, cover_path, added_at, last_read_at, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&book.id)
        .bind(&book.title)
        .bind(&book.author)
        .bind(&book.format)
        .bind(&book.file_path)
        .bind(&book.cover_path)
        .bind(chrono::Utc::now().to_rfc3339())
        .bind::<Option<String>>(None)
        .bind(serde_json::to_string(&book.metadata).unwrap_or_default())
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn get_book(&self, book_id: &str) -> Result<Option<crate::core::BookDocument>, AppError> {
        let row: Option<(String, String, String, String, String, Option<String>, String, Option<String>, String)> =
            sqlx::query_as(
                "SELECT id, title, author, format, file_path, cover_path, added_at, last_read_at, metadata FROM books WHERE id = ?",
            )
            .bind(book_id)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some((id, title, author, format, file_path, cover_path, _added_at, _last_read_at, metadata)) => {
                let metadata = serde_json::from_str(&metadata).unwrap_or_default();
                Ok(Some(crate::core::BookDocument {
                    id,
                    title,
                    author,
                    format,
                    file_path,
                    cover_path,
                    metadata,
                    content: vec![],
                }))
            }
            None => Ok(None),
        }
    }

    pub async fn list_books(&self) -> Result<Vec<crate::core::BookDocument>, AppError> {
        let rows: Vec<(String, String, String, String, String, Option<String>, String, Option<String>, String)> =
            sqlx::query_as(
                "SELECT id, title, author, format, file_path, cover_path, added_at, last_read_at, metadata FROM books",
            )
            .fetch_all(&self.pool)
            .await?;

        let books = rows
            .into_iter()
            .map(|(id, title, author, format, file_path, cover_path, _added_at, _last_read_at, metadata)| {
                let metadata = serde_json::from_str(&metadata).unwrap_or_default();
                crate::core::BookDocument {
                    id,
                    title,
                    author,
                    format,
                    file_path,
                    cover_path,
                    metadata,
                    content: vec![],
                }
            })
            .collect();

        Ok(books)
    }

    pub async fn update_book(&self, book: &crate::core::BookDocument) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE books 
            SET title = ?, author = ?, format = ?, file_path = ?, cover_path = ?, metadata = ?
            WHERE id = ?
            "#,
        )
        .bind(&book.title)
        .bind(&book.author)
        .bind(&book.format)
        .bind(&book.file_path)
        .bind(&book.cover_path)
        .bind(serde_json::to_string(&book.metadata).unwrap_or_default())
        .bind(&book.id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn delete_book(&self, book_id: &str) -> Result<(), AppError> {
        sqlx::query("DELETE FROM books WHERE id = ?")
            .bind(book_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn search_books(&self, query: &str) -> Result<Vec<crate::core::BookDocument>, AppError> {
        let rows: Vec<(String, String, String, String, String, Option<String>, String, Option<String>, String)> =
            sqlx::query_as(
                "SELECT id, title, author, format, file_path, cover_path, added_at, last_read_at, metadata FROM books WHERE title LIKE ? OR author LIKE ?",
            )
            .bind(format!("%{}%", query))
            .bind(format!("%{}%", query))
            .fetch_all(&self.pool)
            .await?;

        let books = rows
            .into_iter()
            .map(|(id, title, author, format, file_path, cover_path, _added_at, _last_read_at, metadata)| {
                let metadata = serde_json::from_str(&metadata).unwrap_or_default();
                crate::core::BookDocument {
                    id,
                    title,
                    author,
                    format,
                    file_path,
                    cover_path,
                    metadata,
                    content: vec![],
                }
            })
            .collect();

        Ok(books)
    }
}
