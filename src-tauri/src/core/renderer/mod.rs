pub mod paginator;
pub mod theme;
pub mod typesetter;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderSettings {
    pub font_size: u32,
    pub font_family: String,
    pub line_height: f64,
    pub margin: u32,
    pub column_count: u32,
    pub theme: Theme,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Theme {
    Light,
    Dark,
    Sepia,
    Custom(String),
}

impl Default for RenderSettings {
    fn default() -> Self {
        Self {
            font_size: 16,
            font_family: "serif".to_string(),
            line_height: 1.5,
            margin: 20,
            column_count: 1,
            theme: Theme::Light,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderedPage {
    pub page_number: u32,
    pub content: String,
    pub width: u32,
    pub height: u32,
}

pub struct Renderer {
    settings: RenderSettings,
}

impl Renderer {
    pub fn new(settings: RenderSettings) -> Self {
        Self { settings }
    }

    pub fn render_page(&self, content: &str, page_number: u32) -> RenderedPage {
        // TODO: 实现页面渲染
        RenderedPage {
            page_number,
            content: content.to_string(),
            width: 800,
            height: 600,
        }
    }

    pub fn paginate(&self, _content: &str) -> Vec<RenderedPage> {
        // TODO: 实现分页算法
        vec![]
    }

    pub fn update_settings(&mut self, settings: RenderSettings) {
        self.settings = settings;
    }

    pub fn get_settings(&self) -> &RenderSettings {
        &self.settings
    }
}
