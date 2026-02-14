import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ExtractedField } from '../../../types';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const fieldSchema = z.object({
    fields: z.array(z.object({
        id: z.string(),
        label: z.string(),
        value: z.string().min(1, "Value is required"),
        confidence: z.number(),
    }))
});

type FormValues = z.infer<typeof fieldSchema>;

interface ExtractedFieldsSidebarProps {
    fields: ExtractedField[];
    onSave: (data: FormValues) => Promise<void>;
    isSaving: boolean;
}

export const ExtractedFieldsSidebar: React.FC<ExtractedFieldsSidebarProps> = ({ fields, onSave, isSaving }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(fieldSchema),
        defaultValues: { fields }
    });

    return (
        <aside className="w-80 bg-white border-l shadow-2xl z-20 flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Data Extraction</h2>
                {isSaving ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary animate-pulse">
                        <Save size={12} /> SAVING...
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 size={12} /> SAVED
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-y-auto p-6 space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="group flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{field.label}</label>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${field.confidence > 0.9 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-[9px] font-bold text-slate-500">{Math.round(field.confidence * 100)}% Match</span>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                {...register(`fields.${index}.value`)}
                                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${errors.fields?.[index]?.value ? 'border-destructive bg-destructive/5' : 'border-slate-200'
                                    }`}
                            />
                            {errors.fields?.[index]?.value && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-3 text-destructive">
                                    <AlertCircle size={14} />
                                </div>
                            )}
                        </div>
                        {errors.fields?.[index]?.value && (
                            <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">
                                {errors.fields[index].value?.message}
                            </p>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? 'Processing...' : 'Verify & Sync'}
                </button>
            </form>

            <div className="p-4 bg-slate-50 border-t">
                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <AlertCircle size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">AI Confidence Score</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Review required for low confidence fields</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
