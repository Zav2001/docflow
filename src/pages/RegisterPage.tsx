import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAppDispatch } from '../hooks/useRedux';
import { setCurrentUser } from '../features/session/store/sessionSlice';
import * as Icons from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (values: RegisterForm) => {
        setError('');
        setLoading(true);
        try {
            const user = await userApi.register({ name: values.name, email: values.email, password: values.password });
            dispatch(setCurrentUser(user));
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Account</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Use local JSON storage for this demo auth.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full name"
                        {...register('name')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary dark:text-white"
                        required
                    />
                    {errors.name && <p className="text-xs font-bold text-red-600">{errors.name.message}</p>}
                    <input
                        type="email"
                        placeholder="Email address"
                        {...register('email')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary dark:text-white"
                        required
                    />
                    {errors.email && <p className="text-xs font-bold text-red-600">{errors.email.message}</p>}
                    <input
                        type="password"
                        placeholder="Password"
                        {...register('password')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary dark:text-white"
                        required
                    />
                    {errors.password && <p className="text-xs font-bold text-red-600">{errors.password.message}</p>}
                    <input
                        type="password"
                        placeholder="Confirm password"
                        {...register('confirmPassword')}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary dark:text-white"
                        required
                    />
                    {errors.confirmPassword && <p className="text-xs font-bold text-red-600">{errors.confirmPassword.message}</p>}
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
                        <Icons.UserPlus size={16} />
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link className="text-primary font-bold hover:underline" to="/login">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
