import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../../stores/bookStore';
import { BookCard } from './BookCard';
import { Modal } from '../ui/Modal';
import { importBooks } from '../../utils/bookUtils';

export const LibraryPage: React.FC = () => {
  const { books, addBooks, removeBook, setCurrentBook } = useBookStore();
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'date'>('date');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return books
      .filter(
        (book) =>
          (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterFormat === 'all' || book.format === filterFormat)
      )
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'author') return a.author.localeCompare(b.author);
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [books, searchQuery, filterFormat, sortBy]);

  const handleBookClick = (book: any) => {
    setCurrentBook(book);
    navigate('/reader');
  };

  const handleImportBooks = async () => {
    setIsImporting(true);
    setImportError(null);
    
    try {
      const newBooks = await importBooks();
      if (newBooks.length > 0) {
        addBooks(newBooks);
        setIsImportModalOpen(false);
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这本书吗？')) {
      removeBook(bookId);
    }
  };

  const formats = ['all', 'epub', 'pdf', 'mobi', 'txt', 'fb2', 'md'];

  return (
    <div className="flex h-full flex-col">
      {/* 顶部工具栏 */}
      <div className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">📚 我的书库</h1>
            <p className="mt-1 text-sm text-slate-500">共 {filteredBooks.length} 本书籍</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl"
            >
              <span>➕</span>
              <span>导入书籍</span>
            </button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="搜索书名、作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          {/* 格式筛选 */}
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => setFilterFormat(format)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterFormat === format
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {format === 'all' ? '全部' : format.toUpperCase()}
              </button>
            ))}
          </div>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="date">按添加时间</option>
            <option value="title">按书名</option>
            <option value="author">按作者</option>
          </select>

          {/* 视图切换 */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ▦
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* 书籍列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-7xl">📚</div>
            <h3 className="mt-6 text-xl font-semibold text-slate-800">
              {searchQuery ? '未找到匹配的书籍' : '书库空空如也'}
            </h3>
            <p className="mt-2 text-slate-500">
              {searchQuery
                ? '尝试使用其他关键词搜索'
                : '点击"导入书籍"开始添加您的电子书'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl"
              >
                ➕ 立即导入
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="relative">
                <BookCard book={book} onClick={handleBookClick} />
                <button
                  onClick={(e) => handleDeleteBook(book.id, e)}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-red-500 p-1.5 text-white opacity-0 shadow transition-all hover:bg-red-600 group-hover:opacity-100"
                  style={{ opacity: 0 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                  {book.coverPath ? (
                    <img src={book.coverPath} alt="" className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <span className="text-2xl">📚</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{book.title}</h3>
                  <p className="text-sm text-slate-500">{book.author}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {book.format.toUpperCase()}
                </span>
                {book.lastReadAt && (
                  <span className="text-xs text-slate-400">
                    {new Date(book.lastReadAt).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={(e) => handleDeleteBook(book.id, e)}
                  className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 导入弹窗 */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="导入书籍"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            支持 EPUB, PDF, MOBI, AZW3, FB2, TXT, HTML, Markdown 等格式
          </p>

          {importError && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700">
              {importError}
            </div>
          )}

          <button
            onClick={handleImportBooks}
            disabled={isImporting}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <span className="text-2xl animate-spin">⏳</span>
                <span className="font-medium text-slate-700">正在导入...</span>
              </>
            ) : (
              <>
                <span className="text-4xl">📁</span>
                <div>
                  <p className="font-medium text-slate-700">点击选择文件</p>
                  <p className="text-sm text-slate-500">支持批量导入多本书籍</p>
                </div>
              </>
            )}
          </button>

          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">💡 提示：</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>支持批量选择多个文件导入</li>
              <li>TXT 格式支持自动提取作者信息</li>
              <li>书籍数据保存在本地，不会上传到云端</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleImportBooks}
              disabled={isImporting}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isImporting ? '导入中...' : '选择文件导入'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
