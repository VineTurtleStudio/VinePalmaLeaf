use crate::core::renderer::RenderSettings;

pub struct Paginator {
    _page_width: u32,
    _page_height: u32,
}

impl Paginator {
    pub fn new(_settings: &RenderSettings) -> Self {
        Self {
            _page_width: 800,
            _page_height: 600,
        }
    }

    pub fn paginate(&self, content: &str, _settings: &RenderSettings) -> Vec<String> {
        let _ = content;
        vec![]
    }
}
