import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { FormatReaderProps } from './types';
import { readBookContent } from '../../../utils/bookUtils';

const FONT_STYLES: Record<string, string> = {
  serif: 'Noto Serif SC, SimSun, serif',
  sans: 'Noto Sans SC, Microsoft YaHei, sans-serif',
  kai: 'KaiTi, STKaiti, serif',
  mono: 'Fira Code, Consolas, monospace',
};

function paginateContent(content: string, charsPerPage: number): string[] {
  if (!content || content.trim().length === 0) return ['暂无内容'];
  const paragraphs = content.split(/\n\s*\n|\r\n\s*\r\n/);
  const pages: string[] = [];
  let currentPageContent = '';
  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;
    if (trimmedPara.length > charsPerPage) {
      if (currentPageContent.trim()) {
        pages.push(currentPageContent.trim());
        currentPageContent = '';
      }
      const sentences = trimmedPara.split(/(?<=[。！？.!?\n])\s*/);
      for (const sentence of sentences) {
        if (currentPageContent.length + sentence.length > charsPerPage && currentPageContent.trim()) {
          pages.push(currentPageContent.trim());
          currentPageContent = '';
        }
        currentPageContent += sentence + ' ';
      }
    } else if (currentPageContent.length + trimmedPara.length > charsPerPage && currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
      currentPageContent = trimmedPara + '\n\n';
    } else {
      currentPageContent += trimmedPara + '\n\n';
    }
  }
  if (currentPageContent.trim()) pages.push(currentPageContent.trim());
  return pages.length > 0 ? pages : ['暂无内容'];
}

function formatContent(content: string, format: string): string {
  if (format === 'markdown' || format === 'md') {
    return content
      .replace(/^#{1}\s+(.+)$/gm, '$1\n')
      .replace(/^#{2}\s+(.+)$/gm, '$1\n')
      .replace(/^#{3}\s+(.+)$/gm, '$1\n')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1');
  }
  return content;
}

export const TextReader: React.FC<FormatReaderProps> = ({
  filePath,
  currentPage,
  settings,
  onPageChange,
  onPrevPage,
  onNextPage,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [bookContent, setBookContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const charsPerPage = useMemo(() => {
    if (!settings) return 2000;
    const contentWidth = 800 - settings.margin * 2;
    const charWidth = settings.fontSize * 0.6;
    const charsPerLine = Math.floor(contentWidth / charWidth);
    const contentHeight = 500 - settings.margin * 2;
    const lineHeightPx = settings.fontSize * settings.lineHeight;
    const visibleLines = Math.floor(contentHeight / lineHeightPx);
    return charsPerLine * visibleLines;
  }, [settings?.fontSize, settings?.lineHeight, settings?.margin]);

  const pages = useMemo(() => paginateContent(bookContent, charsPerPage), [bookContent, charsPerPage]);
  const totalPages = pages.length;

  // 加载内容
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        // filePath 形如 /path/to/file.xxx，需要取文件名判断格式
        const ext = filePath.split('.').pop()?.toLowerCase() || 'txt';
        const formatMap: Record<string, string> = {
          txt: 'txt', md: 'markdown', markdown: 'markdown',
          html: 'html', htm: 'html', rtf: 'rtf',
          mobi: 'mobi', azw3: 'mobi', fb2: 'fb2', djvu: 'djvu',
        };
        const format = formatMap[ext] || 'txt';
        const content = await readBookContent(filePath, format);
        const formatted = formatContent(content, format);
        setBookContent(formatted);
        onPageChange(1, Math.ceil(formatted.length / charsPerPage) || 1);
      } catch (error) {
        console.error('Failed to load content:', error);
        setBookContent('加载书籍内容失败...');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [filePath]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        onPrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        onNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevPage, onNextPage]);

  const currentPageContent = pages.length > 0
    ? pages[Math.min(currentPage - 1, pages.length - 1)]
    : '加载中...';

  const getThemeStyles = () => {
    switch (settings?.theme) {
      case 'dark': return 'bg-slate-800 text-slate-200';
      case 'sepia': return 'bg-amber-50 text-amber-900';
      default: return 'bg-white text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-pulse">📖</div>
          <p className="font-medium text-slate-700">正在加载书籍内容...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full justify-center bg-slate-100">
      <div
        ref={contentRef}
        className={`h-full overflow-hidden rounded-lg shadow-lg ${getThemeStyles()}`}
        style={{
          maxWidth: '800px',
          width: '100%',
          padding: `${settings?.margin || 40}px`,
          fontSize: `${settings?.fontSize || 18}px`,
          fontFamily: FONT_STYLES[settings?.fontFamily || 'serif'],
          lineHeight: settings?.lineHeight || 1.8,
        }}
      >
        <div className="whitespace-pre-wrap leading-relaxed select-text">
          {currentPageContent}
        </div>
      </div>
    </div>
  );
};

export default TextReader;
