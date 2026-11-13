use crate::sync::{SyncBookmark, SyncData, SyncNote, SyncProgress};

pub struct MergeStrategy;

impl MergeStrategy {
    pub fn merge_progress(local: &SyncProgress, remote: &SyncProgress) -> SyncProgress {
        // 取时间戳最新的进度
        if local.last_read_at > remote.last_read_at {
            local.clone()
        } else {
            remote.clone()
        }
    }

    pub fn merge_notes(local: &[SyncNote], remote: &[SyncNote]) -> Vec<SyncNote> {
        let mut merged = local.to_vec();
        for note in remote {
            if !merged.iter().any(|n| n.id == note.id) {
                merged.push(note.clone());
            }
        }
        merged
    }

    pub fn merge_bookmarks(local: &[SyncBookmark], remote: &[SyncBookmark]) -> Vec<SyncBookmark> {
        let mut merged = local.to_vec();
        for bookmark in remote {
            if !merged.iter().any(|b| b.id == bookmark.id) {
                merged.push(bookmark.clone());
            }
        }
        merged
    }

    pub fn three_way_merge(
        base: &SyncData,
        local: &SyncData,
        remote: &SyncData,
    ) -> SyncData {
        let mut result = base.clone();

        // 合并书籍（以有变更的为准）
        result.books = local.books.clone();
        for book in &remote.books {
            if !result.books.iter().any(|b| b.id == book.id) {
                result.books.push(book.clone());
            }
        }

        // 合并进度
        result.progress = local.progress.clone();
        for progress in &remote.progress {
            if let Some(existing) = result.progress.iter_mut().find(|p| p.book_id == progress.book_id) {
                *existing = Self::merge_progress(existing, progress);
            } else {
                result.progress.push(progress.clone());
            }
        }

        // 合并笔记和书签
        result.notes = Self::merge_notes(&local.notes, &remote.notes);
        result.bookmarks = Self::merge_bookmarks(&local.bookmarks, &remote.bookmarks);

        result
    }
}
