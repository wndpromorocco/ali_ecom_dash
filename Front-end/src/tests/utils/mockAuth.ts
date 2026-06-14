import { vi } from 'vitest';

export const mockAuthContext = {
    login: vi.fn().mockResolvedValue(true),
    register: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(undefined),
    fetchProfile: vi.fn().mockResolvedValue(undefined),
    user: { id: 'u-1', email: 'admin@fadeltrading.com', role: 'ADMIN' },
    isAuthenticated: true,
    loading: false,
};

export const mockAuthContextUnauthenticated = {
    ...mockAuthContext,
    user: null,
    isAuthenticated: false,
};
