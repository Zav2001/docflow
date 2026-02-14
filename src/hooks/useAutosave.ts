import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface AutosaveOptions<T> {
    onSave: (data: T) => Promise<void>;
    delay?: number;
}

export function useAutosave<T>(data: T, { onSave, delay = 2000 }: AutosaveOptions<T>) {
    const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
    const initialRender = useRef(true);

    const debouncedSave = useDebounce(async (newData: T) => {
        setStatus('SAVING');
        try {
            await onSave(newData);
            setStatus('SAVED');
        } catch (error) {
            console.error('Autosave failed:', error);
            setStatus('ERROR');
        }
    }, delay);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        setStatus('IDLE');
        debouncedSave(data);
    }, [data, debouncedSave]);

    return { status };
}
