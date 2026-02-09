import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import HTMLFlipBook from 'react-pageflip';
import { BookOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Maximize2, X } from 'lucide-react';

interface BookPreviewProps {
  bookId: Id<"books">;
}

const Page = React.forwardRef<HTMLDivElement, { imageUrl: string }>(
  ({ imageUrl }, ref) => (
    <div ref={ref} className="bg-white">
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  )
);

const BookPreview: React.FC<BookPreviewProps> = ({ bookId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [fullscreenSize, setFullscreenSize] = useState({ width: 0, height: 0 });
  const flipBookRef = useRef<any>(null);
  const fullscreenFlipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const previewPages = useQuery(
    api.books.getPreviewPages,
    isExpanded ? { bookId } : "skip"
  );

  // Observe inline container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isExpanded]);

  // Calculate fullscreen dimensions
  useEffect(() => {
    if (!isFullscreen) return;
    const updateSize = () => {
      setFullscreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);

  // Escape key to close fullscreen + prevent body scroll
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (previewPages) {
      setTotalPages(previewPages.length);
    }
  }, [previewPages]);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const goToPrev = (ref: React.RefObject<any>) => {
    ref.current?.pageFlip()?.flipPrev();
  };

  const goToNext = (ref: React.RefObject<any>) => {
    ref.current?.pageFlip()?.flipNext();
  };

  // Don't render if no preview pages exist
  if (previewPages !== undefined && previewPages.length === 0) {
    return null;
  }

  const pageWidth = Math.min(containerWidth > 0 ? Math.floor(containerWidth / 2) - 4 : 300, 500);
  const pageHeight = Math.floor(pageWidth * 1.414);

  // Fullscreen dimensions — constrained by BOTH height and width
  const fsPortrait = fullscreenSize.width < 768;
  const maxFromHeight = Math.floor(fullscreenSize.height * 0.55);
  const maxSpreadWidth = fullscreenSize.width * 0.85;
  const maxFromWidth = Math.floor((maxSpreadWidth / 2) * 1.414);
  const fsPageHeight = Math.min(maxFromHeight, maxFromWidth);
  const fsPageWidth = Math.floor(fsPageHeight / 1.414);

  const validPages = previewPages?.filter((p) => p.imageUrl) ?? [];

  return (
    <>
      {/* Inline Preview Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-sm overflow-hidden">
        {/* Toggle Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-widest">
            <BookOpen size={16} />
            Предпросмотр книги
          </div>
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </button>

        {/* Inline Preview Content */}
        {isExpanded && (
          <div ref={containerRef} className="px-4 pb-6 bg-white">
            {previewPages === undefined ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                Загрузка...
              </div>
            ) : validPages.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                Предпросмотр недоступен
              </div>
            ) : (
              <>
                {/* Page Flip Viewer */}
                <div
                  className="flex justify-center"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ userSelect: 'none' }}
                >
                  {containerWidth > 0 && (
                    <HTMLFlipBook
                      ref={flipBookRef}
                      width={pageWidth}
                      height={pageHeight}
                      size="stretch"
                      minWidth={200}
                      maxWidth={500}
                      minHeight={283}
                      maxHeight={710}
                      showCover={true}
                      usePortrait={containerWidth < 600}
                      drawShadow={true}
                      flippingTime={600}
                      maxShadowOpacity={0.3}
                      mobileScrollSupport={true}
                      useMouseEvents={true}
                      clickEventForward={false}
                      showPageCorners={true}
                      disableFlipByClick={false}
                      swipeDistance={30}
                      startZIndex={0}
                      autoSize={true}
                      startPage={0}
                      className=""
                      style={{}}
                      onFlip={onFlip}
                    >
                      {validPages.map((page) => (
                        <Page key={page._id} imageUrl={page.imageUrl!} />
                      ))}
                    </HTMLFlipBook>
                  )}
                </div>

                {/* Navigation + Fullscreen button */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <button
                    onClick={() => goToPrev(flipBookRef)}
                    disabled={currentPage === 0}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-xs text-gray-400 font-medium tabular-nums">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToNext(flipBookRef)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Развернуть"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && validPages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onContextMenu={(e) => e.preventDefault()}
          style={{ userSelect: 'none' }}
        >
          {/* Top bar — always visible */}
          <div className="w-full flex items-center justify-between px-6 py-4 flex-shrink-0 z-10 relative">
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest">
              Фрагмент книги (предпросмотр)
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-bold"
            >
              Закрыть <X size={20} />
            </button>
          </div>

          {/* Fullscreen Page Flip */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0">
            {fullscreenSize.width > 0 && (
              <HTMLFlipBook
                ref={fullscreenFlipBookRef}
                width={fsPageWidth}
                height={fsPageHeight}
                size="stretch"
                minWidth={250}
                maxWidth={700}
                minHeight={354}
                maxHeight={1000}
                showCover={true}
                usePortrait={fsPortrait}
                drawShadow={true}
                flippingTime={600}
                maxShadowOpacity={0.4}
                mobileScrollSupport={true}
                useMouseEvents={true}
                clickEventForward={false}
                showPageCorners={true}
                disableFlipByClick={false}
                swipeDistance={30}
                startZIndex={10}
                autoSize={true}
                startPage={currentPage}
                className=""
                style={{}}
                onFlip={onFlip}
              >
                {validPages.map((page) => (
                  <Page key={`fs-${page._id}`} imageUrl={page.imageUrl!} />
                ))}
              </HTMLFlipBook>
            )}
          </div>

          {/* Fullscreen Navigation + Hints */}
          <div className="flex flex-col items-center pb-6 flex-shrink-0">
            <div className="flex items-center justify-center gap-8 py-3">
              <button
                onClick={() => goToPrev(fullscreenFlipBookRef)}
                disabled={currentPage === 0}
                className="p-3 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={28} />
              </button>
              <span className="text-sm text-white/60 font-medium tabular-nums">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => goToNext(fullscreenFlipBookRef)}
                disabled={currentPage >= totalPages - 1}
                className="p-3 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            </div>
            <p className="text-white/40 text-xs">
              Листайте страницы стрелками &middot; Нажмите &laquo;Закрыть&raquo; или клавишу Esc для выхода
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default BookPreview;
