import React from 'react';
// @ts-ignore - resolve type mismatches in the environment
import { List } from 'react-window';
import { Document, Page } from 'react-pdf';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { setCurrentPage } from '../store/documentsSlice';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Download, Share2, Info, Trash2, RefreshCcw } from 'lucide-react';
import { useRole } from '../../../hooks/useRole';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ThumbnailSidebarProps {
    url: string;
    documentName?: string;
    onRefresh?: () => Promise<void>;
    onDelete?: () => Promise<void>;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
    url,
    documentName = "Document",
    onRefresh,
    onDelete
}) => {
    const [actualPages, setActualPages] = React.useState<number | null>(null);
    const dispatch = useAppDispatch();
    const { isAdmin } = useRole();
    const { currentPage } = useAppSelector((state) => state.documents);
    const safeTotalPages = Math.max(1, actualPages ?? 1);

    React.useEffect(() => {
        setActualPages(null);
    }, [url]);

    React.useEffect(() => {
        if (actualPages && currentPage > actualPages) {
            dispatch(setCurrentPage(actualPages));
        }
    }, [actualPages, currentPage, dispatch]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName;
        link.click();

        // Visual feedback
        const btn = document.activeElement as HTMLButtonElement;
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            setTimeout(() => { btn.innerHTML = originalHTML; }, 1500);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            const btn = document.activeElement as HTMLButtonElement;
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                setTimeout(() => { btn.innerHTML = originalHTML; }, 1500);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy link to clipboard');
        }
    };

    const handleRefresh = async () => {
        await onRefresh?.();
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${documentName}"?\n\nThis action cannot be undone.`)) {
            await onDelete?.();
        }
    };

    const Row = ({ index, style, ariaAttributes }: any) => {
        const pageNum = index + 1;
        const safePageNum = Math.min(pageNum, Math.max(1, actualPages ?? 1));
        const isActive = currentPage === safePageNum;

        return (
            <div style={style} {...ariaAttributes} className="px-5 py-2">
                <div
                    onClick={() => dispatch(setCurrentPage(safePageNum))}
                    className={cn(
                        "cursor-pointer group relative bg-white border-2 rounded-xl transition-all duration-300 hover:border-primary/50 overflow-hidden shadow-sm",
                        isActive ? "border-primary ring-4 ring-primary/10" : "border-slate-100"
                    )}
                >
                    <div className="scale-[0.85] origin-top">
                        <Document file={url}>
                            <Page
                                pageNumber={safePageNum}
                                width={140}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                    </div>
                    <div className={cn(
                        "absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-primary text-[10px]",
                        isActive && "opacity-100 bg-primary/5"
                    )}>
                        PAGE {safePageNum}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-56 bg-slate-50 border-r h-full flex flex-col flex-shrink-0">
            <div className="p-6 border-b bg-white/50 backdrop-blur-sm">
                <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-tight mb-4 truncate" title={documentName}>
                    {documentName}
                </h2>

                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/30 transition-all text-slate-600 hover:text-primary group shadow-sm"
                        title="Download PDF"
                    >
                        <Download size={14} className="group-active:scale-90 transition-transform" />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/30 transition-all text-slate-600 hover:text-primary group shadow-sm"
                        title="Copy Link"
                    >
                        <Share2 size={14} className="group-active:scale-90 transition-transform" />
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary/30 transition-all text-slate-600 hover:text-primary group shadow-sm"
                        title="Refresh Page"
                    >
                        <RefreshCcw size={14} className="group-active:rotate-180 transition-transform duration-500" />
                    </button>
                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            className="p-2 bg-white border border-destructive/10 rounded-lg hover:bg-destructive/5 hover:border-destructive/30 transition-all text-destructive group shadow-sm"
                            title="Delete Document"
                        >
                            <Trash2 size={14} className="group-active:scale-90 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 border-b bg-slate-100/30 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thumbnails</h3>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">{safeTotalPages} PAGES</span>
            </div>

            <div className="flex-1 overflow-hidden">
                <List
                    rowCount={safeTotalPages}
                    rowHeight={220}
                    rowComponent={Row}
                    rowProps={{}}
                    style={{ height: '100%', width: '100%' }}
                />
            </div>

            <div className="p-4 border-t bg-white mt-auto">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Info size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">Status</p>
                        <p className="text-[9px] font-medium text-emerald-600 mt-1 uppercase">Ready for Review</p>
                    </div>
                </div>
            </div>

            <div className="hidden">
                <Document
                    file={url}
                    onLoadSuccess={({ numPages }) => setActualPages(numPages)}
                    onLoadError={() => setActualPages(1)}
                />
            </div>
        </div>
    );
};
