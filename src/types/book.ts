export interface Book {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  filePath: string;
  coverPath?: string;
  addedAt: string;
  lastReadAt?: string;
  metadata: BookMetadata;
}

export type BookFormat = 'epub' | 'pdf' | 'mobi' | 'azw3' | 'fb2' | 'txt' | 'html' | 'markdown' | 'rtf' | 'djvu' | 'cbz' | 'cbr' | 'cbt' | 'cb7';

export interface BookMetadata {
  publisher?: string;
  publishDate?: string;
  language?: string;
  description?: string;
  tags?: string[];
  pageCount?: number;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
  location?: string;
  cfi?: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  title: string;
  page: number;
  createdAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  color: string;
  page: number;
  position: HighlightPosition;
  note?: string;
  createdAt: string;
}

export interface HighlightPosition {
  start: number;
  end: number;
  cfi?: string;
}

export interface ReadingSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
  theme: Theme;
  columnCount: number;
}

export type Theme = 'light' | 'dark' | 'sepia' | 'custom';

export interface SyncDevice {
  id: string;
  name: string;
  lastSyncAt: string;
  syncType: SyncType;
}

export type SyncType = 'lan' | 'bluetooth' | 'webdav' | 'cloud';
