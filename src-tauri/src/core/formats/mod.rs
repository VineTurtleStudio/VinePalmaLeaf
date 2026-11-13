pub mod epub;
pub mod pdf;
pub mod txt;

use crate::core::{BookDocument, FormatParser};
use crate::error::AppError;
use std::path::Path;

pub struct FormatRegistry {
    parsers: Vec<Box<dyn FormatParser>>,
}

impl FormatRegistry {
    pub fn new() -> Self {
        let mut registry = Self { parsers: vec![] };
        registry.register(Box::new(epub::EpubParser));
        registry.register(Box::new(pdf::PdfParser));
        registry.register(Box::new(txt::TxtParser));
        registry
    }

    pub fn register(&mut self, parser: Box<dyn FormatParser>) {
        self.parsers.push(parser);
    }

    pub fn get_parser(&self, ext: &str) -> Option<&dyn FormatParser> {
        self.parsers.iter().find(|p| p.supports(ext)).map(|p| p.as_ref())
    }

    pub fn parse_file(&self, path: &Path) -> Result<BookDocument, AppError> {
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .ok_or_else(|| AppError::InvalidFormat("No extension".to_string()))?;

        let parser = self
            .get_parser(ext)
            .ok_or_else(|| AppError::InvalidFormat(format!("Unsupported format: {}", ext)))?;

        parser.parse(path)
    }

    pub fn extract_cover(&self, path: &Path) -> Result<Vec<u8>, AppError> {
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .ok_or_else(|| AppError::InvalidFormat("No extension".to_string()))?;

        let parser = self
            .get_parser(ext)
            .ok_or_else(|| AppError::InvalidFormat(format!("Unsupported format: {}", ext)))?;

        parser.extract_cover(path)
    }

    pub fn supported_formats(&self) -> Vec<String> {
        vec![
            "epub".to_string(),
            "pdf".to_string(),
            "txt".to_string(),
            "mobi".to_string(),
            "azw3".to_string(),
            "fb2".to_string(),
            "html".to_string(),
            "md".to_string(),
        ]
    }
}
