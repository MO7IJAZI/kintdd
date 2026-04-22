"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Share2,
  BookOpen,
  Loader2,
  X,
} from "lucide-react";
import HTMLFlipBook from "react-pageflip";

type PDFPageProxy = {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    canvas: HTMLCanvasElement | null;
  }) => { promise: Promise<void> };
};

type PDFDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  getOutline: () => Promise<PdfOutlineEntry[] | null>;
  getDestination: (dest: string) => Promise<unknown[] | null>;
  getPageIndex: (ref: { num: number; gen: number }) => Promise<number>;
};

type PdfLoadingTask = {
  promise: Promise<PDFDocumentProxy>;
  destroy: () => void;
};

type PdfJsLib = {
  getDocument: (source: { data: Uint8Array; disableWorker?: boolean }) => PdfLoadingTask;
  GlobalWorkerOptions: { workerSrc: string };
  version?: string;
};

type OutlineNode = {
  id: string;
  title: string;
  page: number | null;
  children: OutlineNode[];
};

type CatalogPdfViewerTexts = {
  share: string;
  download: string;
  fullscreen: string;
  exitFullscreen: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  singlePage: string;
  spreadMode: string;
  zoomIn: string;
  zoomOut: string;
  page: string;
  of: string;
  thumbnails: string;
  outline: string;
  loading: string;
  noOutline: string;
  openSidebar: string;
  closeSidebar: string;
};

type PdfCatalogViewerProps = {
  source: string;
  title?: string;
  texts: CatalogPdfViewerTexts;
  direction?: "ltr" | "rtl";
  initialViewMode?: "single" | "spread";
};

type PdfOutlineEntry = {
  title: string;
  dest: string | unknown[] | null;
  items?: PdfOutlineEntry[];
};

const PAGE_SCALE_MULTIPLIER = 2.5; // Higher value = better quality but more memory
const CONTAINER_HEIGHT_RATIO = 1.0; // Fill as much vertical space as possible
const CONTAINER_WIDTH_RATIO = 1.0; // Fill as much horizontal space as possible

async function renderPageToCanvas(page: PDFPageProxy, canvas: HTMLCanvasElement, targetWidth: number) {
  // Get unscaled viewport to determine scale needed
  const unscaledViewport = page.getViewport({ scale: 1 });
  
  // Calculate scale to match target width (which is the book page width)
  const scale = targetWidth / unscaledViewport.width;
  
  // Use device pixel ratio for high quality rendering
  const outputScale = (window.devicePixelRatio || 1) * PAGE_SCALE_MULTIPLIER;
  
  // Get final viewport with high resolution
  const viewport = page.getViewport({ scale: scale * outputScale });
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // Important: Force CSS to fill parent container (which has correct dimensions)
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.objectFit = "contain";
  
  const context = canvas.getContext("2d");
  if (!context) return;
  
  // No need for setTransform as we are rendering at full pixel resolution
  await page.render({ 
    canvasContext: context, viewport,
    canvas: null
  }).promise;
}

