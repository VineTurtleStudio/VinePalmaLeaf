import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { Book, BookFormat, BookMetadata } from '../types/book';

// 支持的文件格式
export const SUPPORTED_FORMATS: Record<string, BookFormat> = {
  epub: 'epub',
  pdf: 'pdf',
  mobi: 'mobi',
  azw3: 'azw3',
  fb2: 'fb2',
  txt: 'txt',
  html: 'html',
  htm: 'html',
  md: 'markdown',
  markdown: 'markdown',
  rtf: 'rtf',
  djvu: 'djvu',
  cbz: 'cbz',
  cbr: 'cbr',
};

// 获取文件格式
export function getFileFormat(filename: string): BookFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && SUPPORTED_FORMATS[ext]) {
    return SUPPORTED_FORMATS[ext];
  }
  return null;
}

// 从文件名提取书名
export function extractTitleFromFilename(filename: string): string {
  const name = filename.replace(/\.[^/.]+$/, '');
  return name
    .replace(/^[\d\.\-\s]+/, '')
    .replace(/[_]/g, ' ')
    .trim() || '未知书名';
}

// 获取文件扩展名列表
export function getSupportedExtensions(): string[] {
  return Object.keys(SUPPORTED_FORMATS);
}

// 打开文件对话框并导入书籍
export async function importBooks(): Promise<Book[]> {
  try {
    console.log('Opening file dialog...');
    
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: '电子书',
          extensions: getSupportedExtensions(),
        },
      ],
    });

    console.log('File dialog result:', selected);

    if (!selected) {
      return [];
    }

    const files = Array.isArray(selected) ? selected : [selected];
    const books: Book[] = [];

    for (const file of files) {
      try {
        const filePath = typeof file === 'string' ? file : (file as any)?.path || String(file);
        if (!filePath) {
          console.warn('No file path found for:', file);
          continue;
        }

        const filename = filePath.split(/[/\\]/).pop() || '';
        const format = getFileFormat(filename);
        
        if (!format) {
          console.warn(`Unsupported format: ${filename}`);
          continue;
        }

        let title = extractTitleFromFilename(filename);
        let author = '未知作者';
        let metadata: BookMetadata = {};
        
        // 根据格式提取元数据
        try {
          if (format === 'epub') {
            const epubMeta = await invoke<{title: string; author: string}>('read_epub_metadata', { filePath });
            if (epubMeta.title) title = epubMeta.title;
            if (epubMeta.author) author = epubMeta.author;
          } else if (format === 'fb2') {
            const fb2Meta = await invoke<{title: string; author: string}>('read_fb2_metadata', { filePath });
            if (fb2Meta.title) title = fb2Meta.title;
            if (fb2Meta.author) author = fb2Meta.author;
          } else if (['txt', 'markdown', 'md', 'html', 'htm', 'rtf'].includes(format)) {
            const content = await invoke<string>('read_file_content', { filePath });
            if (content) {
              const header = content.substring(0, 1000);
              const authorMatch = header.match(/(?:作者|Author|BY|By|by)[:\s]*(.+)/i);
              if (authorMatch && authorMatch[1]) {
                author = authorMatch[1].trim().substring(0, 50);
              }
            }
          }
        } catch (readError) {
          console.warn('Failed to read metadata:', readError);
        }

        const book: Book = {
          id: generateId(),
          title,
          author,
          format,
          filePath,
          addedAt: new Date().toISOString(),
          metadata,
        };

        books.push(book);
        console.log('Book added:', book.title);
      } catch (fileError) {
        console.error('Error processing file:', fileError);
        continue;
      }
    }

    console.log('Total books imported:', books.length);
    return books;
  } catch (error) {
    console.error('Failed to import books:', error);
    return [];
  }
}

// 读取书籍内容
export async function readBookContent(filePath: string, format: string): Promise<string> {
  console.log('Reading book:', filePath, 'format:', format);
  
  try {
    switch (format) {
      case 'epub': {
        const content = await invoke<string>('read_epub', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'fb2': {
        const content = await invoke<string>('read_fb2', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'rtf': {
        const content = await invoke<string>('read_rtf', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'mobi':
      case 'azw3': {
        const content = await invoke<string>('read_mobi', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'txt':
      case 'markdown':
      case 'md': {
        const content = await invoke<string>('read_file_content', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'html':
      case 'htm': {
        const content = await invoke<string>('read_file_content', { filePath });
        const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return text || '（文件内容为空）';
      }
      
      case 'pdf': {
        const content = await invoke<string>('read_pdf', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'djvu': {
        const content = await invoke<string>('read_djvu', { filePath });
        return content || '（文件内容为空）';
      }
      
      case 'cbz':
      case 'cbr': {
        return `[${format.toUpperCase()} 格式]\n\n漫画压缩包格式，需要图片浏览支持。\n文件路径：${filePath}`;
      }
      
      default:
        return `[${format.toUpperCase()} 格式]\n\n暂不支持此格式的解析。\n文件路径：${filePath}`;
    }
  } catch (error) {
    console.error('Failed to read book content:', error);
    return `读取文件失败\n\n错误信息：${error}\n文件路径：${filePath}`;
  }
}

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// localStorage 相关函数
export function saveBooksToStorage(books: Book[]): void {
  try {
    localStorage.setItem('vinepalma-books', JSON.stringify(books));
  } catch (error) {
    console.error('Failed to save books:', error);
  }
}

export function loadBooksFromStorage(): Book[] {
  try {
    const data = localStorage.getItem('vinepalma-books');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load books:', error);
    return [];
  }
}

export function saveProgressToStorage(bookId: string, progress: any): void {
  try {
    localStorage.setItem(`vinepalma-progress-${bookId}`, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

export function loadProgressFromStorage(bookId: string): any {
  try {
    const data = localStorage.getItem(`vinepalma-progress-${bookId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
}

export function saveFavoritesToStorage(favorites: string[]): void {
  try {
    localStorage.setItem('vinepalma-favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

export function loadFavoritesFromStorage(): string[] {
  try {
    const data = localStorage.getItem('vinepalma-favorites');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
}

export function saveSettingsToStorage(settings: any): void {
  try {
    localStorage.setItem('vinepalma-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettingsFromStorage(): any {
  try {
    const data = localStorage.getItem('vinepalma-settings');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}
