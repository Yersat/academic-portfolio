import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import HTMLFlipBook from 'react-pageflip';
import { BookOpen, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const previewPages = useQuery(
    api.books.getPreviewPages,
    isExpanded ? { bookId } : "skip"
  );

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

  useEffect(() => {
    if (previewPages) {
      setTotalPages(previewPages.length);
    }
  }, [previewPages]);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data);
  }, []);

  const goToPrev = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const goToNext = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  // Don't render if no preview pages exist
  if (previewPages !== undefined && previewPages.length === 0) {
    return null;
  }
  // Don't render section while we haven't checked yet (collapsed state)
  if (!isExpanded && previewPages === undefined) {
    // Show the toggle button anyway — it will check on expand
  }

  const pageWidth = Math.min(containerWidth > 0 ? Math.floor(containerWidth / 2) - 4 : 300, 400);
  const pageHeight = Math.floor(pageWidth * 1.414); // A4 aspect ratio

  const validPages = previewPages?.filter((p) => p.imageUrl) ?? [];

  return (
    <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <BookOpen size={14} />
          Фрагмент книги (предпросмотр)
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {/* Preview Content */}
      {isExpanded && (
        <div ref={containerRef} className="px-4 pb-6">
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
                    maxWidth={400}
                    minHeight={283}
                    maxHeight={566}
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

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <button
                  onClick={goToPrev}
                  disabled={currentPage === 0}
                  className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs text-gray-400 font-medium tabular-nums">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={goToNext}
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookPreview;
