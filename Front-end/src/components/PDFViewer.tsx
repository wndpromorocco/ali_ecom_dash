import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

type PdfViewport = { width: number; height: number };
type PdfPage = {
  getViewport: (params: { scale: number }) => PdfViewport;
  render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => { promise: Promise<void> };
};
type PdfDocument = { numPages: number; getPage: (num: number) => Promise<PdfPage> };
type PdfJsLibLike = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: string | { url: string; disableWorker?: boolean }) => { promise: Promise<PdfDocument> };
};

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, isOpen, onClose, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensurePdfjs = useCallback(async (): Promise<PdfJsLibLike | null> => {
    let lib = (window as unknown as { pdfjsLib?: PdfJsLibLike }).pdfjsLib;
    if (!lib) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load PDF.js script'));
        document.head.appendChild(s);
      });
      lib = (window as unknown as { pdfjsLib?: PdfJsLibLike }).pdfjsLib || null;
    }
    return lib || null;
  }, []);

  const loadPDF = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pdfjsLib = await ensurePdfjs();
      if (!pdfjsLib) {
        setError('Erreur lors du chargement du PDF');
        return;
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
      try {
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch {
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, disableWorker: true }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Erreur lors du chargement du PDF');
    } finally {
      setLoading(false);
    }
  }, [pdfUrl, ensurePdfjs]);

  useEffect(() => {
    if (isOpen) {
      loadPDF();
    }
  }, [isOpen, loadPDF]);

  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Erreur lors du rendu de la page');
        return;
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Erreur lors du rendu de la page');
    }
  }, [pdfDoc, scale]);

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title || 'Document PDF'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-600 min-w-[100px] text-center">
              {loading ? (
                'Chargement...'
              ) : (
                `${currentPage} / ${totalPages}`
              )}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              aria-label="Zoom arrière"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              aria-label="Zoom avant"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={downloadPDF}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              aria-label="Télécharger"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadPDF}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement du PDF...</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="shadow-lg border border-gray-300 bg-white"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