export default function PdfCatalogViewer({ source, title, texts, direction = "ltr", initialViewMode = "spread" }: PdfCatalogViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flipRef = useRef<any>(null);
  const pageCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTaskRefs = useRef<Map<number, any>>(new Map()); // Store active render tasks
  const [pdfLib, setPdfLib] = useState<PdfJsLib | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for flipbook
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"single" | "spread">(initialViewMode);
  const [showControls, setShowControls] = useState(true);
  const [useNativeViewer, setUseNativeViewer] = useState(false);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 600 });
  const [pageAspectRatio, setPageAspectRatio] = useState(0.707); // Default A4 aspect ratio
  const [isCoverOpen, setIsCoverOpen] = useState(false); // Track if cover has been flipped
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false); // Track opening animation
  const [isLastPage, setIsLastPage] = useState(false); // Track if we're on last page

  const addDiagnostic = useCallback((message: string) => {
    setDiagnostics((prev) => (prev.includes(message) ? prev : [...prev, message]));
  }, []);

  // Pages array for rendering
  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  // flipIndex and pageNumber mapping — always 1:1 (scaleX handles RTL visually)
  const flipIndexToPage = useCallback((flipIndex: number) => flipIndex + 1, []);
  const pageToFlipIndex = useCallback((pageNumber: number) => pageNumber - 1, []);

  // Pages always in natural order (1..N).
  // RTL flip direction is handled by scaleX(-1) on the flipbook wrapper.
  const orderedPages = useMemo(() => pages, [pages]);

  // Display page is 1-based index for UI
  const displayPage = currentPage + 1;
  const canGoPrev = numPages > 0 && currentPage > 0;
  const canGoNext = numPages > 0 && currentPage < numPages - 1;

  // Calculate book dimensions based on container size and page aspect ratio
  useEffect(() => {
    if (!containerRef.current || numPages === 0) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Calculate available space (accounting for padding/controls if needed)
      // We want to leave some space for the bottom toolbar and arrows
      const availableWidth = clientWidth; 
      const availableHeight = clientHeight;

      // Use defined ratio to provide more breathing room around the book
      let newHeight = availableHeight * CONTAINER_HEIGHT_RATIO; 
      let newWidth = newHeight * pageAspectRatio;

      // Check if width fits (spread mode = 2 pages)
      if (viewMode === "spread") {
        // If width is too wide, scale down based on width
        if (newWidth * 2 > availableWidth * CONTAINER_WIDTH_RATIO) {
          newWidth = (availableWidth * CONTAINER_WIDTH_RATIO) / 2;
          newHeight = newWidth / pageAspectRatio;
        }
      } else {
        if (newWidth > availableWidth * CONTAINER_WIDTH_RATIO) {
          newWidth = availableWidth * CONTAINER_WIDTH_RATIO;
          newHeight = newWidth / pageAspectRatio;
        }
      }

      setBookDimensions({
        width: Math.floor(newWidth),
        height: Math.floor(newHeight),
      });
    };

    updateDimensions();
    
    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [pageAspectRatio, viewMode, numPages]);

  // Mobile responsiveness check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("single");
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    import("pdfjs-dist/webpack.mjs")
      .then((module) => {
        if (!active) return;
        const lib = module as unknown as PdfJsLib;
        lib.GlobalWorkerOptions.workerSrc = "";
        setPdfLib(lib);
      })
      .catch((error: unknown) => {
        if (!active) return;
        addDiagnostic(`PDF engine import failed: ${error instanceof Error ? error.message : String(error)}`);
        setHasError(true);
        setUseNativeViewer(true);
        setIsLoadingDoc(false);
      });
    return () => {
      active = false;
    };
  }, [addDiagnostic]);

  useEffect(() => {
    if (!pdfLib) return;
    let cancelled = false;
    let task: PdfLoadingTask | null = null;
    setIsLoadingDoc(true);
    setHasError(false);
    setLoadProgress(0);
    setDiagnostics([]);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(0);
    setIsLastPage(false);

    const load = async () => {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        let bytes: Uint8Array;
        const contentLengthHeader = response.headers.get("content-length");
        const total = contentLengthHeader ? Number(contentLengthHeader) : 0;

        if (response.body && total > 0) {
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let loaded = 0;
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            if (chunk.value) {
              chunks.push(chunk.value);
              loaded += chunk.value.length;
              if (!cancelled) {
                const percentage = Math.min(99, Math.max(0, Math.round((loaded / total) * 100)));
                setLoadProgress(percentage);
              }
            }
          }
          const merged = new Uint8Array(loaded);
          let offset = 0;
          for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          bytes = merged;
        } else {
          const arrayBuffer = await response.arrayBuffer();
          bytes = new Uint8Array(arrayBuffer);
        }

        task = pdfLib.getDocument({ data: bytes, disableWorker: true });
        const doc = await task.promise;
        if (cancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages || 0);
        setLoadProgress(100);
        setIsLoadingDoc(false);

        if (!doc.numPages) {
          addDiagnostic("PDF loaded but contains 0 pages.");
        } else {
           // Get aspect ratio from first page
           try {
             const firstPage = await doc.getPage(1);
             const viewport = firstPage.getViewport({ scale: 1 });
             if (viewport.width && viewport.height) {
               setPageAspectRatio(viewport.width / viewport.height);
             }
           } catch (e) {
             console.error("Could not determine aspect ratio", e);
           }
        }
      } catch (error: unknown) {
        if (cancelled) return;
        addDiagnostic(`Document load failed: ${error instanceof Error ? error.message : String(error)}`);
        setHasError(true);
        setIsLoadingDoc(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (task) task.destroy();
    };
  }, [pdfLib, source, addDiagnostic]);

  useEffect(() => {
    if (!pdfDoc || !numPages) return;
    let cancelled = false;
    
    const renderPageSafe = async (pageNumber: number, targetWidth: number) => {
        const canvas = pageCanvasRefs.current.get(pageNumber);
        if (!canvas) return;

        // Cancel previous render task if exists
        if (renderTaskRefs.current.has(pageNumber)) {
            try {
                renderTaskRefs.current.get(pageNumber).cancel();
            } catch (e) {
                // Ignore cancel errors
            }
            renderTaskRefs.current.delete(pageNumber);
        }

        try {
            const page = await pdfDoc.getPage(pageNumber);
            
            // Re-check canvas existence after await
            const currentCanvas = pageCanvasRefs.current.get(pageNumber);
            if (!currentCanvas) return;

            const unscaledViewport = page.getViewport({ scale: 1 });
            const scale = targetWidth / unscaledViewport.width;
            
            // Use device pixel ratio for high quality rendering
            const outputScale = (window.devicePixelRatio || 1) * PAGE_SCALE_MULTIPLIER;
            
            const viewport = page.getViewport({ scale: scale * outputScale });

            currentCanvas.width = viewport.width;
            currentCanvas.height = viewport.height;
            currentCanvas.style.width = "100%";
            currentCanvas.style.height = "100%";
            currentCanvas.style.objectFit = "contain";

            const context = currentCanvas.getContext("2d");
            if (!context) return;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: null
            };

            const renderTask = page.render(renderContext);
            renderTaskRefs.current.set(pageNumber, renderTask);

            await renderTask.promise;
            
            // Cleanup on success
            if (renderTaskRefs.current.get(pageNumber) === renderTask) {
                renderTaskRefs.current.delete(pageNumber);
            }
        } catch (e: any) {
            if (e?.name !== 'RenderingCancelledException') {
                console.error(`Error rendering page ${pageNumber}`, e);
            }
        }
    };

    // Render only visible pages + buffer
    const renderPages = async () => {
      // Determine visible range based on current page
      // Buffer: +/- 2 pages
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(numPages, currentPage + 4);

      // Force render page 1 immediately if we are at start
      if (currentPage === 0) {
         await renderPageSafe(1, bookDimensions.width);
      }

      for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        if (cancelled) return;
        if (pageNumber === 1 && currentPage === 0) continue; // Already handled
        
        await renderPageSafe(pageNumber, bookDimensions.width);
      }
    };
    
    renderPages();
    
    // Capture the current value of renderTaskRefs.current once at the start of the effect
    const cleanupRenderTaskRefs = renderTaskRefs.current;

    return () => {
      cancelled = true;
      // Cancel all ongoing renders on unmount/update
      cleanupRenderTaskRefs.forEach(task => {
          try { task.cancel(); } catch(e) {}
      });
      cleanupRenderTaskRefs.clear();
    };
  }, [pdfDoc, numPages, zoom, currentPage, bookDimensions]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const goToPage = useCallback((pageNumber: number) => {
    if (!numPages) return;
    const clampedPage = Math.max(1, Math.min(numPages, pageNumber));
    setCurrentPage(clampedPage - 1);
    if (viewMode === "spread" && flipRef.current) {
      const flipIndex = pageToFlipIndex(clampedPage);
      flipRef.current.pageFlip().turnToPage(flipIndex);
    }
  }, [numPages, viewMode, pageToFlipIndex]);

  const goPrev = useCallback(() => {
    // scaleX(-1) already mirrors the visual direction for RTL.
    // flipPrev always moves toward page 1 visually in both directions.
    if (viewMode === "spread" && flipRef.current) {
      flipRef.current.pageFlip().flipPrev();
    } else {
      goToPage(displayPage - 1);
    }
  }, [goToPage, displayPage, viewMode]);

  const goNext = useCallback(() => {
    // scaleX(-1) already mirrors the visual direction for RTL.
    // flipNext always moves toward last page visually in both directions.
    if (viewMode === "spread" && flipRef.current) {
      flipRef.current.pageFlip().flipNext();
    } else {
      goToPage(displayPage + 1);
    }
  }, [goToPage, displayPage, viewMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // scaleX(-1) mirrors visuals for RTL, so arrow keys work naturally.
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  const onShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: title || "Catalog", url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    // Could add toast here
  };

  // Toggle controls visibility on interaction
  const toggleControls = () => setShowControls(!showControls);

  return (
    <div 
      ref={containerRef} 
      // Force LTR to prevent PDF content mirroring in RTL mode
      // Navigation logic handles direction via props
      dir="ltr"
      className={`relative flex h-[88vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-300 bg-[#BFC1C2] shadow-inner transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-50 h-screen rounded-none" : ""}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading Overlay */}
      {isLoadingDoc && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#BFC1C2] text-white">
          <Loader2 className="h-12 w-12 animate-spin text-white/40" />
          <div className="mt-4 text-lg font-medium">{texts.loading} {loadProgress}%</div>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#737373] text-white">
          <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-400">
            <X size={32} />
          </div>
          <h3 className="text-xl font-bold">Error Loading PDF</h3>
          <p className="mt-2 text-white/80">Please try downloading the file instead.</p>
          <a 
            href={source} 
            download 
            className="mt-6 rounded-lg bg-white/20 px-6 py-2 font-medium text-white transition hover:bg-white/30 shadow-md"
          >
            {texts.download}
          </a>
          <div className="mt-4 max-w-md text-center text-xs text-white/40">
            {diagnostics.map((d, i) => <div key={i}>{d}</div>)}
          </div>
        </div>
      )}

      {/* Main Content Area — Symmetrical margins for all sides */}
      <div className="flex flex-1 items-center justify-center overflow-hidden p-6 md:p-8 lg:p-10">
        {!isLoadingDoc && !hasError && (
          useNativeViewer ? (
            <iframe
              src={`${source}#toolbar=0&navpanes=0&view=FitH`}
              title={title || "PDF Viewer"}
              className="h-full w-full rounded-lg shadow-lg"
            />
          ) : viewMode === "spread" ? (
            /*
             * Outer wrapper: centers content, applies zoom scale.
             * Uses padding to prevent the book from being clipped during the
             * slide-open animation.
             */
            <div
              className="relative flex h-full w-full items-center justify-center"
              style={{ 
                transform: `scale(${zoom})`, 
                transformOrigin: 'center center',
                perspective: '2000px' // Add perspective for better 3D effect
              }}
            >
              <div
                style={{
                  transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: (!isCoverOpen && !isAnimatingOpen && !isLastPage)
                    ? (direction === 'rtl' ? 'translateX(25%)' : 'translateX(-25%)')
                    : 'translateX(0%)',
                  willChange: 'transform',
                  transformStyle: 'preserve-3d', // Ensure 3D rendering for children
                }}
              >
                {/*
                 * RTL mirror: scaleX(-1) on the flipbook makes it open left-to-right.
                 * We use a dedicated wrapper with dir="ltr" to avoid coordinate confusion.
                 */}
                <div 
                  dir="ltr"
                  style={direction === 'rtl' ? { 
                    transform: 'scaleX(-1)',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden'
                  } : { 
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden'
                  }}
                  onMouseDown={(e) => {
                    if (direction !== 'rtl' || !flipRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const width = rect.width;
                    
                    // In RTL (mirrored), the library's "Next" edge is logically on the right
                    // but visually on the left.
                    // If the user clicks the visual left edge, we manually trigger the flip
                    // to bypass the library's LTR-fixed corner hitzones.
                    if (x < width * 0.2) {
                      flipRef.current.pageFlip().flipNext();
                    } else if (x > width * 0.8) {
                      flipRef.current.pageFlip().flipPrev();
                    }
                  }}
                >
                <HTMLFlipBook
                  ref={flipRef}
                  width={bookDimensions.width}
                  height={bookDimensions.height}
                  size="fixed"
                  minWidth={200}
                  maxWidth={1200}
                  minHeight={300}
                  maxHeight={1600}
                  maxShadowOpacity={0.5}
                  drawShadow={true}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={(e: any) => {
                    const flipIndex = e.data;
                    // Convert flipbook index to 0-based page index for UI
                    const pdfPage = flipIndexToPage(flipIndex);
                    setCurrentPage(pdfPage - 1);
                    
                    // Check if we are on last page
                    setIsLastPage(flipIndex >= numPages - 1);
                    
                    if (!isCoverOpen && flipIndex > 0) {
                      setIsAnimatingOpen(true);
                      setTimeout(() => {
                        setIsCoverOpen(true);
                        setIsAnimatingOpen(false);
                      }, 700);
                    } else if (isCoverOpen && flipIndex === 0) {
                      setIsAnimatingOpen(true);
                      setTimeout(() => {
                        setIsCoverOpen(false);
                        setIsAnimatingOpen(false);
                      }, 700);
                    }
                  }}
                  className="shadow-2xl"
                  style={{ 
                    margin: '0 auto',
                    backgroundColor: 'transparent'
                  }}
                  startPage={0}
                  flippingTime={800}
                  usePortrait={false}
                  startZIndex={0}
                  autoSize={false}
                  clickEventForward={true}
                  useMouseEvents={true}
                  swipeDistance={30}
                  showPageCorners={direction !== 'rtl'} // Disable for RTL to avoid visual artifacts
                  disableFlipByClick={false}
                >
                  {/* Cover Page — always orderedPages[0] (respects RTL reversal) */}
                  {orderedPages.length > 0 && (() => {
                    const coverPageNumber = orderedPages[0];
                    return (
                      <div className="bg-transparent" style={{ width: bookDimensions.width, height: bookDimensions.height, transformStyle: 'preserve-3d' }}>
                        <div
                          className="relative h-full w-full overflow-hidden flex items-center justify-center"
                          style={direction === 'rtl' ? { 
                            transform: 'scaleX(-1)',
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                          } : { 
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <canvas
                            ref={(el) => {
                              if (el) pageCanvasRefs.current.set(coverPageNumber, el);
                              else pageCanvasRefs.current.delete(coverPageNumber);
                            }}
                            className="h-full w-full object-contain bg-white shadow-lg rounded-r-sm"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inner Pages — ordered per direction */}
                  {orderedPages.slice(1).map((pageNumber) => (
                    <div key={pageNumber} className="bg-white shadow-inner" style={{ width: bookDimensions.width, height: bookDimensions.height, transformStyle: 'preserve-3d' }}>
                      <div
                        className="relative h-full w-full overflow-hidden"
                        style={direction === 'rtl' ? { 
                          transform: 'scaleX(-1)',
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden'
                        } : { 
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        <canvas
                          ref={(el) => {
                            if (el) pageCanvasRefs.current.set(pageNumber, el);
                            else pageCanvasRefs.current.delete(pageNumber);
                          }}
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 opacity-50">
                          {pageNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </HTMLFlipBook>
                </div>{/* end RTL mirror wrapper */}
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
              <div
                style={{
                  width: `${bookDimensions.width * zoom}px`,
                  height: `${bookDimensions.height * zoom}px`,
                  transition: "width 0.3s, height 0.3s",
                }}
                className="flex items-center justify-center"
              >
                <canvas
                  ref={(el) => {
                    if (el) {
                      pageCanvasRefs.current.set(displayPage, el);
                    } else {
                      pageCanvasRefs.current.delete(displayPage);
                    }
                  }}
                  className="h-full w-full rounded shadow-lg object-contain bg-white"
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* Floating Navigation Arrows (Desktop) */}
      {!isLoadingDoc && !hasError && (
        <>
          {/* Left arrow - switch behavior for RTL */}
          <button 
            onClick={direction === "rtl" ? goNext : goPrev} 
            disabled={direction === "rtl" ? !canGoNext : !canGoPrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/40 disabled:opacity-0 ${showControls ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronLeft size={32} />
          </button>
          
          {/* Right arrow - switch behavior for RTL */}
          <button 
            onClick={direction === "rtl" ? goPrev : goNext} 
            disabled={direction === "rtl" ? !canGoPrev : !canGoNext}
            className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/40 disabled:opacity-0 ${showControls ? "opacity-100" : "opacity-0"}`}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Bottom Toolbar */}
      <div 
        className={`absolute bottom-6 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-300 pointer-events-none ${showControls ? "translate-y-0" : "translate-y-20"}`}
      >
        <div className="pointer-events-auto flex items-center gap-8 rounded-1xl border border-white/10 bg-[#1e293b]/80 px-6 py-3 text-white shadow-2xl backdrop-blur-xl transition-all hover:bg-[#1e293b]/95">
          {/* Zoom Controls */}
          <div className="flex items-center gap-3 border-r border-white/10 pr-4">
            <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
              <Minus size={20} />
            </button>
            <span className="min-w-[3.5rem] text-center text-sm font-medium text-slate-200">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2.0, z + 0.2))} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
              <Plus size={20} />
            </button>
          </div>

          {/* Page Info */}
          <div className="hidden items-center gap-3 border-r border-white/10 pr-4 sm:flex">
             <span className="text-base font-medium text-slate-200 whitespace-nowrap">
              {texts.page} <span className="text-white mx-1">{displayPage}</span> {texts.of} <span className="text-white mx-1">{numPages}</span>
             </span>
          </div>

          {/* View Mode & Fullscreen */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === "spread" ? "single" : "spread")} 
              className={`rounded-lg p-2 transition hover:bg-white/10 ${viewMode === "spread" ? "text-blue-400" : "text-slate-300"}`}
              title={viewMode === "spread" ? texts.singlePage : texts.spreadMode}
            >
              <BookOpen size={22} />
            </button>
            <button 
              onClick={toggleFullscreen} 
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              title={isFullscreen ? texts.exitFullscreen : texts.fullscreen}
            >
              {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <button onClick={onShare} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" title={texts.share}>
              <Share2 size={22} />
            </button>
            <a href={source} download className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white" title={texts.download}>
              <Download size={22} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}