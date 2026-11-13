import React, { useMemo } from 'react';
import { Book } from '../../types/book';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

// 书籍封面颜色映射
const coverColors: Record<string, string> = {
  epub: 'from-blue-400 to-blue-600',
  pdf: 'from-red-400 to-red-600',
  mobi: 'from-purple-400 to-purple-600',
  txt: 'from-slate-400 to-slate-600',
  fb2: 'from-green-400 to-green-600',
  default: 'from-emerald-400 to-emerald-600',
};

// 格式图标
const formatIcons: Record<string, string> = {
  epub: '📘',
  pdf: '📕',
  mobi: '📙',
  txt: '📄',
  fb2: '📗',
  default: '📚',
};

export const BookCard: React.FC<BookCardProps> = React.memo(({ book, onClick }) => {
  const colorClass = coverColors[book.format] || coverColors.default;
  const icon = formatIcons[book.format] || formatIcons.default;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onClick(book)}
    >
      {/* 书籍封面 */}
      <div className="relative mb-3 overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <div
          className={`flex aspect-[3/4] items-center justify-center bg-gradient-to-br ${colorClass}`}
        >
          {book.coverPath ? (
            <img
              src={book.coverPath}
              alt={book.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <span className="mb-2 text-4xl">{icon}</span>
              <span className="px-4 text-center text-sm font-medium leading-tight opacity-90">
                {book.title}
              </span>
            </div>
          )}
        </div>
        
        {/* 格式标签 */}
        <div className="absolute right-2 top-2">
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {book.format.toUpperCase()}
          </span>
        </div>

        {/* 悬停遮罩 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
          <span className="translate-y-4 rounded-xl bg-white px-4 py-2 font-medium text-slate-800 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
            阅读
          </span>
        </div>
      </div>

      {/* 书籍信息 */}
      <div className="px-1">
        <h3 className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-600">
          {book.title}
        </h3>
        <p className="truncate text-xs text-slate-500">{book.author}</p>
        {book.lastReadAt && (
          <p className="mt-1 text-xs text-slate-400">
            最近阅读: {new Date(book.lastReadAt).toLocaleDateString('zh-CN')}
          </p>
        )}
      </div>
    </div>
  );
});

BookCard.displayName = 'BookCard';
