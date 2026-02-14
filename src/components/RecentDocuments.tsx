import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';

interface RecentDocument {
    id: string;
    name: string;
    timestamp: string;
}

export const RecentDocuments: React.FC = () => {
    const navigate = useNavigate();
    const recentDocs: RecentDocument[] = useAppSelector((state) =>
        Object.values(state.documents.entities)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
            .slice(0, 5)
            .map((doc) => ({
                id: doc.id,
                name: doc.name,
                timestamp: new Date(doc.uploadDate).toLocaleString(),
            }))
    );

    if (recentDocs.length === 0) {
        return (
            <div className="p-4 text-center">
                <Icons.Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No recent documents</p>
            </div>
        );
    }

    return (
        <div className="py-2">
            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Recent
            </div>
            <div className="space-y-1 px-2">
                {recentDocs.map((doc) => (
                    <button
                        key={doc.id}
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors text-left group"
                    >
                        <Icons.FileText className="w-4 h-4 text-slate-400 group-hover:text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-300 truncate group-hover:text-white">
                                {doc.name}
                            </p>
                            <p className="text-[10px] text-slate-500">{doc.timestamp}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
