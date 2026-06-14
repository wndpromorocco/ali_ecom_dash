import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { API_BASE, DOMAIN_BASE } from '@/config';
import { toast } from 'sonner';

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    role: 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<boolean>;
    register: (data: any) => Promise<boolean>;
    logout: (redirectTo?: string) => Promise<void>;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useMemo(() => {
        return async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const contentType = res.headers.get("content-type");
                if (!res.ok || !contentType || !contentType.includes("application/json")) {
                    if (!res.ok) {
                        const errorText = await res.text().catch(() => 'No error body');
                        console.error(`Profile fetch failed with status ${res.status}:`, errorText.slice(0, 200));
                    }
                    setUser(null);
                    if (res.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                    }
                    return;
                }

                const json = await res.json();
                if (res.ok && json?.data?.user) {
                    setUser(json.data.user);
                } else {
                    setUser(null);
                    // Token might be invalid or expired
                    if (res.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                    }
                }
            } catch (e) {
                console.error('Fetch profile error:', e);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const login = async (credentials: any) => {
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const errorText = await res.text().catch(() => 'No error body');
                console.error(`Login failed (Status ${res.status}):`, errorText.slice(0, 200));

                if (res.status === 500) {
                    toast.error(`Erreur serveur (500). Veuillez vérifier les logs du backend.`);
                } else {
                    toast.error(`Une erreur est survenue (${res.status}).`);
                }
                return false;
            }

            const json = await res.json();
            if (res.ok && json?.data?.tokens) {
                localStorage.setItem('accessToken', json.data.tokens.accessToken);
                localStorage.setItem('refreshToken', json.data.tokens.refreshToken);
                await fetchProfile();
                toast.success('Connexion réussie');
                return true;
            } else {
                toast.error(json?.message || 'Erreur de connexion');
                return false;
            }
        } catch (e) {
            console.error('Login error:', e);
            toast.error('Erreur réseau');
            return false;
        }
    };

    const register = async (data: any) => {
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const errorText = await res.text().catch(() => 'No error body');
                console.error(`Register failed with non-JSON response (Status ${res.status}):`, errorText.slice(0, 200));
                toast.error(`Erreur serveur (${res.status}). Veuillez réessayer plus tard.`);
                return false;
            }

            const json = await res.json();
            if (res.ok && json?.data?.tokens) {
                localStorage.setItem('accessToken', json.data.tokens.accessToken);
                localStorage.setItem('refreshToken', json.data.tokens.refreshToken);
                await fetchProfile();
                toast.success("Compte créé avec succès");
                return true;
            } else {
                toast.error(json?.message || "Une erreur est survenue");
                return false;
            }
        } catch (e) {
            console.error('Register error:', e);
            toast.error("Une erreur est survenue");
            return false;
        }
    };

    const logout = async (redirectTo: string = '/') => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
            }
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            toast.info("Déconnexion réussie");
            window.location.href = redirectTo;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                fetchProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
