use crate::core::BookDocument;
use crate::error::AppError;

pub struct DocumentManager {
    documents: Vec<BookDocument>,
}

impl DocumentManager {
    pub fn new() -> Self {
        Self {
            documents: vec![],
        }
    }

    pub fn add_document(&mut self, document: BookDocument) {
        self.documents.push(document);
    }

    pub fn remove_document(&mut self, document_id: &str) -> Result<(), AppError> {
        self.documents.retain(|d| d.id != document_id);
        Ok(())
    }

    pub fn get_document(&self, document_id: &str) -> Option<&BookDocument> {
        self.documents.iter().find(|d| d.id == document_id)
    }

    pub fn get_document_mut(&mut self, document_id: &str) -> Option<&mut BookDocument> {
        self.documents.iter_mut().find(|d| d.id == document_id)
    }

    pub fn list_documents(&self) -> &[BookDocument] {
        &self.documents
    }

    pub fn search_documents(&self, query: &str) -> Vec<&BookDocument> {
        let query_lower = query.to_lowercase();
        self.documents
            .iter()
            .filter(|d| {
                d.title.to_lowercase().contains(&query_lower)
                    || d.author.to_lowercase().contains(&query_lower)
            })
            .collect()
    }

    pub fn get_chapter_content(
        &self,
        document_id: &str,
        chapter_id: &str,
    ) -> Result<String, AppError> {
        let document = self
            .get_document(document_id)
            .ok_or_else(|| AppError::NotFound(format!("Document not found: {}", document_id)))?;

        let chapter = document
            .content
            .iter()
            .find(|c| c.id == chapter_id)
            .ok_or_else(|| AppError::NotFound(format!("Chapter not found: {}", chapter_id)))?;

        Ok(chapter.content.clone())
    }
}
