use std::fs::File;
use std::io::Read;
use zip::ZipArchive;

/// 读取 EPUB 文件内容
#[tauri::command]
pub async fn read_epub(file_path: String) -> Result<String, String> {
    let file = File::open(&file_path).map_err(|e| format!("无法打开文件: {}", e))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("无法解析EPUB: {}", e))?;
    
    let mut content = String::new();
    
    // EPUB 结构: container.xml -> content.opf -> 各章节 xhtml
    let mut opf_path = String::new();
    
    for i in 0..archive.len() {
        let name = archive.by_index(i).unwrap().name().to_string();
        if name.contains("container.xml") {
            let mut file = archive.by_index(i).unwrap();
            let mut buf = String::new();
            file.read_to_string(&mut buf).unwrap_or(0);
            
            if let Some(start) = buf.find("full-path=\"") {
                let rest = &buf[start + 11..];
                if let Some(end) = rest.find('\"') {
                    opf_path = rest[..end].to_string();
                }
            }
            break;
        }
    }
    
    if opf_path.is_empty() {
        for i in 0..archive.len() {
            let name = archive.by_index(i).unwrap().name().to_string();
            if name.ends_with(".opf") {
                opf_path = name.clone();
                break;
            }
        }
    }
    
    if opf_path.is_empty() {
        return Err("无法找到EPUB目录文件".to_string());
    }
    
    let mut opf_content = String::new();
    if let Ok(mut file) = archive.by_name(&opf_path) {
        file.read_to_string(&mut opf_content).unwrap_or(0);
    }
    
    let mut chapter_ids: Vec<String> = Vec::new();
    let mut in_spine = false;
    for line in opf_content.lines() {
        if line.contains("<spine") { in_spine = true; }
        if line.contains("</spine>") { in_spine = false; }
        if in_spine && line.contains("itemref") {
            if let Some(start) = line.find("idref=\"") {
                let rest = &line[start + 7..];
                if let Some(end) = rest.find('\"') {
                    chapter_ids.push(rest[..end].to_string());
                }
            }
        }
    }
    
    let mut manifest: std::collections::HashMap<String, String> = std::collections::HashMap::new();
    let mut in_manifest = false;
    for line in opf_content.lines() {
        if line.contains("<manifest") { in_manifest = true; }
        if line.contains("</manifest>") { in_manifest = false; }
        if in_manifest && line.contains("item ") {
            let id = extract_xml_attr(line, "id");
            let href = extract_xml_attr(line, "href");
            if !id.is_empty() && !href.is_empty() {
                manifest.insert(id, href);
            }
        }
    }
    
    let opf_dir = opf_path.rsplit_once('/').map_or("", |(d, _)| d);
    
    for id in &chapter_ids {
        if let Some(href) = manifest.get(id.as_str()) {
            let chapter_path = if opf_dir.is_empty() {
                href.clone()
            } else {
                format!("{}/{}", opf_dir, href)
            };
            
            if let Ok(mut file) = archive.by_name(&chapter_path) {
                let mut buf = String::new();
                file.read_to_string(&mut buf).unwrap_or(0);
                let text = strip_html(&buf);
                if !text.trim().is_empty() {
                    content.push_str(&text);
                    content.push_str("\n\n");
                }
            }
        }
    }
    
    if content.is_empty() {
        for i in 0..archive.len() {
            let name = archive.by_index(i).unwrap().name().to_string();
            if name.ends_with(".xhtml") || name.ends_with(".html") || name.ends_with(".htm") {
                let mut file = archive.by_index(i).unwrap();
                let mut buf = String::new();
                file.read_to_string(&mut buf).unwrap_or(0);
                let text = strip_html(&buf);
                if !text.trim().is_empty() {
                    content.push_str(&text);
                    content.push_str("\n\n");
                }
            }
        }
    }
    
    if content.is_empty() {
        Err("EPUB文件内容为空".to_string())
    } else {
        Ok(content.trim().to_string())
    }
}

/// 从 EPUB 提取元数据
#[tauri::command]
pub async fn read_epub_metadata(file_path: String) -> Result<serde_json::Value, String> {
    let file = File::open(&file_path).map_err(|e| format!("无法打开文件: {}", e))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("无法解析EPUB: {}", e))?;
    
    let mut title = String::new();
    let mut author = String::new();
    
    for i in 0..archive.len() {
        let name = archive.by_index(i).unwrap().name().to_string();
        if name.ends_with(".opf") {
            let mut file = archive.by_index(i).unwrap();
            let mut buf = String::new();
            file.read_to_string(&mut buf).unwrap_or(0);
            
            title = extract_dc_metadata(&buf, "title");
            author = extract_dc_metadata(&buf, "creator");
            break;
        }
    }
    
    Ok(serde_json::json!({ "title": title, "author": author }))
}

