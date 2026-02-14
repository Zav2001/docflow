import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { userApi } from '../api/userApi';

export const TeamPage: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTeam = async () => {
        setLoading(true);
        const members = await userApi.getTeam();
        setTeamMembers(members);
        setLoading(false);
    };

    useEffect(() => {
        loadTeam();
    }, []);

    const handleInvite = async () => {
        const email = prompt("Enter email address to invite:");
        if (email) {
            await userApi.inviteMember(email, 'REVIEWER');
            await loadTeam();
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm("Are you sure you want to remove this member?")) {
            await userApi.removeMember(id);
            await loadTeam();
        }
    };

    return (
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-12">
            <header className="max-w-6xl mx-auto mb-12">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Team</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">Manage team members and permissions</p>
            </header>

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Active Members</h2>
                            <p className="text-sm text-slate-500 mt-1">{teamMembers.length} team members</p>
                        </div>
                        <button
                            onClick={handleInvite}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                            <Icons.UserPlus size={16} /> Invite Member
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading team...</div>
                        ) : teamMembers.map((member, idx) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                {member.avatar}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-emerald-500' :
                                                member.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">{member.name}</h3>
                                            <p className="text-sm text-slate-500 mt-1">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-900">{member.documents}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">Documents</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(member.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove member"
                                        >
                                            <Icons.Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
