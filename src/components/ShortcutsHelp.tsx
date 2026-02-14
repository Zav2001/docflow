import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

interface ShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    {
        category: 'Navigation',
        items: [
            { keys: ['G', 'D'], description: 'Go to Dashboard' },
            { keys: ['G', 'T'], description: 'Go to Team' },
            { keys: ['G', 'N'], description: 'Go to Notifications' },
            { keys: ['G', 'S'], description: 'Go to Settings' },
        ],
    },
    {
        category: 'Actions',
        items: [
            { keys: ['⌘', 'K'], description: 'Open command palette' },
            { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
            { keys: ['?'], description: 'Show keyboard shortcuts' },
            { keys: ['ESC'], description: 'Close dialogs' },
        ],
    },
    {
        category: 'Document Viewer',
        items: [
            { keys: ['←', '→'], description: 'Previous/Next page' },
            { keys: ['+', '-'], description: 'Zoom in/out' },
            { keys: ['R'], description: 'Rotate document' },
            { keys: ['F'], description: 'Toggle fullscreen' },
        ],
    },
    {
        category: 'Editing',
        items: [
            { keys: ['⌘', 'S'], description: 'Save changes' },
            { keys: ['⌘', 'Z'], description: 'Undo' },
            { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
        ],
    },
];

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    const filteredShortcuts = shortcuts.map(category => ({
        ...category,
        items: category.items.filter(item =>
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            item.keys.some(key => key.toLowerCase().includes(search.toLowerCase()))
        ),
    })).filter(category => category.items.length > 0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/70"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Icons.X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <div className="relative">
                            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search shortcuts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto p-6 space-y-8">
                        {filteredShortcuts.map((category) => (
                            <div key={category.category}>
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                    {category.category}
                                </h3>
                                <div className="space-y-3">
                                    {category.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2">
                                            <span className="text-slate-700 dark:text-slate-300">{item.description}</span>
                                            <div className="flex items-center gap-1">
                                                {item.keys.map((key, keyIdx) => (
                                                    <React.Fragment key={keyIdx}>
                                                        <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                                            {key}
                                                        </kbd>
                                                        {keyIdx < item.keys.length - 1 && (
                                                            <span className="text-slate-400 mx-1">+</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredShortcuts.length === 0 && (
                            <div className="text-center py-12">
                                <Icons.Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No shortcuts found</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Press <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold">?</kbd> anytime to open this help
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
