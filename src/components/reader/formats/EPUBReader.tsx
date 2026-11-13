import React, { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { FormatReaderProps, readFileAsBlobUrl } from './types';

const THEMES: Record<string, Record<string, string>> = {
  light: { body: '{ "color": "#1e293b", "background": "#ffffff" }' },
  dark: { body: '{ "color": "#e2e8f0", "background": "#1e293b" }' },
  sepia: { body: '{ "color": "#78350f", "background": "#fef3c7" }' },
};

export const EPUBReader: React.FC<FormatReaderProps> = ({
  filePath,
  currentPage,
  settings,
  onPageChange,
  onPrevPage,
  onNextPage,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let blobUrl: string | null = null;

    const initEPUB = async () => {
      try {
        setIsLoading(true);
        setError(null);

        blobUrl = await readFileAsBlobUrl(filePath);
        if (cancelled) return;

        const book = ePub(blobUrl);
        bookRef.current = book;

        await book.ready;
        if (cancelled) { book.destroy(); return; }

        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });

        renditionRef.current = rendition;

        if (settings) {
          applyTheme(rendition, settings.theme);
          rendition.themes.fontSize(`${settings.fontSize}px`);
          rendition.themes.font(settings.fontFamily);
          rendition.themes.override('line-height', `${settings.lineHeight}`);
        }

        await rendition.display();

        const spine = book.spine;
        const totalLoc = spine.items.length;

        rendition.on('relocated', (location: any) => {
          if (cancelled) return;
          if (location && location.start) {
            const loc = location.start.displayed?.page || 1;
            onPageChange(loc, totalLoc);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load EPUB:', err);
        if (!cancelled) {
          setError('加载EPUB失败');
          setIsLoading(false);
        }
      }
    };

    initEPUB();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (bookRef.current) bookRef.current.destroy();
    };
  }, [filePath]);

  const applyTheme = (rendition: Rendition, theme: string) => {
    const themeConfig = THEMES[theme] || THEMES.light;
    rendition.themes.register('custom', themeConfig);
    rendition.themes.select('custom');
  };

  useEffect(() => {
    if (!renditionRef.current || !settings) return;
    const rendition = renditionRef.current;
    rendition.themes.fontSize(`${settings.fontSize}px`);
    rendition.themes.font(settings.fontFamily);
    rendition.themes.override('line-height', `${settings.lineHeight}`);
    applyTheme(rendition, settings.theme);
  }, [settings]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.next();
  }, [currentPage]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-pulse">📚</div>
          <p className="font-medium text-slate-700">正在加载电子书...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-5xl">❌</div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div ref={viewerRef} className="h-full w-full" />
    </div>
  );
};

export default EPUBReader;
