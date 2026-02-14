import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

interface UploadZoneProps {
    onUpload?: (files: File[]) => Promise<void>;
}

export interface UploadZoneHandle {
    open: () => void;
}

export const UploadZone = forwardRef<UploadZoneHandle, UploadZoneProps>(({ onUpload }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        open: () => {
            fileInputRef.current?.click();
        }
    }));

    const processFiles = async (files: File[]) => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);

        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setProgress(i);
        }

        if (onUpload) {
            await onUpload(files);
        }

        setTimeout(() => {
            setUploading(false);
            setProgress(0);
        }, 500);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter(
            file => file.type === 'application/pdf'
        );
        processFiles(files);
        // Reset input value to allow same file upload
        if (e.target) e.target.value = '';
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'application/pdf'
        );

        if (files.length === 0) {
            alert('Please drop PDF files only');
            return;
        }

        await processFiles(files);
    }, [onUpload]);

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="application/pdf"
                onChange={handleFileInputChange}
            />
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="fixed inset-0 pointer-events-none z-40"
            >
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/10 backdrop-blur-sm pointer-events-auto"
                        >
                            <div className="h-full flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-dashed border-primary p-16 shadow-2xl"
                                >
                                    <Icons.Upload className="w-24 h-24 text-primary mx-auto mb-6" />
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                                        Drop PDFs Here
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-center">
                                        Upload multiple documents at once
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {uploading && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-80 z-50"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Icons.Upload className="w-6 h-6 text-primary animate-bounce" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-900 dark:text-white">Uploading...</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{progress}% complete</p>
                            </div>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary rounded-full"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});
