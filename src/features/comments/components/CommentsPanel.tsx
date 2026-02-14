import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { addComment, deleteComment, toggleResolve } from '../store/commentsSlice';
import { docApi } from '../../../api/docApi';
import type { Annotation } from '../../../types';

interface CommentsPanelProps {
    annotation: Annotation | null;
    onClose: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({ annotation, onClose }) => {
    const dispatch = useAppDispatch();
    const [newComment, setNewComment] = useState('');

    const comments = useAppSelector((state) =>
        annotation
            ? (state.comments.byAnnotation[annotation.id] || []).map(id => state.comments.entities[id])
            : []
    );

    const handleAddComment = () => {
        if (!annotation || !newComment.trim()) return;

        // Extract mentions
        const mentions = newComment.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];

        const comment = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `comment-${Date.now()}`,
            annotationId: annotation.id,
            documentId: annotation.documentId,
            authorId: 'current-user',
            authorName: 'Senior Architect',
            content: newComment,
            mentions,
            createdAt: new Date().toISOString(),
            resolved: false,
        };

        dispatch(addComment(comment));
        void docApi.saveComment(comment);

        setNewComment('');
    };

    const handleDelete = (commentId: string) => {
        dispatch(deleteComment(commentId));
        void docApi.deleteComment(commentId);
    };

    const handleToggleResolve = (commentId: string) => {
        dispatch(toggleResolve(commentId));
        void docApi.toggleResolveComment(commentId);
    };

    if (!annotation) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Comments</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Icons.X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Page {annotation.pageNumber} • {new Date(annotation.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {comments.length === 0 ? (
                        <div className="text-center py-12">
                            <Icons.MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">No comments yet</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                                Be the first to comment on this annotation
                            </p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border ${comment.resolved
                                        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-black">
                                            {comment.authorName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {comment.authorName}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggleResolve(comment.id)}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                            title={comment.resolved ? 'Unresolve' : 'Resolve'}
                                        >
                                            {comment.resolved ? (
                                                <Icons.CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Icons.Circle className="w-4 h-4 text-slate-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Icons.Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                                {comment.mentions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {comment.mentions.map((mention, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                                            >
                                                @{mention}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment... Use @name to mention"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none dark:text-white"
                            rows={3}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleAddComment();
                                }
                            }}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Press ⌘+Enter to send
                            </p>
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