/// 读取 FB2 (FictionBook2) 文件
#[tauri::command]
pub async fn read_fb2(file_path: String) -> Result<String, String> {
    let content = std::fs::read_to_string(&file_path).map_err(|e| format!("无法读取文件: {}", e))?;
    
    let mut text = String::new();
    let mut in_body = false;
    let mut in_paragraph = false;
    let mut in_title = false;
    
    for line in content.lines() {
        let trimmed = line.trim();
        
        if trimmed.contains("<body") { in_body = true; continue; }
        if trimmed.contains("</body>") { in_body = false; continue; }
        if !in_body { continue; }
        
        if trimmed.contains("<title>") || trimmed.contains("<title ") { in_title = true; }
        if in_title {
            let clean = strip_xml_tags(trimmed);
            if !clean.trim().is_empty() {
                text.push_str(&clean);
                text.push('\n');
            }
            if trimmed.contains("</title>") {
                in_title = false;
                text.push_str("\n\n");
            }
            continue;
        }
        
        if trimmed.contains("<p>") || trimmed.contains("<p ") { in_paragraph = true; }
        if in_paragraph {
            let clean = strip_xml_tags(trimmed);
            if !clean.trim().is_empty() {
                text.push_str(&clean);
                text.push(' ');
            }
            if trimmed.contains("</p>") {
                in_paragraph = false;
                text.push_str("\n\n");
            }
        }
        
        if trimmed.contains("<h>") || trimmed.contains("<subtitle>") {
            let clean = strip_xml_tags(trimmed);
            if !clean.trim().is_empty() {
                text.push_str(&format!("{}\n\n", clean));
            }
        }
    }
    
    let result = text.trim().to_string();
    if result.is_empty() { Err("FB2文件内容为空".to_string()) } else { Ok(result) }
}

/// 从 FB2 提取元数据
#[tauri::command]
pub async fn read_fb2_metadata(file_path: String) -> Result<serde_json::Value, String> {
    let content = std::fs::read_to_string(&file_path).map_err(|e| format!("无法读取文件: {}", e))?;
    
    let mut title = String::new();
    let mut author = String::new();
    
    if let Some(start) = content.find("<title-info>") {
        let section = &content[start..];
        if let Some(end) = section.find("</title-info>") {
            let title_info = &section[..end];
            title = extract_fb2_tag(title_info, "book-title");
            let first_name = extract_fb2_tag(title_info, "first-name");
            let last_name = extract_fb2_tag(title_info, "last-name");
            author = format!("{} {}", first_name, last_name).trim().to_string();
        }
    }
    
    Ok(serde_json::json!({ "title": title, "author": if author.is_empty() { "未知作者".to_string() } else { author } }))
}

/// 读取 RTF 文件
#[tauri::command]
pub async fn read_rtf(file_path: String) -> Result<String, String> {
    let content = std::fs::read_to_string(&file_path).map_err(|e| format!("无法读取文件: {}", e))?;
    
    let mut text = String::new();
    let chars: Vec<char> = content.chars().collect();
    let mut i = 0;
    
    while i < chars.len() {
        match chars[i] {
            '\\' => {
                let mut ctrl = String::new();
                i += 1;
                while i < chars.len() && chars[i].is_alphanumeric() {
                    ctrl.push(chars[i]);
                    i += 1;
                }
                match ctrl.as_str() {
                    "par" | "pard" => text.push('\n'),
                    "tab" => text.push('\t'),
                    "line" | "nl" => text.push('\n'),
                    "u" => {
                        let mut num = String::new();
                        while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '-') {
                            num.push(chars[i]);
                            i += 1;
                        }
                        if let Ok(code) = num.parse::<i32>() {
                            let c = if code < 0 { (65536 + code) as u32 } else { code as u32 };
                            if let Some(ch) = char::from_u32(c) { text.push(ch); }
                        }
                        if i < chars.len() && chars[i] == '?' { i += 1; }
                    }
                    _ => {}
                }
                while i < chars.len() && chars[i].is_ascii_digit() { i += 1; }
                if i < chars.len() && chars[i] == ' ' { i += 1; }
            }
            '{' | '}' => { i += 1; }
            _ => { text.push(chars[i]); i += 1; }
        }
    }
    
    let result = text.lines().map(|l| l.trim()).collect::<Vec<_>>().join("\n")
        .replace("\n\n\n+", "\n\n").trim().to_string();
    
    if result.is_empty() { Err("RTF文件内容为空".to_string()) } else { Ok(result) }
}

