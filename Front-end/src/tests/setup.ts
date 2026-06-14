import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from './mocks/server';

// Ensure environment variables are available for tests
vi.stubEnv('VITE_ADMIN_SLUG', 'admin');
vi.stubEnv('VITE_API_BASE', 'http://localhost:8080');
vi.stubEnv('VITE_ERP_API_URL', 'http://localhost:8080/erp');

// Mock matchMedia for any component using it (like some Shadcn/Radix components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock PointerEvent if not available (needed for Radix UI select/dropdown etc)
if (!global.PointerEvent) {
    class PointerEvent extends MouseEvent {
        constructor(type: string, props: any = {}) {
            super(type, props);
            // @ts-ignore
            this.pointerId = props.pointerId || 0;
            // @ts-ignore
            this.width = props.width || 0;
            // @ts-ignore
            this.height = props.height || 0;
            // @ts-ignore
            this.pressure = props.pressure || 0;
            // @ts-ignore
            this.tangentialPressure = props.tangentialPressure || 0;
            // @ts-ignore
            this.tiltX = props.tiltX || 0;
            // @ts-ignore
            this.tiltY = props.tiltY || 0;
            // @ts-ignore
            this.twist = props.twist || 0;
            // @ts-ignore
            this.pointerType = props.pointerType || '';
            // @ts-ignore
            this.isPrimary = props.isPrimary || false;
        }
    }
    // @ts-ignore
    global.PointerEvent = PointerEvent as any;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
