import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { DocumentMetadata } from '../../../types';

import { docApi } from '../../../api/docApi';

interface DocumentDashboardProps {
    documents: DocumentMetadata[];
    onSelect: (id: string) => void;
    onNewUpload?: () => void;
    onDocumentsChanged?: () => Promise<void>;
}

export const DocumentDashboard: React.FC<DocumentDashboardProps> = ({
    documents,
    onSelect,
    onNewUpload,
    onDocumentsChanged
}) => {
    const handleToggleFavorite = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await docApi.toggleFavorite(id);
        await onDocumentsChanged?.();
    };

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between p-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2 uppercase tracking-widest">Manage your active document review pipelines</p>
                </div>
                <button
                    onClick={onNewUpload}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                >
                    <span className="text-lg leading-none">+</span> New Upload
                </button>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {documents.map((doc, idx) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => onSelect(doc.id)}
                        className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer relative overflow-hidden"
                    >
                        <button
                            onClick={(e) => handleToggleFavorite(e, doc.id)}
                            className={`absolute top-6 right-6 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 ${doc.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <Icons.Star className={`w-5 h-5 ${doc.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                        </button>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-start justify-between mb-8 relative">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:bg-primary transition-colors">
                                <Icons.FileText size={28} />
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                doc.status === 'REVIEWED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                    doc.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                        'bg-slate-50 border-slate-200 text-slate-400'
                            )}>
                                {doc.status}
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-2 truncate">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-slate-400 mb-8">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                                <Icons.Clock size={12} /> {new Date(doc.uploadDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                                <Icons.CheckCircle2 size={12} /> {doc.totalPages} Pages
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600 uppercase">
                                        U{i}
                                    </div>
                                ))}
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black">
                                    +3
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Open <Icons.ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.div>
                ))}

                <div
                    onClick={onNewUpload}
                    className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black">
                        +
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Connect Integrations</span>
                </div>
            </div>
        </div>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