/// 读取 PDF 文件
#[tauri::command]
pub async fn read_pdf(file_path: String) -> Result<String, String> {
    let bytes = std::fs::read(&file_path).map_err(|e| format!("无法读取文件: {}", e))?;
    
    match pdf_extract::extract_text_from_mem(&bytes) {
        Ok(text) => {
            if text.trim().is_empty() {
                Err("PDF文件内容为空（可能是扫描版PDF）".to_string())
            } else {
                Ok(text)
            }
        }
        Err(e) => Err(format!("PDF解析失败: {}", e)),
    }
}

/// 读取 MOBI 文件
#[tauri::command]
pub async fn read_mobi(file_path: String) -> Result<String, String> {
    let data = std::fs::read(&file_path).map_err(|e| format!("无法读取文件: {}", e))?;
    
    match mobi::Mobi::new(&data) {
        Ok(mobi_file) => {
            let text = String::from_utf8_lossy(&mobi_file.content);
            let clean_text = strip_html(&text);
            if clean_text.trim().is_empty() { Err("MOBI文件内容为空".to_string()) } else { Ok(clean_text) }
        }
        Err(e) => Err(format!("无法解析MOBI: {:?}", e)),
    }
}

/// 读取 DJVU 文件
#[tauri::command]
pub async fn read_djvu(file_path: String) -> Result<String, String> {
    let metadata = std::fs::metadata(&file_path).map_err(|e| e.to_string())?;
    Ok(format!(
        "[DJVU 格式]\n\n文件: {}\n大小: {} KB\n\nDJVU 格式需要专门的渲染引擎。\n文件路径: {}",
        file_path.split('/').last().unwrap_or("未知"), metadata.len() / 1024, file_path
    ))
}

// ============ 辅助函数 ============

pub fn strip_html(html: &str) -> String {
    let mut text = String::new();
    let mut in_tag = false;
    let mut in_script = false;
    let mut in_style = false;
    
    for line in html.lines() {
        let lower = line.to_lowercase();
        if lower.contains("<script") { in_script = true; }
        if lower.contains("</script>") { in_script = false; continue; }
        if lower.contains("<style") { in_style = true; }
        if lower.contains("</style>") { in_style = false; continue; }
        if in_script || in_style { continue; }
        
        for ch in line.chars() {
            match ch {
                '<' => in_tag = true,
                '>' => { in_tag = false; text.push(' '); }
                '&' => { text.push(' '); }
                _ if !in_tag => text.push(ch),
                _ => {}
            }
        }
        text.push('\n');
    }
    
    text.lines().map(|l| l.trim()).filter(|l| !l.is_empty()).collect::<Vec<_>>().join("\n")
}

fn strip_xml_tags(xml: &str) -> String {
    let mut text = String::new();
    let mut in_tag = false;
    for ch in xml.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => text.push(ch),
            _ => {}
        }
    }
    text.trim().to_string()
}

fn extract_xml_attr(line: &str, attr: &str) -> String {
    let pattern = format!("{}=\"", attr);
    if let Some(start) = line.find(&pattern) {
        let rest = &line[start + pattern.len()..];
        if let Some(end) = rest.find('\"') { return rest[..end].to_string(); }
    }
    String::new()
}

fn extract_dc_metadata(content: &str, tag: &str) -> String {
    let pattern = format!("<dc:{}>", tag);
    let end_pattern = format!("</dc:{}>", tag);
    if let Some(start) = content.find(&pattern) {
        let rest = &content[start + pattern.len()..];
        if let Some(end) = rest.find(&end_pattern) { return rest[..end].trim().to_string(); }
    }
    let pattern2 = format!("opf:{}=\"", tag);
    if let Some(start) = content.find(&pattern2) {
        let rest = &content[start + pattern2.len()..];
        if let Some(end) = rest.find('\"') { return rest[..end].trim().to_string(); }
    }
    String::new()
}

fn extract_fb2_tag(content: &str, tag: &str) -> String {
    let pattern = format!("<{}>", tag);
    let end_pattern = format!("</{}>", tag);
    if let Some(start) = content.find(&pattern) {
        let rest = &content[start + pattern.len()..];
        if let Some(end) = rest.find(&end_pattern) { return rest[..end].trim().to_string(); }
    }
    String::new()
}
