import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAppDispatch } from '../hooks/useRedux';
import { setCurrentUser } from '../features/session/store/sessionSlice';
import * as Icons from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'architect@docflow.com',
            password: 'admin123',
        },
    });

    const onSubmit = async (values: LoginForm) => {
        setError('');
        setLoading(true);
        try {
            const user = await userApi.login(values.email, values.password);
            dispatch(setCurrentUser(user));
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sign in to continue to DocFlow.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary dark:text-white"
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs font-bold text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary dark:text-white"
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs font-bold text-red-600">{errors.password.message}</p>}
                    </div>
                    {error && (
                        <div className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Icons.LogIn size={16} />
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                    New here?{' '}
                    <Link className="text-primary font-bold hover:underline" to="/register">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
};
