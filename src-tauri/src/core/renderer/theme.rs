use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeConfig {
    pub name: String,
    pub background_color: String,
    pub text_color: String,
    pub accent_color: String,
}

impl ThemeConfig {
    pub fn light() -> Self {
        Self {
            name: "light".to_string(),
            background_color: "#ffffff".to_string(),
            text_color: "#0f0f0f".to_string(),
            accent_color: "#10b981".to_string(),
        }
    }

    pub fn dark() -> Self {
        Self {
            name: "dark".to_string(),
            background_color: "#1e293b".to_string(),
            text_color: "#f6f6f6".to_string(),
            accent_color: "#10b981".to_string(),
        }
    }

    pub fn sepia() -> Self {
        Self {
            name: "sepia".to_string(),
            background_color: "#f4ecd8".to_string(),
            text_color: "#5b4636".to_string(),
            accent_color: "#8b6914".to_string(),
        }
    }
}
