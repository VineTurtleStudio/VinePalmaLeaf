import { create } from 'zustand';
import { Book, ReadingProgress, ReadingSettings, Bookmark, Highlight } from '../types/book';
import {
  saveBooksToStorage,
  loadBooksFromStorage,
  saveProgressToStorage,
  loadProgressFromStorage,
  saveSettingsToStorage,
  loadSettingsFromStorage,
  saveFavoritesToStorage,
  loadFavoritesFromStorage,
} from '../utils/bookUtils';

// localStorage helpers for bookmarks/highlights
function saveBookmarksToStorage(bookId: string, bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(`vinepalma-bookmarks-${bookId}`, JSON.stringify(bookmarks));
  } catch (e) { console.error('Failed to save bookmarks:', e); }
}
function loadBookmarksFromStorage(bookId: string): Bookmark[] {
  try {
    const data = localStorage.getItem(`vinepalma-bookmarks-${bookId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) { console.error('Failed to load bookmarks:', e); return []; }
}
function saveHighlightsToStorage(bookId: string, highlights: Highlight[]): void {
  try {
    localStorage.setItem(`vinepalma-highlights-${bookId}`, JSON.stringify(highlights));
  } catch (e) { console.error('Failed to save highlights:', e); }
}
function loadHighlightsFromStorage(bookId: string): Highlight[] {
  try {
    const data = localStorage.getItem(`vinepalma-highlights-${bookId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) { console.error('Failed to load highlights:', e); return []; }
}

interface BookState {
  books: Book[];
  currentBook: Book | null;
  progress: ReadingProgress | null;
  settings: ReadingSettings;
  favorites: string[];
  bookmarks: Bookmark[];
  highlights: Highlight[];
  isLoading: boolean;
  error: string | null;
  
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  addBooks: (books: Book[]) => void;
  removeBook: (bookId: string) => void;
  setCurrentBook: (book: Book | null) => void;
  
  setProgress: (progress: ReadingProgress) => void;
  loadProgress: (bookId: string) => void;
  
  updateSettings: (settings: Partial<ReadingSettings>) => void;
  
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  
  // 书签
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (bookId: string, page: number) => boolean;
  
  // 高亮
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  updateHighlightNote: (id: string, note: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  initialize: () => void;
}

const defaultSettings: ReadingSettings = {
  fontSize: 18,
  fontFamily: 'serif',
  lineHeight: 1.8,
  margin: 40,
  theme: 'light',
  columnCount: 1,
};

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBook: null,
  progress: null,
  settings: defaultSettings,
  favorites: [],
  bookmarks: [],
  highlights: [],
  isLoading: false,
  error: null,
  
  initialize: () => {
    const books = loadBooksFromStorage();
    const settings = loadSettingsFromStorage() || defaultSettings;
    const favorites = loadFavoritesFromStorage();
    set({ books, settings, favorites });
  },
  
  setBooks: (books) => {
    set({ books });
    saveBooksToStorage(books);
  },
  
  addBook: (book) => {
    const newBooks = [...get().books, book];
    set({ books: newBooks });
    saveBooksToStorage(newBooks);
  },
  
  addBooks: (newBooks) => {
    const existingBooks = get().books;
    const booksToAdd = newBooks.filter(
      (newBook) => !existingBooks.some((existing) => existing.filePath === newBook.filePath)
    );
    if (booksToAdd.length === 0) return;
    const allBooks = [...existingBooks, ...booksToAdd];
    set({ books: allBooks });
    saveBooksToStorage(allBooks);
  },
  
  removeBook: (bookId) => {
    const newBooks = get().books.filter((book) => book.id !== bookId);
    set({ books: newBooks });
    saveBooksToStorage(newBooks);
    const newFavorites = get().favorites.filter((id) => id !== bookId);
    set({ favorites: newFavorites });
    saveFavoritesToStorage(newFavorites);
  },
  
  setCurrentBook: (book) => {
    set({ currentBook: book, bookmarks: [], highlights: [] });
    if (book) {
      get().loadProgress(book.id);
      const bookmarks = loadBookmarksFromStorage(book.id);
      const highlights = loadHighlightsFromStorage(book.id);
      set({ bookmarks, highlights });
    }
  },
  
  setProgress: (progress) => {
    set({ progress });
    if (progress) {
      saveProgressToStorage(progress.bookId, progress);
      const books = get().books;
      const updatedBooks = books.map((book) => {
        if (book.id === progress.bookId) {
          return { ...book, lastReadAt: new Date().toISOString() };
        }
        return book;
      });
      set({ books: updatedBooks });
      saveBooksToStorage(updatedBooks);
    }
  },
  
  loadProgress: (bookId) => {
    const progress = loadProgressFromStorage(bookId);
    if (progress) {
      set({ progress });
    } else {
      const newProgress: ReadingProgress = {
        bookId,
        currentPage: 1,
        totalPages: 100,
        percentage: 1,
        lastReadAt: new Date().toISOString(),
      };
      set({ progress: newProgress });
    }
  },
  
  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    set({ settings });
    saveSettingsToStorage(settings);
  },
  
  toggleFavorite: (bookId) => {
    const favorites = get().favorites;
    const isFav = favorites.includes(bookId);
    const newFavorites = isFav ? favorites.filter((id) => id !== bookId) : [...favorites, bookId];
    set({ favorites: newFavorites });
    saveFavoritesToStorage(newFavorites);
  },
  
  isFavorite: (bookId) => get().favorites.includes(bookId),
  
  // 书签
  addBookmark: (bookmark) => {
    const bookmarks = [...get().bookmarks, bookmark];
    set({ bookmarks });
    saveBookmarksToStorage(bookmark.bookId, bookmarks);
  },
  
  removeBookmark: (id) => {
    const bookId = get().currentBook?.id;
    if (!bookId) return;
    const bookmarks = get().bookmarks.filter((b) => b.id !== id);
    set({ bookmarks });
    saveBookmarksToStorage(bookId, bookmarks);
  },
  
  isBookmarked: (bookId, page) => {
    return get().bookmarks.some((b) => b.bookId === bookId && b.page === page);
  },
  
  // 高亮
  addHighlight: (highlight) => {
    const highlights = [...get().highlights, highlight];
    set({ highlights });
    saveHighlightsToStorage(highlight.bookId, highlights);
  },
  
  removeHighlight: (id) => {
    const bookId = get().currentBook?.id;
    if (!bookId) return;
    const highlights = get().highlights.filter((h) => h.id !== id);
    set({ highlights });
    saveHighlightsToStorage(bookId, highlights);
  },
  
  updateHighlightNote: (id, note) => {
    const bookId = get().currentBook?.id;
    if (!bookId) return;
    const highlights = get().highlights.map((h) => h.id === id ? { ...h, note } : h);
    set({ highlights });
    saveHighlightsToStorage(bookId, highlights);
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
