import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useRole } from '../hooks/useRole';
import { RecentDocuments } from '../components/RecentDocuments';
import { CommandPalette } from '../components/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../hooks/useRedux';

interface NavItem {
    id: string;
    icon: any;
    label: string;
    path: string;
    badge?: number;
    shortcut?: string;
    permission?: 'documents:view' | 'team:view' | 'notifications:view' | 'settings:manage' | 'analytics:view';
}

export const Sidebar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin, can } = useRole();
    const unreadCount = useAppSelector((state) => state.notifications.items.filter((n) => !n.read).length);

    const navItems: NavItem[] = [
        { id: 'dashboard', icon: Icons.Layout, label: 'Dashboard', path: '/', shortcut: 'G D', permission: 'documents:view' },
        { id: 'search', icon: Icons.Search, label: 'Search', path: '#', shortcut: '⌘ K' },
        { id: 'favorites', icon: Icons.Star, label: 'Favorites', path: '/favorites', permission: 'documents:view' },
        { id: 'analytics', icon: Icons.BarChart3, label: 'Analytics', path: '/analytics', permission: 'analytics:view' },
        { id: 'team', icon: Icons.Users, label: 'Team', path: '/team', shortcut: 'G T', permission: 'team:view' },
        { id: 'notifications', icon: Icons.Bell, label: 'Notifications', path: '/notifications', badge: unreadCount || undefined, shortcut: 'G N', permission: 'notifications:view' },
    ];

    const bottomItems: NavItem[] = [
        { id: 'settings', icon: Icons.Settings, label: 'Settings', path: '/settings', shortcut: 'G S', permission: 'settings:manage' },
    ];

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Command palette: Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
            }

            // Toggle sidebar: Cmd/Ctrl + B
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                setIsPinned(!isPinned);
            }

            // Go shortcuts (G + letter)
            if (e.key === 'g') {
                const nextKey = (ev: KeyboardEvent) => {
                    if (ev.key === 'd') navigate('/');
                    if (ev.key === 'f') navigate('/favorites');
                    if (ev.key === 'a' && can('analytics:view')) navigate('/analytics');
                    if (ev.key === 't' && can('team:view')) navigate('/team');
                    if (ev.key === 'n' && can('notifications:view')) navigate('/notifications');
                    if (ev.key === 's' && can('settings:manage')) navigate('/settings');
                    document.removeEventListener('keydown', nextKey);
                };
                document.addEventListener('keydown', nextKey);
                setTimeout(() => document.removeEventListener('keydown', nextKey), 2000);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate, isPinned]);

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/' || (!location.pathname.startsWith('/documents') && location.pathname === '/');
        return location.pathname.startsWith(path);
    };

    const handleNavClick = (item: NavItem) => {
        if (item.id === 'search') {
            setShowCommandPalette(true);
        } else {
            navigate(item.path);
        }
    };

    const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

    const shouldExpand = isExpanded || isPinned;

    const filteredNavItems = navItems.filter(item => !item.permission || can(item.permission));

    return (
        <>
            <motion.aside
                initial={false}
                animate={{ width: shouldExpand ? 240 : 64 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className="bg-slate-900 dark:bg-slate-950 flex flex-col border-r border-slate-800 dark:border-slate-900 flex-shrink-0 z-50 relative"
            >
                {/* Logo / Brand */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 dark:border-slate-900">
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <Icons.FileText size={24} />
                        </div>
                        <AnimatePresence>
                            {shouldExpand && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="overflow-hidden"
                                >
                                    <h1 className="text-lg font-black text-white tracking-tight">DocFlow</h1>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {shouldExpand && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setIsPinned(!isPinned)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isPinned ? "bg-primary/20 text-primary" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                            >
                                <Icons.Pin size={16} className={isPinned ? "rotate-45" : ""} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <div className="space-y-1 px-2">
                        {filteredNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                                    isActive(item.path) && item.id !== 'search'
                                        ? "bg-slate-800 dark:bg-slate-900 text-white"
                                        : "text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                                )}
                                title={!shouldExpand ? item.label : undefined}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />

                                <AnimatePresence>
                                    {shouldExpand && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex-1 text-left text-sm font-bold"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {item.badge && (
                                    <div className={cn(
                                        "flex items-center justify-center text-xs font-black rounded-full",
                                        shouldExpand ? "px-2 py-0.5 bg-primary text-white" : "absolute top-1 right-1 w-2 h-2 bg-primary"
                                    )}>
                                        {shouldExpand && item.badge}
                                    </div>
                                )}

                                <AnimatePresence>
                                    {shouldExpand && item.shortcut && (
                                        <motion.kbd
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-[10px] font-bold text-slate-500 bg-slate-800 dark:bg-slate-900 px-1.5 py-0.5 rounded"
                                        >
                                            {item.shortcut}
                                        </motion.kbd>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>

                    {/* Recent Documents */}
                    <AnimatePresence>
                        {shouldExpand && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 border-t border-slate-800 dark:border-slate-900 overflow-hidden"
                            >
                                <RecentDocuments />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-slate-800 dark:border-slate-900">
                    {isAdmin && (
                        <div className={cn(
                            "mx-2 my-2 flex items-center gap-3 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20",
                            !shouldExpand && "justify-center"
                        )}>
                            <Icons.ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            <AnimatePresence>
                                {shouldExpand && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-xs font-bold text-emerald-500 uppercase tracking-wider"
                                    >
                                        Admin
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <div className="space-y-1 px-2 py-2">
                        {bottomItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                    isActive(item.path)
                                        ? "bg-slate-800 dark:bg-slate-900 text-white"
                                        : "text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                                )}
                                title={!shouldExpand ? item.label : undefined}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <AnimatePresence>
                                    {shouldExpand && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex-1 text-left text-sm font-bold"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className={cn(
                        "p-3 border-t border-slate-800 dark:border-slate-900 flex items-center gap-3",
                        !shouldExpand && "justify-center"
                    )}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            SA
                        </div>
                        <AnimatePresence>
                            {shouldExpand && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="text-sm font-bold text-white truncate">Senior Architect</p>
                                    <p className="text-xs text-slate-400 truncate">architect@docflow.com</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
        </>
    );
};
