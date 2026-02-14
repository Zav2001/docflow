import { useCallback } from 'react';

// Custom debounce implementation to avoid external dependencies
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: any;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedCallback = useCallback(
        debounce(callback, delay),
        [callback, delay]
    );

    return debouncedCallback;
}
