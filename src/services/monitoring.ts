import { StorageService } from './storage';

export const setupClientMonitoring = () => {
    const capture = (message: string, stack?: string) => {
        StorageService.addAuditLog({
            type: 'system',
            actor: 'Client',
            action: 'captured error',
            target: message,
            metadata: stack ? { stack } : undefined,
        });
    };

    window.addEventListener('error', (event) => {
        capture(event.message, event.error?.stack);
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
        capture(`Unhandled promise rejection: ${reason}`);
    });
};
