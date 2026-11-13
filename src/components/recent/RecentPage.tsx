import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '../../stores/bookStore';
import { BookCard } from '../library/BookCard';

export const RecentPage: React.FC = () => {
  const { books, setCurrentBook } = useBookStore();
  const navigate = useNavigate();

  const recentBooks = [...books]
    .filter((book) => book.lastReadAt)
    .sort((a, b) => new Date(b.lastReadAt!).getTime() - new Date(a.lastReadAt!).getTime());

  const handleBookClick = (book: any) => {
    setCurrentBook(book);
    navigate('/reader');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-800">📖 最近阅读</h1>
        <p className="mt-1 text-sm text-slate-500">继续您上次的阅读</p>
      </div>

      <div className="p-6">
        {recentBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recentBooks.map((book) => (
              <BookCard key={book.id} book={book} onClick={handleBookClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-7xl">📖</div>
            <h3 className="mt-6 text-xl font-semibold text-slate-800">暂无阅读记录</h3>
            <p className="mt-2 text-slate-500">开始阅读一本书，它会出现在这里</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl"
            >
              📚 浏览书库
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
