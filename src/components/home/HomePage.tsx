import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../../stores/bookStore';
import { BookCard } from '../library/BookCard';
import { importBooks } from '../../utils/bookUtils';

export const HomePage: React.FC = () => {
  const { books, addBooks, setCurrentBook } = useBookStore();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);

  // 获取最近阅读的书籍
  const recentBooks = [...books]
    .filter((book) => book.lastReadAt)
    .sort((a, b) => new Date(b.lastReadAt!).getTime() - new Date(a.lastReadAt!).getTime())
    .slice(0, 6);

  // 获取所有书籍（最多6本）
  const allBooks = [...books].slice(0, 6);

  const handleBookClick = (book: any) => {
    setCurrentBook(book);
    navigate('/reader');
  };

  const handleImportBooks = async () => {
    setIsImporting(true);
    try {
      const newBooks = await importBooks();
      if (newBooks.length > 0) {
        addBooks(newBooks);
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* 顶部横幅 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRhMiAyIDAgMSAxLTQgMCAyIDIgMCAwIDEgNCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white">欢迎使用 VinePalma Leaf</h1>
          <p className="mt-3 text-lg text-white/80">您的跨平台全能电子书阅读器</p>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate('/library')}
              className="rounded-xl bg-white px-6 py-3 font-medium text-emerald-600 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl"
            >
              📚 浏览书库
            </button>
            <button
              onClick={handleImportBooks}
              disabled={isImporting}
              className="rounded-xl bg-white/20 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50"
            >
              {isImporting ? '⏳ 导入中...' : '➕ 导入书籍'}
            </button>
          </div>
        </div>
        {/* 装饰性元素 */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10"></div>
      </div>

      <div className="p-8">
        {/* 统计卡片 */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">总书籍</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">{books.length}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl shadow-lg shadow-emerald-200">
                📚
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">已读完</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {books.filter((b) => b.lastReadAt).length}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-2xl shadow-lg shadow-blue-200">
                ✅
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">收藏夹</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {useBookStore.getState().favorites.length}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-2xl shadow-lg shadow-amber-200">
                ⭐
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">同步设备</p>
                <p className="mt-1 text-3xl font-bold text-slate-800">1</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-2xl shadow-lg shadow-purple-200">
                🔄
              </div>
            </div>
          </div>
        </div>

        {/* 最近阅读 */}
        {recentBooks.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">📖 最近阅读</h2>
              <button
                onClick={() => navigate('/recent')}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                查看全部 →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {recentBooks.map((book) => (
                <BookCard key={book.id} book={book} onClick={handleBookClick} />
              ))}
            </div>
          </section>
        )}

        {/* 快捷操作 */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">⚡ 快捷操作</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={handleImportBooks}
              disabled={isImporting}
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl transition-all group-hover:bg-emerald-100 group-hover:scale-110">
                {isImporting ? '⏳' : '➕'}
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">
                  {isImporting ? '导入中...' : '导入书籍'}
                </p>
                <p className="text-sm text-slate-500">支持 EPUB, PDF, MOBI 等</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/sync')}
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all hover:border-blue-400 hover:bg-blue-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl transition-all group-hover:bg-blue-100 group-hover:scale-110">
                🔄
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">同步设备</p>
                <p className="text-sm text-slate-500">多设备阅读进度同步</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all hover:border-amber-400 hover:bg-amber-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl transition-all group-hover:bg-amber-100 group-hover:scale-110">
                ⚙️
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">阅读设置</p>
                <p className="text-sm text-slate-500">字体、主题、排版</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/library')}
              className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 transition-all hover:border-purple-400 hover:bg-purple-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl transition-all group-hover:bg-purple-100 group-hover:scale-110">
                📖
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800">浏览书库</p>
                <p className="text-sm text-slate-500">查看所有书籍</p>
              </div>
            </button>
          </div>
        </section>

        {/* 所有书籍 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">📚 我的书库</h2>
            <button
              onClick={() => navigate('/library')}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              查看全部 →
            </button>
          </div>
          {allBooks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {allBooks.map((book) => (
                <BookCard key={book.id} book={book} onClick={handleBookClick} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
              <div className="text-6xl">📚</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-800">书库空空如也</h3>
              <p className="mt-2 text-slate-500">点击上方"导入书籍"开始添加您的电子书</p>
              <button
                onClick={handleImportBooks}
                disabled={isImporting}
                className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl disabled:opacity-50"
              >
                {isImporting ? '⏳ 导入中...' : '➕ 立即导入'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
