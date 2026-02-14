import React, { Suspense, lazy, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { selectDocument, setCurrentPage, setDocuments } from '../features/documents/store/documentsSlice';
import { setAnnotations, undo, redo } from '../features/annotations/store/annotationsSlice';
import { docApi } from '../api/docApi';
import { userApi } from '../api/userApi';
import { ThumbnailSidebar } from '../features/documents/components/ThumbnailSidebar';
import { PageControls } from '../features/documents/components/PageControls';
import { ExtractedFieldsSidebar } from '../features/extracted-fields/components/ExtractedFieldsSidebar';
import { AnnotationToolbar, type AnnotationTool, type HighlightColor } from '../features/annotations/components/AnnotationToolbar';
import { CommentsPanel } from '../features/comments/components/CommentsPanel';
import { useRole } from '../hooks/useRole';
import { useEffect } from 'react';
import type { Annotation } from '../types';
import { setNotifications } from '../features/notifications/store/notificationsSlice';
import { setComments } from '../features/comments/store/commentsSlice';

const PdfViewer = lazy(() => import('../features/documents/components/PdfViewer').then(m => ({ default: m.PdfViewer })));

export const DocumentViewerPage: React.FC = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAdmin } = useRole();

    const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
    const [highlightColor, setHighlightColor] = useState<HighlightColor>('yellow');
    const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
    const [versionCount, setVersionCount] = useState(0);
    const [actualTotalPages, setActualTotalPages] = useState<number | null>(null);

    const selectedDoc = useAppSelector((state) =>
        documentId ? state.documents.entities[documentId] : null
    );

    const canUndo = useAppSelector((state) => state.annotations.history.past.length > 0);
    const canRedo = useAppSelector((state) => state.annotations.history.future.length > 0);

    const { data: fields, isLoading: fieldsLoading } = useQuery({
        queryKey: ['extracted-fields', documentId],
        queryFn: () => docApi.getExtractedFields(documentId!),
        enabled: !!documentId,
    });

    const mutation = useMutation({
        mutationFn: (data: any) => docApi.saveExtractedFields(documentId!, data.fields),
    });

    useEffect(() => {
        if (documentId) {
            dispatch(selectDocument(documentId));
            dispatch(setCurrentPage(1));
        }
    }, [documentId, dispatch]);

    useEffect(() => {
        const loadAnnotations = async () => {
            if (!documentId) {
                dispatch(setAnnotations([]));
                dispatch(setComments([]));
                return;
            }
            const [annotations, comments] = await Promise.all([
                docApi.getAnnotations(documentId),
                docApi.getCommentsByDocument(documentId),
            ]);
            dispatch(setAnnotations(annotations));
            dispatch(setComments(comments));
        };
        loadAnnotations();
    }, [documentId, dispatch]);

    useEffect(() => {
        const loadVersions = async () => {
            if (!documentId) return;
            const versions = await docApi.getDocumentVersions(documentId);
            setVersionCount(versions.length);
        };
        loadVersions();
    }, [documentId, selectedDoc?.status]);

    useEffect(() => {
        setActualTotalPages(null);
    }, [documentId]);

    const handleUndo = () => dispatch(undo());
    const handleRedo = () => dispatch(redo());
    const refreshDocuments = async () => {
        const docs = await docApi.getDocuments();
        dispatch(setDocuments(docs));
        return docs;
    };
    const refreshNotifications = async () => {
        const notifications = await userApi.getNotifications();
        dispatch(setNotifications(notifications));
    };
    const handleRefreshDocument = async () => {
        await refreshDocuments();
    };
    const handleDeleteDocument = async () => {
        if (!documentId) return;
        await docApi.deleteDocument(documentId);
        await Promise.all([refreshDocuments(), refreshNotifications()]);
        navigate('/');
    };
    const handleFinalApproval = async () => {
        if (!selectedDoc) return;
        await docApi.saveDocument({ ...selectedDoc, status: 'APPROVED' });
        await Promise.all([refreshDocuments(), refreshNotifications()]);
    };

    if (!selectedDoc) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">📄</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-bold">Document not found</p>
                </div>
            </div>
        );
    }

    const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

    return (
        <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950">
            <ThumbnailSidebar
                url={selectedDoc.pdfUrl}
                documentName={selectedDoc.name}
                onRefresh={handleRefreshDocument}
                onDelete={handleDeleteDocument}
            />

            <div className="flex-1 relative flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-10 flex items-center justify-between z-10 sticky top-0">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none truncate max-w-[300px]" title={selectedDoc.name}>
                                {selectedDoc.name}
                            </h1>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black rounded uppercase tracking-tighter">v{Math.max(1, versionCount)}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1.5 uppercase tracking-wide">
                            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                            Ref: {selectedDoc.id.toUpperCase()} <span className="mx-1 opacity-50">•</span> Uploaded: {new Date(selectedDoc.uploadDate).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end gap-1">
                            <div className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                selectedDoc.status === 'REVIEWED' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' :
                                    selectedDoc.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400' :
                                        'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                            )}>
                                {selectedDoc.status}
                            </div>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleFinalApproval}
                                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-200 dark:shadow-slate-900 active:scale-95"
                            >
                                Final Approval
                            </button>
                        )}
                    </div>
                </header>

                {/* Annotation Toolbar */}
                <AnnotationToolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    highlightColor={highlightColor}
                    onColorChange={setHighlightColor}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />

                {/* PDF Viewer */}
                <section className="flex-1 overflow-hidden relative bg-slate-100/30 dark:bg-slate-900/30">
                    <Suspense fallback={
                        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initializing Viewer...</span>
                        </div>
                    }>
                        <div className="h-full w-full overflow-auto flex justify-center py-10">
                            <PdfViewer
                                url={selectedDoc.pdfUrl}
                                activeTool={activeTool}
                                highlightColor={highlightColor}
                                onAnnotationClick={setSelectedAnnotation}
                                onTotalPagesChange={setActualTotalPages}
                            />
                        </div>
                    </Suspense>
                    <PageControls totalPages={actualTotalPages ?? 1} />
                </section>
            </div>

            {/* Extracted Fields Sidebar */}
            {fieldsLoading ? (
                <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-8 animate-pulse flex-shrink-0">
                    <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-10" />
                    <div className="space-y-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-16 bg-slate-50 dark:bg-slate-800 rounded" />
                                <div className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </aside>
            ) : (
                <ExtractedFieldsSidebar
                    fields={fields || []}
                    onSave={async (data) => {
                        await mutation.mutateAsync(data);
                    }}
                    isSaving={mutation.isPending}
                />
            )}

            {/* Comments Panel */}
            {selectedAnnotation && (
                <CommentsPanel
                    annotation={selectedAnnotation}
                    onClose={() => setSelectedAnnotation(null)}
                />
            )}
        </div>
    );
};
