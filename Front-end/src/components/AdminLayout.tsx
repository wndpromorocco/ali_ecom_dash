import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    Package,
    LayoutGrid,
    Plus,
    MessageSquare,
    ShieldCheck,
    LogOut,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    Layout,
    Menu,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN = import.meta.env.VITE_ADMIN_SLUG;

const NAV = [
    {
        label: 'Gestion du Catalogue',
        items: [
            { to: `/${ADMIN}/dashboard`, icon: Package, label: 'Registre d\'inventaire' },
            { to: `/${ADMIN}/categories`, icon: LayoutGrid, label: 'Catalogue & Attributs' },
            { to: `/${ADMIN}/products/new`, icon: Plus, label: 'Nouveau Produit' },
        ],
    },
    {
        label: 'Apparence Site',
        items: [
            { to: `/${ADMIN}/homepage`, icon: Layout, label: 'Accueil & Vitrine' },
        ],
    },
    {
        label: 'Paramètres Généraux',
        items: [
            { to: `/${ADMIN}/settings?tab=whatsapp`, icon: MessageSquare, label: 'WhatsApp & Contact' },
            { to: `/${ADMIN}/settings?tab=security`, icon: ShieldCheck, label: 'Sécurité' },
        ],
    },
];

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (to: string) => {
        const path = to.split('?')[0];
        if (path === `/${ADMIN}/dashboard`) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate(`/${ADMIN}/login`);
    };

    return (
        <div className="min-h-screen flex bg-[#f4f4f0]">
            {/* ── MOBILE SIDEBAR DRAWER ────────────────────────────────── */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[240px] bg-[#161c2b] z-[60] flex flex-col lg:hidden"
                        >
                            <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#db6513] rounded-md flex items-center justify-center shadow-md">
                                        <span className="text-white font-black text-[14px]">H</span>
                                    </div>
                                    <p className="text-white font-black text-[13px] uppercase tracking-wide leading-none">Fadel trading</p>
                                </div>
                                <button onClick={() => setIsMobileOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 py-4 overflow-y-auto px-2">
                                {NAV.map((section) => (
                                    <div key={section.label} className="mb-6">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 px-3 mb-3">{section.label}</p>
                                        {section.items.map(({ to, icon: Icon, label }) => {
                                            const active = isActive(to);
                                            return (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    onClick={() => setIsMobileOpen(false)}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 transition-all ${active ? 'bg-[#db6513] text-white' : 'text-gray-400 hover:bg-white/5'}`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-[12px] font-bold">{label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-white/5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-[12px] font-bold">Déconnexion</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── DESKTOP SIDEBAR ───────────────────────────────────── */}
            <aside
                className={`
                    hidden lg:flex flex-shrink-0 flex-col bg-[#161c2b] border-r border-white/5
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-[60px]' : 'w-[200px]'}
                    sticky top-0 h-screen overflow-hidden
                `}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 bg-[#db6513] rounded-md flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-900/40">
                        <span className="text-white font-black text-[14px]">H</span>
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-white font-black text-[13px] uppercase tracking-wide leading-none truncate">Fadel trading</p>
                            <p className="text-gray-500 text-[9px] uppercase tracking-widest font-bold mt-0.5 leading-none">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    {NAV.map((section) => (
                        <div key={section.label} className="mb-5">
                            {!collapsed && (
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-600 px-4 mb-2 leading-none">
                                    {section.label}
                                </p>
                            )}
                            {section.items.map(({ to, icon: Icon, label }) => {
                                const active = isActive(to);
                                return (
                                    <Link
                                        key={to}
                                        to={to}
                                        title={collapsed ? label : undefined}
                                        className={`
                                            flex items-center gap-2.5 mx-2 mb-0.5 rounded-md transition-all duration-150
                                            ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}
                                            ${active
                                                ? 'bg-[#db6513] text-white shadow-sm shadow-orange-900/30'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                            }
                                        `}
                                    >
                                        <Icon className="w-[15px] h-[15px] flex-shrink-0" />
                                        {!collapsed && (
                                            <span className="text-[11px] font-bold truncate leading-none">{label}</span>
                                        )}
                                        {!collapsed && active && (
                                            <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-70" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Collapse toggle + Logout */}
                <div className="border-t border-white/5 flex-shrink-0">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-gray-500 hover:text-gray-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Agrandir' : 'Réduire'}
                    >
                        {collapsed
                            ? <PanelLeftOpen className="w-4 h-4" />
                            : <><PanelLeftClose className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">Réduire</span></>
                        }
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-gray-500 hover:text-red-400 transition-colors border-t border-white/5 ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Déconnexion' : undefined}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Topbar */}
                <header className="h-14 lg:h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-[#db6513] transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="lg:hidden w-8 h-8 bg-[#db6513] rounded-md flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-[12px]">H</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-black uppercase tracking-wide text-gray-800 leading-none">Administrateur</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#db6513] leading-none mt-0.5">● Session active</p>
                        </div>
                        <Link to={`/${ADMIN}/settings`}>
                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#e8721f] hover:text-[#db6513] transition-all">
                                <Settings className="w-3.5 h-3.5" />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f4f4f0]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
