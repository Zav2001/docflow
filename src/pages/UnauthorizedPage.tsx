import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-10">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Unauthorized</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">You do not have permission to access this section.</p>
                <Link to="/" className="inline-flex px-4 py-2 rounded-lg bg-primary text-white font-bold">
                    Return to dashboard
                </Link>
            </div>
        </div>
    );
};
