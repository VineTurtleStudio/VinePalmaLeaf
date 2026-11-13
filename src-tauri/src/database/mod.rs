pub mod book;
pub mod fts;
pub mod note;
pub mod progress;

use sqlx::SqlitePool;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Result<Self, crate::error::AppError> {
        let pool = SqlitePool::connect("sqlite::memory:").await?;
        
        // 创建表结构
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                format TEXT NOT NULL,
                file_path TEXT NOT NULL,
                cover_path TEXT,
                added_at TEXT NOT NULL,
                last_read_at TEXT,
                metadata TEXT
            )
            "#,
        )
        .execute(&pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS reading_progress (
                book_id TEXT PRIMARY KEY,
                current_page INTEGER NOT NULL,
                total_pages INTEGER NOT NULL,
                percentage REAL NOT NULL,
                last_read_at TEXT NOT NULL,
                location TEXT,
                cfi TEXT,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
            "#,
        )
        .execute(&pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS bookmarks (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                title TEXT NOT NULL,
                page INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
            "#,
        )
        .execute(&pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS highlights (
                id TEXT PRIMARY KEY,
                book_id TEXT NOT NULL,
                text TEXT NOT NULL,
                color TEXT NOT NULL,
                page INTEGER NOT NULL,
                position TEXT NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES books(id)
            )
            "#,
        )
        .execute(&pool)
        .await?;

        Ok(Self { pool })
    }

    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}
