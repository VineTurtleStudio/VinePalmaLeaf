import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../../stores/bookStore';
import { PDFReader, EPUBReader, TextReader } from './formats';
import { Bookmark, Highlight } from '../../types/book';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const HIGHLIGHT_COLORS = [
  { value: '#fef08a', label: '黄色' },
  { value: '#bbf7d0', label: '绿色' },
  { value: '#bfdbfe', label: '蓝色' },
  { value: '#fecaca', label: '红色' },
  { value: '#e9d5ff', label: '紫色' },
];

function formatReadingTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}时${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

const ToolbarButton = React.memo(({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`rounded-lg p-2 transition-all ${
      active ? 'bg-emerald-100 text-emerald-600' : 'text-slate-600 hover:bg-slate-100'
    } ${disabled ? 'opacity-30' : ''}`}
  >
    {children}
  </button>
));
ToolbarButton.displayName = 'ToolbarButton';

const FONT_OPTIONS = [
  { value: 'serif', label: '宋体' },
  { value: 'sans', label: '黑体' },
  { value: 'kai', label: '楷体' },
  { value: 'mono', label: '等宽' },
];

const SettingsPanel = React.memo(({
  settings, onUpdateSettings, onClose,
}: {
  settings: any;
  onUpdateSettings: (s: any) => void;
  onClose: () => void;
}) => (
  <div className="absolute right-4 top-16 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
    <h4 className="mb-4 font-semibold text-slate-800">阅读设置</h4>
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-slate-600">字体大小: {settings.fontSize}px</label>
        <input type="range" min="12" max="28" value={settings.fontSize}
          onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
          className="w-full accent-emerald-500" />
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-600">字体</label>
        <div className="flex gap-2">
          {FONT_OPTIONS.map((f) => (
            <button key={f.value}
              onClick={() => onUpdateSettings({ fontFamily: f.value })}
              className={`flex-1 rounded-lg py-2 text-sm transition-all ${
                settings.fontFamily === f.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-600">行距: {settings.lineHeight}</label>
        <input type="range" min="1" max="3" step="0.1" value={settings.lineHeight}
          onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
          className="w-full accent-emerald-500" />
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-600">边距: {settings.margin}px</label>
        <input type="range" min="20" max="100" value={settings.margin}
          onChange={(e) => onUpdateSettings({ margin: Number(e.target.value) })}
          className="w-full accent-emerald-500" />
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-600">主题</label>
        <div className="flex gap-2">
          {[
            { value: 'light', icon: '☀️', label: '日间' },
            { value: 'dark', icon: '🌙', label: '夜间' },
            { value: 'sepia', icon: '📜', label: '护眼' },
          ].map((theme) => (
            <button key={theme.value}
              onClick={() => onUpdateSettings({ theme: theme.value })}
              className={`flex-1 rounded-lg py-2 text-sm transition-all ${
                settings.theme === theme.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {theme.icon} {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    <button onClick={onClose}
      className="mt-4 w-full rounded-lg bg-slate-100 py-2 text-sm text-slate-600 hover:bg-slate-200">
      关闭
    </button>
  </div>
));
SettingsPanel.displayName = 'SettingsPanel';

const BookmarkPanel = React.memo(({
  bookmarks, currentPage, onJump, onRemove,
}: {
  bookmarks: Bookmark[];
  currentPage: number;
  onJump: (page: number) => void;
  onRemove: (id: string) => void;
}) => (
  <div className="absolute right-4 top-16 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
    <h4 className="mb-4 font-semibold text-slate-800">书签列表</h4>
    {bookmarks.length === 0 ? (
      <p className="py-4 text-center text-sm text-slate-400">暂无书签</p>
    ) : (
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {bookmarks.sort((a, b) => a.page - b.page).map((bm) => (
          <div key={bm.id}
            className={`flex items-center justify-between rounded-lg p-3 transition-all ${
              bm.page === currentPage ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 hover:bg-slate-100'
            }`}>
            <button onClick={() => onJump(bm.page)} className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-700">第 {bm.page} 页</p>
              <p className="mt-0.5 text-xs text-slate-400">{new Date(bm.createdAt).toLocaleString('zh-CN')}</p>
            </button>
            <button onClick={() => onRemove(bm.id)}
              className="ml-2 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">✕</button>
          </div>
        ))}
      </div>
    )}
  </div>
));
BookmarkPanel.displayName = 'BookmarkPanel';

const HighlightPanel = React.memo(({
  highlights, onJump, onRemove,
}: {
  highlights: Highlight[];
  onJump: (page: number) => void;
  onRemove: (id: string) => void;
}) => (
  <div className="absolute right-4 top-16 z-30 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
    <h4 className="mb-4 font-semibold text-slate-800">标注列表</h4>
    {highlights.length === 0 ? (
      <p className="py-4 text-center text-sm text-slate-400">选中文字可添加标注</p>
    ) : (
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {highlights.map((hl) => (
          <div key={hl.id} className="rounded-lg bg-slate-50 p-3 hover:bg-slate-100">
            <div className="flex items-start justify-between">
              <button onClick={() => onJump(hl.page)} className="flex-1 text-left">
                <p className="line-clamp-2 text-sm text-slate-700" style={{ borderLeft: `3px solid ${hl.color}`, paddingLeft: 8 }}>
                  {hl.text}
                </p>
                {hl.note && <p className="mt-1 text-xs text-slate-400">📝 {hl.note}</p>}
                <p className="mt-1 text-xs text-slate-400">第 {hl.page} 页</p>
              </button>
              <button onClick={() => onRemove(hl.id)}
                className="ml-2 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">✕</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
));
HighlightPanel.displayName = 'HighlightPanel';

const JumpDialog = React.memo(({
  currentPage, totalPages, onJump, onClose,
}: {
  currentPage: number;
  totalPages: number;
  onJump: (page: number) => void;
  onClose: () => void;
}) => {
  const [value, setValue] = useState(String(currentPage));
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-72 rounded-2xl bg-white p-6 shadow-2xl">
        <h4 className="mb-4 text-center font-semibold text-slate-800">跳转到页</h4>
        <input type="number" min={1} max={totalPages} value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onJump(Number(value)); onClose(); } }}
          autoFocus
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
        <p className="mt-2 text-center text-sm text-slate-400">共 {totalPages} 页</p>
        <div className="mt-4 flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50">取消</button>
          <button onClick={() => { onJump(Number(value)); onClose(); }}
            className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-medium text-white hover:bg-emerald-600">跳转</button>
        </div>
      </div>
    </div>
  );
});
JumpDialog.displayName = 'JumpDialog';

const HighlightToolbar = React.memo(({
  position, onHighlight, onClose,
}: {
  position: { x: number; y: number };
  onHighlight: (color: string) => void;
  onClose: () => void;
}) => (
  <div
    className="fixed z-50 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
    style={{ left: position.x, top: position.y - 50 }}
  >
    {HIGHLIGHT_COLORS.map((c) => (
      <button key={c.value} onClick={() => { onHighlight(c.value); onClose(); }}
        className="h-6 w-6 rounded-full border-2 border-white shadow-sm transition-all hover:scale-125"
        style={{ backgroundColor: c.value }}
        title={c.label} />
    ))}
    <div className="mx-1 h-5 w-px bg-slate-200" />
    <button onClick={onClose}
      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">✕</button>
  </div>
));
HighlightToolbar.displayName = 'HighlightToolbar';

export const ReaderPage: React.FC = () => {
  const {
    currentBook, progress, settings, updateSettings, setProgress,
    toggleFavorite, favorites, bookmarks, highlights,
    addBookmark, removeBookmark, isBookmarked,
    addHighlight, removeHighlight,
  } = useBookStore();
  const navigate = useNavigate();

  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [highlightToolbar, setHighlightToolbar] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const readingTimer = useRef<ReturnType<typeof setInterval>>();

  const isFav = currentBook ? favorites.includes(currentBook.id) : false;

  // 格式路由
  const usePDFReader = currentBook?.format === 'pdf';
  const useEPUBReader = currentBook?.format === 'epub';
  const useTextReader = !usePDFReader && !useEPUBReader;

  // 恢复进度
  useEffect(() => {
    if (progress && progress.currentPage > 0 && !useTextReader) {
      setCurrentPage(progress.currentPage);
    }
  }, [progress]);

  // 保存进度
  useEffect(() => {
    if (currentBook && totalPages > 0) {
      setProgress({
        bookId: currentBook.id,
        currentPage,
        totalPages,
        percentage: Math.round((currentPage / totalPages) * 100),
        lastReadAt: new Date().toISOString(),
      });
    }
  }, [currentPage, totalPages, currentBook]);

  // 阅读计时
  useEffect(() => {
    if (!currentBook) return;
    readingTimer.current = setInterval(() => setReadingTime((t) => t + 1), 1000);
    return () => { if (readingTimer.current) clearInterval(readingTimer.current); };
  }, [currentBook]);

  // 自动隐藏工具栏
  const resetIdleTimer = useCallback(() => {
    setIsToolbarVisible(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!showSettings && !showBookmarks && !showHighlights && !showJump) {
        setIsToolbarVisible(false);
      }
    }, 5000);
  }, [showSettings, showBookmarks, showHighlights, showJump]);

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [currentPage, resetIdleTimer]);

  // 翻页
  const handlePrevPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
  const handleNextPage = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
  const handleJumpToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  }, [totalPages]);

  // 页面变化回调（从子 reader 传上来）
  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
  }, []);

  // 键盘
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showJump) return;
      switch (e.key) {
        case 'Escape': navigate('/'); break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrevPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          handleNextPage();
          break;
        case 'b': case 'B': e.preventDefault(); setShowBookmarks((v) => !v); setShowHighlights(false); break;
        case 'j': case 'J': e.preventDefault(); setShowJump(true); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, showJump, handlePrevPage, handleNextPage]);

  // 文本选择 -> 高亮
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 0 && contentRef.current?.contains(selection?.anchorNode as any)) {
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setHighlightToolbar({ x: rect.left + rect.width / 2 - 100, y: rect.top });
          setSelectedText(text);
        }
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleAddHighlight = useCallback((color: string) => {
    if (!currentBook || !selectedText) return;
    addHighlight({
      id: generateId(),
      bookId: currentBook.id,
      text: selectedText,
      color,
      page: currentPage,
      position: { start: 0, end: selectedText.length },
      createdAt: new Date().toISOString(),
    });
    window.getSelection()?.removeAllRanges();
  }, [currentBook, selectedText, currentPage, addHighlight]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentBook) return;
    const existing = bookmarks.find((b) => b.bookId === currentBook.id && b.page === currentPage);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark({
        id: generateId(),
        bookId: currentBook.id,
        title: `第 ${currentPage} 页`,
        page: currentPage,
        createdAt: new Date().toISOString(),
      });
    }
  }, [currentBook, currentPage, bookmarks, addBookmark, removeBookmark]);

  const closeAllPanels = useCallback(() => {
    setShowSettings(false);
    setShowBookmarks(false);
    setShowHighlights(false);
    setShowJump(false);
  }, []);

  // 未选择书籍
  if (!currentBook) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-8xl">📖</div>
          <h3 className="mt-6 text-2xl font-bold text-slate-800">未选择书籍</h3>
          <p className="mt-2 text-slate-500">请从书库中选择一本书开始阅读</p>
          <button onClick={() => navigate('/')}
            className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl">
            📚 返回书库
          </button>
        </div>
      </div>
    );
  }

  const isCurrentPageBookmarked = currentBook ? isBookmarked(currentBook.id, currentPage) : false;

  // PDF 双栏时步进 2
  const effectiveTotalPages = usePDFReader && totalPages > 1 ? Math.ceil(totalPages / 1) : totalPages;
  const displayCurrentPage = usePDFReader && isTwoPageSpread() ? Math.min(currentPage, totalPages) : currentPage;
  const displayTotalPages = usePDFReader ? totalPages : totalPages;

  function isTwoPageSpread() {
    // 简单判断：PDFReader 内部有自己的窗口宽度判断
    return false;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* 顶部工具栏 */}
      <div className={`absolute left-0 right-0 top-0 z-20 transition-all duration-300 ${isToolbarVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')}
              className="rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800">← 返回</button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="max-w-md">
              <h2 className="truncate font-semibold text-slate-800">{currentBook.title}</h2>
              <p className="truncate text-sm text-slate-500">{currentBook.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => { closeAllPanels(); setShowJump(true); }} title="跳转 (J)">🔢</ToolbarButton>
            <ToolbarButton onClick={handleToggleBookmark} active={isCurrentPageBookmarked} title="书签 (B)">
              {isCurrentPageBookmarked ? '🔖' : '📑'}
            </ToolbarButton>
            <ToolbarButton onClick={() => { closeAllPanels(); setShowBookmarks((v) => !v); }} active={showBookmarks} title="书签列表">📋</ToolbarButton>
            <ToolbarButton onClick={() => { closeAllPanels(); setShowHighlights((v) => !v); }} active={showHighlights} title="标注列表">🖍️</ToolbarButton>
            <ToolbarButton onClick={() => toggleFavorite(currentBook.id)} active={isFav} title={isFav ? '取消收藏' : '收藏'}>
              {isFav ? '★' : '☆'}
            </ToolbarButton>
            <ToolbarButton onClick={() => { closeAllPanels(); setShowSettings((v) => !v); }} active={showSettings} title="设置">⚙️</ToolbarButton>
          </div>
        </div>
      </div>

      {/* 面板 */}
      {showSettings && <SettingsPanel settings={settings} onUpdateSettings={updateSettings} onClose={() => setShowSettings(false)} />}
      {showBookmarks && (
        <BookmarkPanel bookmarks={bookmarks} currentPage={currentPage}
          onJump={(p) => { handleJumpToPage(p); setShowBookmarks(false); }}
          onRemove={removeBookmark} />
      )}
      {showHighlights && (
        <HighlightPanel highlights={highlights}
          onJump={(p) => { handleJumpToPage(p); setShowHighlights(false); }}
          onRemove={removeHighlight} />
      )}
      {showJump && (
        <JumpDialog currentPage={currentPage} totalPages={totalPages}
          onJump={(p) => { handleJumpToPage(p); setShowJump(false); }}
          onClose={() => setShowJump(false)} />
      )}
      {highlightToolbar && (
        <HighlightToolbar position={highlightToolbar} onHighlight={handleAddHighlight}
          onClose={() => { setHighlightToolbar(null); setSelectedText(''); }} />
      )}

      {/* 阅读区域 */}
      <div ref={contentRef} className="flex flex-1 pt-14 pb-12" onMouseMove={resetIdleTimer}>
        {usePDFReader && currentBook && (
          <PDFReader
            filePath={currentBook.filePath}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}

        {useEPUBReader && currentBook && (
          <EPUBReader
            filePath={currentBook.filePath}
            currentPage={currentPage}
            settings={settings}
            onPageChange={handlePageChange}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}

        {useTextReader && currentBook && (
          <TextReader
            filePath={currentBook.filePath}
            currentPage={currentPage}
            settings={settings}
            onPageChange={handlePageChange}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}
      </div>

      {/* 底部导航栏 */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${isToolbarVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="flex items-center justify-between border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-sm">
          {useTextReader && (
            <button onClick={handlePrevPage} disabled={currentPage <= 1}
              className="rounded-lg px-4 py-2 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30">← 上一页</button>
          )}
          {!useTextReader && <div />}

          <div className="flex items-center gap-4">
            <button onClick={() => setShowJump(true)}
              className="text-sm font-medium text-slate-700 hover:text-emerald-600">
              第 {currentPage} / {totalPages} 页
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm text-slate-500">{totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0}%</span>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs text-slate-400">⏱ {formatReadingTime(readingTime)}</span>
          </div>

          {useTextReader ? (
            <button onClick={handleNextPage} disabled={currentPage >= totalPages}
              className="rounded-lg px-4 py-2 text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30">下一页 →</button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
