import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { docApi } from '../api/docApi';
import { userApi } from '../api/userApi';
import type { AuditLogItem, DocumentMetadata } from '../types';

export const AnalyticsPage: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [teamCount, setTeamCount] = useState(0);
    const [logs, setLogs] = useState<AuditLogItem[]>([]);

    useEffect(() => {
        const load = async () => {
            const [docs, team, auditLogs] = await Promise.all([
                docApi.getDocuments(),
                userApi.getTeam(),
                userApi.getAuditLogs(),
            ]);
            setDocuments(docs);
            setTeamCount(team.length);
            setLogs(auditLogs);
        };
        load();
    }, []);

    const statusCounts = useMemo(() => {
        const reviewed = documents.filter((d) => d.status === 'REVIEWED').length;
        const pending = documents.filter((d) => d.status === 'PENDING').length;
        const approved = documents.filter((d) => d.status === 'APPROVED').length;
        const total = Math.max(documents.length, 1);
        return {
            reviewed,
            pending,
            approved,
            reviewedPct: Math.round((reviewed / total) * 100),
            pendingPct: Math.round((pending / total) * 100),
            approvedPct: Math.round((approved / total) * 100),
        };
    }, [documents]);

    const uploadsThisWeek = logs.filter((log) => {
        if (log.type !== 'upload') return false;
        const created = new Date(log.createdAt);
        const diff = Date.now() - created.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const metrics = [
        { label: 'Total Documents', value: String(documents.length), change: `${uploadsThisWeek} uploaded / 7d`, icon: Icons.FileText, color: 'bg-blue-500' },
        { label: 'Pending Review', value: String(statusCounts.pending), change: `${statusCounts.pendingPct}% of total`, icon: Icons.Clock, color: 'bg-amber-500' },
        { label: 'Team Members', value: String(teamCount), change: 'active workspace users', icon: Icons.Users, color: 'bg-emerald-500' },
        { label: 'Approval Rate', value: `${statusCounts.approvedPct}%`, change: `${statusCounts.approved} approved`, icon: Icons.Target, color: 'bg-slate-900' },
    ];

    const weeklyData = useMemo(() => {
        const buckets = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => ({ day, count: 0, max: 1 }));
        logs.forEach((log) => {
            if (log.type !== 'upload') return;
            const day = new Date(log.createdAt).getDay();
            buckets[day].count += 1;
        });
        const max = Math.max(1, ...buckets.map((b) => b.count));
        return buckets.map((b) => ({ ...b, max }));
    }, [logs]);

    const statusData = [
        { name: 'Reviewed', value: statusCounts.reviewedPct, color: 'bg-emerald-500' },
        { name: 'Pending', value: statusCounts.pendingPct, color: 'bg-amber-500' },
        { name: 'Approved', value: statusCounts.approvedPct, color: 'bg-blue-500' },
    ];

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-12">
            <header className="max-w-7xl mx-auto mb-12">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Analytics</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                    Real-time workspace insights from local audit and document data
                </p>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                                    <metric.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Live</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{metric.value}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{metric.change}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                    >
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Uploads by Day</h3>
                        <div className="flex items-end justify-between h-64 gap-4">
                            {weeklyData.map((item) => (
                                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(item.count / item.max) * 100}%` }}
                                            transition={{ duration: 0.4 }}
                                            className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.day}</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                    >
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Document Status</h3>
                        <div className="space-y-4">
                            {statusData.map((item) => (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                            transition={{ duration: 0.45 }}
                                            className={`h-full ${item.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                >
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Audit Activity</h3>
                    <div className="space-y-3">
                        {logs.slice(0, 10).map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                                <p className="text-sm text-slate-900 dark:text-slate-100">
                                    <span className="font-black">{log.actor}</span> {log.action}
                                    {log.target ? <span className="font-bold"> {log.target}</span> : null}
                                </p>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No audit events yet.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
