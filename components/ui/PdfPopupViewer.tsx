
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import styles from './PdfPopupViewer.module.css';

// Set the workerSrc for pdfjs (Vite compatible)

// pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPopupViewerProps {
    fileUrl: string;
    open: boolean;
    onClose: () => void;
}

export const PdfPopupViewer: React.FC<PdfPopupViewerProps> = ({ fileUrl, open, onClose }) => {
    const [numPages, setNumPages] = React.useState<number | null>(null);
    const [pageNumber, setPageNumber] = React.useState(1);

    if (!open) return null;

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    return (
        <div className={styles.pdfPopupOverlay}>
            <div className={styles.pdfPopupContainer}>
                <div className={styles.pdfPopupHeader}>
                    <button onClick={onClose} className={styles.pdfPopupClose}>Tutup</button>
                </div>
                <div className={styles.pdfPopupContent}>
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div>Loading PDF...</div>}
                        error={<div>Gagal memuat PDF</div>}
                    >
                        <Page pageNumber={pageNumber} width={700} />
                    </Document>
                    <div className={styles.pdfPopupNav}>
                        <button className={styles.pdfPopupNavBtn} onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>Prev</button>
                        <span>Page {pageNumber} of {numPages}</span>
                        <button className={styles.pdfPopupNavBtn} onClick={() => setPageNumber(p => (numPages ? Math.min(numPages, p + 1) : p + 1))} disabled={numPages ? pageNumber >= numPages : true}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
