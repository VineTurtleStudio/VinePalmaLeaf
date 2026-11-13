import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { FormatReaderProps, readFileAsBlobUrl } from './types';

const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.toString();

export const PDFReader: React.FC<FormatReaderProps> = ({
  filePath,
  currentPage,
  onPageChange,
  onPrevPage,
  onNextPage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderSeqRef = useRef(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTwoColumn, setIsTwoColumn] = useState(false);
  const canvasLeftRef = useRef<HTMLCanvasElement>(null);
  const canvasRightRef = useRef<HTMLCanvasElement>(null);

  // 检测双栏
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setIsTwoColumn(el.clientWidth >= 900);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 加载 PDF — 读取文件创建 Blob URL，不在 JS 堆中持有整个文件
  useEffect(() => {
    let cancelled = false;
    let blobUrl: string | null = null;

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);

        blobUrl = await readFileAsBlobUrl(filePath);
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument({
          url: blobUrl,
          useSystemFonts: true,
        });
        const pdfDoc = await loadingTask.promise;

        if (cancelled) {
          pdfDoc.destroy();
          return;
        }

        pdfRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        onPageChange(1, pdfDoc.numPages);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        if (!cancelled) setError(`加载PDF失败: ${err}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (pdfRef.current) {
        pdfRef.current.destroy();
        pdfRef.current = null;
      }
    };
  }, [filePath]);

  // 渲染页面
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || isLoading) return;

    const seq = ++renderSeqRef.current;

    const render = async () => {
      try {
        const pageNum = currentPage;
        if (pageNum < 1 || pageNum > pdf.numPages) return;

        const page = await pdf.getPage(pageNum);
        if (seq !== renderSeqRef.current) return;

        const container = containerRef.current;
        if (!container) return;
        const containerWidth = container.clientWidth;

        const canvas = canvasLeftRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxPageWidth = isTwoColumn
          ? Math.min((containerWidth - 80) / 2, 500)
          : Math.min(containerWidth - 80, 700);

        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = maxPageWidth / baseViewport.width;
        const viewport = page.getViewport({ scale: fitScale });

        // 隐藏右页
        if (canvasRightRef.current) {
          canvasRightRef.current.style.display = 'none';
          canvasRightRef.current.width = 0;
          canvasRightRef.current.height = 0;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (seq !== renderSeqRef.current) return;

        // 双栏：渲染右页
        if (isTwoColumn && pageNum + 1 <= pdf.numPages) {
          const rightPage = await pdf.getPage(pageNum + 1);
          if (seq !== renderSeqRef.current) return;

          const rightCanvas = canvasRightRef.current;
          if (!rightCanvas) return;
          const rctx = rightCanvas.getContext('2d');
          if (!rctx) return;

          const rBaseViewport = rightPage.getViewport({ scale: 1 });
          const rFitScale = maxPageWidth / rBaseViewport.width;
          const rViewport = rightPage.getViewport({ scale: rFitScale });

          rightCanvas.width = rViewport.width;
          rightCanvas.height = rViewport.height;
          rightCanvas.style.display = 'block';

          rctx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
          await rightPage.render({ canvasContext: rctx, viewport: rViewport }).promise;
        }
      } catch (err) {
        if (seq === renderSeqRef.current) {
          console.error('PDF render error:', err);
        }
      }
    };

    render();
  }, [pdfRef.current, currentPage, isTwoColumn, isLoading]);

  const handlePrev = useCallback(() => onPrevPage(), [onPrevPage]);
  const handleNext = useCallback(() => onNextPage(), [onNextPage]);

  // 点击翻页
  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.35) handlePrev();
    else if (x > rect.width * 0.65) handleNext();
  }, [handlePrev, handleNext]);

  // 滚轮翻页
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (wheelTimerRef.current) return;
    wheelTimerRef.current = setTimeout(() => { wheelTimerRef.current = undefined; }, 300);
    if (e.deltaY > 0) handleNext();
    else if (e.deltaY < 0) handlePrev();
  }, [handlePrev, handleNext]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-100">
        <div className="w-full max-w-md space-y-4 px-8">
          <div className="flex justify-center">
            <div className="text-5xl animate-pulse">📄</div>
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-700">正在加载PDF文档</p>
            <p className="mt-1 text-sm text-slate-400">大文件可能需要一些时间...</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mb-4 text-5xl">❌</div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full cursor-pointer select-none items-center justify-center overflow-hidden bg-slate-100"
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <div className="flex items-center justify-center gap-4">
        <canvas
          ref={canvasLeftRef}
          className="rounded shadow-lg"
        />
        <canvas
          ref={canvasRightRef}
          className="rounded shadow-lg"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default PDFReader;
