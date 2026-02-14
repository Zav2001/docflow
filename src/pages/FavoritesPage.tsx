import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { docApi } from '../api/docApi';
import type { DocumentMetadata } from '../types';

export const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        setLoading(true);
        const docs = await docApi.getDocuments();
        setFavorites(docs.filter(doc => doc.isFavorite));
        setLoading(false);
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const handleRemoveFavorite = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const previous = [...favorites];
        setFavorites((current) => current.filter((doc) => doc.id !== id));
        try {
            await docApi.toggleFavorite(id);
        } catch {
            setFavorites(previous);
        }
    };

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-12">
            <header className="max-w-6xl mx-auto mb-12">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Favorites</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                    Your starred documents
                </p>
            </header>

            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-24 text-slate-500">Loading...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Icons.Star className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No favorites yet</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Star documents from the dashboard to see them here
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                        >
                            Browse Documents
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((doc, idx) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => navigate(`/documents/${doc.id}`)}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Icons.FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <button
                                        onClick={(e) => handleRemoveFavorite(e, doc.id)}
                                        className="hover:scale-110 transition-transform"
                                        title="Remove from favorites"
                                    >
                                        <Icons.Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    </button>
                                </div>
                                <h3 className="font-black text-slate-900 dark:text-white mb-2 truncate">{doc.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{doc.totalPages} pages</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
