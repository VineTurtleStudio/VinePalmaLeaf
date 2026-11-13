import { ReadingSettings } from '../../../types/book';

export interface FormatReaderProps {
  filePath: string;
  currentPage: number;
  settings?: ReadingSettings;
  onPageChange: (page: number, totalPages: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export interface FormatReaderRef {
  getCurrentPage: () => number;
  getTotalPages: () => number;
}

/**
 * 通过 Tauri IPC 读取文件为 Uint8Array，创建 Blob URL
 * 避免 base64 搬运，避免 URL 协议兼容问题
 */
export async function readFileAsBlobUrl(filePath: string): Promise<string> {
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const bytes = await readFile(filePath);
  const blob = new Blob([bytes]);
  return URL.createObjectURL(blob);
}
