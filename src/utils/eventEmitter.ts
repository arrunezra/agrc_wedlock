// utils/eventEmitter.ts

type NetworkEventCallback = () => void;

class NetworkEventEmitter {
    private listeners: { [key: string]: NetworkEventCallback[] } = {};

    // Register an event listener
    on(event: string, callback: NetworkEventCallback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Remove an event listener
    off(event: string, callback: NetworkEventCallback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    // Broadcast the event trigger
    emit(event: string) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback());
    }
}

export const networkEvents = new NetworkEventEmitter();

// Helper triggers
export const emitNetworkTimeout = () => networkEvents.emit('NETWORK_TIMEOUT');
export const emitNetworkResolved = () => networkEvents.emit('NETWORK_RESOLVED');