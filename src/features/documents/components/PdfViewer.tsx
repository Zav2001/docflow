import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { AnnotationLayer } from '../../annotations/components/AnnotationLayer';
import { motion } from 'framer-motion';
import type { AnnotationTool, HighlightColor } from '../../annotations/components/AnnotationToolbar';
import type { Annotation } from '../../../types';
import { setCurrentPage } from '../store/documentsSlice';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfViewerProps {
    url: string;
    activeTool?: AnnotationTool;
    highlightColor?: HighlightColor;
    onAnnotationClick?: (annotation: Annotation) => void;
    onTotalPagesChange?: (totalPages: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
    url,
    activeTool = 'select',
    highlightColor = 'yellow',
    onAnnotationClick,
    onTotalPagesChange
}) => {
    const dispatch = useAppDispatch();
    const { currentPage, zoomLevel, selectedDocumentId, rotation } = useAppSelector((state) => state.documents);
    const [numPages, setNumPages] = useState<number>(0);
    const safePageNumber = numPages > 0 ? Math.min(Math.max(currentPage, 1), numPages) : Math.max(currentPage, 1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        onTotalPagesChange?.(numPages);
        if (currentPage > numPages) {
            dispatch(setCurrentPage(numPages));
        }
    }

    return (
        <div className="flex flex-col items-center bg-transparent p-4 h-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative shadow-2xl rounded-lg overflow-hidden"
                style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                }}
            >
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="w-[600px] h-[800px] bg-white dark:bg-slate-900 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Loading PDF...</p>
                            </div>
                        </div>
                    }
                    error={
                        <div className="w-[600px] h-[800px] bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                            <div className="text-center p-8">
                                <p className="text-red-600 dark:text-red-400 font-bold mb-2">Failed to load PDF</p>
                                <p className="text-sm text-red-500 dark:text-red-400">Please check the file URL</p>
                            </div>
                        </div>
                    }
                >
                    <div className="relative">
                        <Page
                            pageNumber={safePageNumber}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            className="bg-white dark:bg-slate-900"
                        />

                        {/* Interactive Annotation Layer */}
                        {selectedDocumentId && (
                            <AnnotationLayer
                                documentId={selectedDocumentId}
                                pageNumber={safePageNumber}
                                activeTool={activeTool}
                                highlightColor={highlightColor}
                                onAnnotationClick={onAnnotationClick}
                            />
                        )}
                    </div>
                </Document>
            </motion.div>

            {numPages > 0 && (
                <div className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-bold">
                    Page {safePageNumber} of {numPages}
                </div>
            )}
        </div>
    );
};
