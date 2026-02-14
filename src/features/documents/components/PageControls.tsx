import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { setZoomLevel, setCurrentPage, rotate } from '../store/documentsSlice';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';

export const PageControls: React.FC<{ totalPages: number }> = ({ totalPages }) => {
    const dispatch = useAppDispatch();
    const { currentPage, zoomLevel } = useAppSelector((state) => state.documents);

    const handleZoomIn = () => dispatch(setZoomLevel(Math.min(zoomLevel + 0.1, 2.0)));
    const handleZoomOut = () => dispatch(setZoomLevel(Math.max(zoomLevel - 0.1, 0.5)));
    const handleReset = () => dispatch(setZoomLevel(1.0));
    const handleRotate = () => dispatch(rotate());

    const handlePrevPage = () => dispatch(setCurrentPage(Math.max(currentPage - 1, 1)));
    const handleNextPage = () => dispatch(setCurrentPage(Math.min(currentPage + 1, totalPages)));

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 transition-all hover:bg-white">
            <div className="flex items-center gap-2 border-r pr-6">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleRotate}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-slate-500 hover:text-primary"
                    title="Rotate 90°"
                >
                    <RotateCw className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5" />
                </button>
                <button
                    onClick={handleReset}
                    className="text-xs font-bold w-12 hover:text-primary transition-colors"
                >
                    {Math.round(zoomLevel * 100)}%
                </button>
                <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>
                <button
                    onClick={handleReset}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors opacity-40 hover:opacity-100"
                    title="Reset Zoom"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
