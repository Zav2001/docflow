import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import { useRole } from '../hooks/useRole';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const selectDocuments = createSelector(
    [(state: RootState) => state.documents.entities],
    (entities) => Object.values(entities)
);

const selectComments = createSelector(
    [(state: RootState) => state.comments.entities],
    (entities) => Object.values(entities)
);

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { can } = useRole();
    const documents = useAppSelector(selectDocuments);
    const notifications = useAppSelector((state) => state.notifications.items);
    const comments = useAppSelector(selectComments);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    const commands = [
        { id: 'dashboard', icon: Icons.Layout, label: 'Go to Dashboard', action: () => navigate('/'), shortcut: 'G D' },
        can('team:view') ? { id: 'team', icon: Icons.Users, label: 'Go to Team', action: () => navigate('/team'), shortcut: 'G T' } : null,
        can('notifications:view') ? { id: 'notifications', icon: Icons.Bell, label: 'Go to Notifications', action: () => navigate('/notifications'), shortcut: 'G N' } : null,
        can('settings:manage') ? { id: 'settings', icon: Icons.Settings, label: 'Go to Settings', action: () => navigate('/settings'), shortcut: 'G S' } : null,
    ].filter(Boolean) as Array<{ id: string; icon: any; label: string; action: () => void; shortcut: string }>;

    const term = search.trim().toLowerCase();
    const filteredDocuments = useMemo(() => documents.filter(doc =>
        doc.name.toLowerCase().includes(term) || doc.status.toLowerCase().includes(term)
    ), [documents, term]);

    const filteredNotifications = useMemo(() => notifications.filter((n) =>
        n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term)
    ).slice(0, 6), [notifications, term]);

    const filteredComments = useMemo(() => comments.filter((c) =>
        c.content.toLowerCase().includes(term)
    ).slice(0, 6), [comments, term]);

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(term)
    );

    const handleSelect = (action: () => void) => {
        action();
        onClose();
        setSearch('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                >
                    <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                        <Icons.Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents, commands, or navigate..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 text-lg outline-none placeholder:text-slate-400"
                            autoFocus
                        />
                        <kbd className="px-2 py-1 text-xs font-bold text-slate-500 bg-slate-100 rounded">ESC</kbd>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {search && filteredDocuments.length > 0 && (
                            <div className="p-2">
                                <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Documents</div>
                                {filteredDocuments.map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleSelect(() => navigate(`/documents/${doc.id}`))}
                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Icons.FileText className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900">{doc.name}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">{doc.status}</p>
                                        </div>
                                        <Icons.ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {search && filteredNotifications.length > 0 && (
                            <div className="p-2">
                                <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Notifications</div>
                                {filteredNotifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleSelect(() => navigate('/notifications'))}
                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <Icons.Bell className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{notif.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{notif.message}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {search && filteredComments.length > 0 && (
                            <div className="p-2">
                                <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Comments</div>
                                {filteredComments.map((comment) => (
                                    <button
                                        key={comment.id}
                                        onClick={() => handleSelect(() => navigate(`/documents/${comment.documentId}`))}
                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <Icons.MessageSquare className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{comment.authorName}</p>
                                            <p className="text-xs text-slate-500 truncate">{comment.content}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {filteredCommands.length > 0 && (
                            <div className="p-2">
                                <div className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Quick Actions</div>
                                {filteredCommands.map((cmd) => (
                                    <button
                                        key={cmd.id}
                                        onClick={() => handleSelect(cmd.action)}
                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <cmd.icon className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                                        </div>
                                        <p className="flex-1 font-bold text-slate-900">{cmd.label}</p>
                                        <kbd className="px-2 py-1 text-xs font-bold text-slate-400 bg-slate-50 rounded">{cmd.shortcut}</kbd>
                                    </button>
                                ))}
                            </div>
                        )}

                        {search && filteredDocuments.length === 0 && filteredCommands.length === 0 && filteredNotifications.length === 0 && filteredComments.length === 0 && (
                            <div className="p-12 text-center">
                                <Icons.Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No results found</p>
                                <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
                            </div>
                        )}

                        {!search && (
                            <div className="p-6 text-center text-slate-400">
                                <Icons.Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="font-bold text-slate-600">Start typing to search</p>
                                <p className="text-sm mt-1">Search documents or use quick commands</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
