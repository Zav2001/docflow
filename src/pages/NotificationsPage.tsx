import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { markAllNotificationsAsRead, markNotificationAsRead, setNotifications } from '../features/notifications/store/notificationsSlice';
import { setCurrentUser } from '../features/session/store/sessionSlice';

export const NotificationsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector((state) => state.notifications.items);
    const currentUser = useAppSelector((state) => state.session.currentUser);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<'all' | 'document' | 'comment' | 'approval' | 'mention' | 'system'>('all');
    const [savingPreferences, setSavingPreferences] = useState(false);

    const loadNotifications = async () => {
        const data = await userApi.getNotifications();
        dispatch(setNotifications(data));
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        const previous = [...notifications];
        dispatch(markNotificationAsRead(id));
        try {
            await userApi.markAsRead(id);
        } catch {
            dispatch(setNotifications(previous));
        }
    };

    const handleMarkAllAsRead = async () => {
        const previous = [...notifications];
        dispatch(markAllNotificationsAsRead());
        setSelectedIds([]);
        try {
            await userApi.markAllAsRead();
        } catch {
            dispatch(setNotifications(previous));
        }
    };

    const handleMarkSelectedAsRead = async () => {
        const target = [...selectedIds];
        const previous = [...notifications];
        target.forEach((id) => dispatch(markNotificationAsRead(id)));
        setSelectedIds([]);
        try {
            await Promise.all(target.map((id) => userApi.markAsRead(id)));
        } catch {
            dispatch(setNotifications(previous));
        }
    };

    const filtered = notifications.filter((n) => typeFilter === 'all' || n.type === typeFilter);
    const mutedTypes = currentUser?.preferences?.mutedNotificationTypes || [];

    const toggleMutedType = async (type: 'document' | 'comment' | 'approval' | 'mention' | 'system') => {
        if (!currentUser?.preferences) return;
        setSavingPreferences(true);
        const nextMuted = mutedTypes.includes(type)
            ? mutedTypes.filter((item) => item !== type)
            : [...mutedTypes, type];
        const saved = await userApi.updatePreferences({
            ...currentUser.preferences,
            mutedNotificationTypes: nextMuted,
        });
        dispatch(setCurrentUser(saved));
        setSavingPreferences(false);
    };

    const setDigestMode = async (digestMode: 'instant' | 'daily' | 'weekly') => {
        if (!currentUser?.preferences) return;
        setSavingPreferences(true);
        const saved = await userApi.updatePreferences({
            ...currentUser.preferences,
            digestMode,
        });
        dispatch(setCurrentUser(saved));
        setSavingPreferences(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'document': return <Icons.FileText size={20} />;
            case 'comment': return <Icons.MessageSquare size={20} />;
            case 'approval': return <Icons.CheckCircle2 size={20} />;
            case 'mention': return <Icons.AtSign size={20} />;
            default: return <Icons.Bell size={20} />;
        }
    };

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-12">
            <header className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Notifications</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">Stay updated on your documents</p>
                </div>
                <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    Mark all as read
                </button>
            </header>

            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-3">
                    {(['all', 'document', 'comment', 'approval', 'mention', 'system'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${typeFilter === type ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        >
                            {type}
                        </button>
                    ))}
                    <button
                        onClick={handleMarkSelectedAsRead}
                        disabled={selectedIds.length === 0}
                        className="ml-auto px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white disabled:opacity-50"
                    >
                        Mark Selected ({selectedIds.length})
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Mute Categories</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{savingPreferences ? 'Saving...' : `Digest: ${currentUser?.preferences?.digestMode || 'instant'}`}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(['document', 'comment', 'approval', 'mention', 'system'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => toggleMutedType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${mutedTypes.includes(type) ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                            >
                                {mutedTypes.includes(type) ? `Unmute ${type}` : `Mute ${type}`}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {(['instant', 'daily', 'weekly'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setDigestMode(mode)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${currentUser?.preferences?.digestMode === mode ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-sm font-bold text-slate-500 dark:text-slate-400">
                        Loading notifications...
                    </div>
                )}
                {filtered.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 transition-all hover:shadow-lg cursor-pointer ${notif.read ? 'border-slate-200 dark:border-slate-800' : 'border-primary/30 bg-primary/5 dark:bg-primary/10'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <input
                                type="checkbox"
                                className="mt-3"
                                checked={selectedIds.includes(notif.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedIds((prev) => [...prev, notif.id]);
                                    } else {
                                        setSelectedIds((prev) => prev.filter((id) => id !== notif.id));
                                    }
                                }}
                            />
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${notif.read ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'
                                }`}>
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base font-black text-slate-900">{notif.title}</h3>
                                    {!notif.read && (
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">{notif.time}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
