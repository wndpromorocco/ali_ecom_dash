import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Mail, Loader2, Package, LayoutGrid, Smartphone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
    const ADMIN = import.meta.env.VITE_ADMIN_SLUG;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await login({ email, password });
            if (success) {
                navigate(`/${ADMIN}/dashboard`);
            }
        } catch (error) {
            toast.error('Erreur lors de la connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0f1117] font-sans selection:bg-[#2563EB]/30">
            {/* Placeholder Color Override */}
            <style>
                {`
                input::placeholder {
                    color: #9ca3af !important;  /* text-gray-400 */
                    opacity: 1 !important;
                }
                `}
            </style>

            {/* ── LEFT SIDE — BRANDING PANEL ────────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-[#161c2b] border-r border-white/5 relative overflow-hidden">
                {/* Decorative Background "H" */}
                <span className="absolute right-[-40px] bottom-[-60px] text-[480px] font-black text-white/[0.02] leading-none select-none pointer-events-none tracking-tighter">
                    H
                </span>

                {/* Top: Logo & Name */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <span className="text-white font-black text-xl">H</span>
                    </div>
                    <div>
                        <h1 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">Fadel trading</h1>
                        <p className="text-[#2563EB] text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Plateforme Administration</p>
                    </div>
                </div>

                {/* Middle: Headline & Features */}
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-white font-black text-6xl uppercase tracking-tighter leading-[0.9] mb-12">
                        GÉREZ VOTRE <br />
                        <span className="text-[#2563EB]">BOUTIQUE</span> EN <br />
                        TEMPS RÉEL.
                    </h2>

                    <div className="space-y-6">
                        {[
                            { icon: Package, text: "Gestion d'inventaire en direct" },
                            { icon: LayoutGrid, text: "Catalogue & attributs produit" },
                            { icon: Smartphone, text: "Canal WhatsApp intégré" }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 group cursor-default">
                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#2563EB]/50 transition-all duration-300">
                                    <feature.icon className="w-5 h-5 text-[#2563EB]" />
                                </div>
                                <span className="text-gray-400 font-bold uppercase text-[11px] tracking-widest group-hover:text-white transition-colors">
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom: Version */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">V2.4 · INVENTORY MANAGEMENT SYSTEM</span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT SIDE — LOGIN FORM ───────────────────────────── */}
            <div
                className="flex-1 flex items-center justify-center p-6 min-h-screen"
                style={{
                    background: `
                        radial-gradient(
                            ellipse 80% 60% at 60% 50%,
                            rgba(37, 99, 235, 0.07) 0%,
                            rgba(37, 99, 235, 0.02) 40%,
                            transparent 70%
                        ),
                        #0c1020
                    `
                }}
            >
                {/* Mobile Logo */}
                <div className="lg:hidden flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-4">
                        <span className="text-white font-black text-2xl uppercase">H</span>
                    </div>
                    <h1 className="text-white font-black text-2xl uppercase tracking-tighter">Fadel trading <span className="text-[#2563EB]">ADMIN</span></h1>
                </div>

                <div
                    className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 bg-[#1a2035] border border-[#2563EB]/40 rounded-lg overflow-hidden"
                    style={{
                        boxShadow: '0 0 0 1px rgba(37, 99, 235,0.15), 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(37, 99, 235,0.04)'
                    }}
                >
                    <div className="bg-[#1a2035]">
                        <div className="h-1.5 bg-[#2563EB] w-full" />

                        <div className="p-12 space-y-6">
                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-3">
                                    Fadel trading <span className="text-[#2563EB]">ADMIN</span>
                                </h1>
                                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                    ACCÈS SÉCURISÉ AU TABLEAU DE BORD
                                </p>
                            </div>

                            <div className="border-t border-white/8 mb-8" />

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Professionnel</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@fadeltrading.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 pl-11 bg-[#1e2535] border border-white/10 hover:border-white/20 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 !text-gray-300 text-[14px] font-medium !placeholder:text-gray-400 !placeholder:font-medium rounded-sm transition-all duration-200 [&:-webkit-autofill]:bg-[#1e2535] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1e2535_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#d1d5db]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Mot de Passe</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-14 pl-11 bg-[#1e2535] border border-white/10 hover:border-white/20 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 !text-gray-300 text-[14px] font-medium !placeholder:text-gray-400 !placeholder:font-medium rounded-sm transition-all duration-200 [&:-webkit-autofill]:bg-[#1e2535] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1e2535_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#d1d5db]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 rounded-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black uppercase tracking-[0.25em] text-[13px] shadow-lg shadow-[#2563EB]/20 transition-all hover:-translate-y-0.5 border-b-2 border-blue-700 active:translate-y-0 active:border-b-0"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Se Connecter
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>

                            <div className="border-t border-white/8 mt-10 pt-5 text-center">
                                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.25em]">
                                    © 2026 Fadel trading · Digital Platform
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
