import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    MessageSquare,
    Save,
    Loader2,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    Settings,
    CheckCircle2,
    Clock,
    ShieldAlert,
    Smartphone,
    MousePointer2,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { API_BASE, DOMAIN_BASE } from '@/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardSettings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'whatsapp';
    const [lastModified, setLastModified] = useState(new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }));

    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/settings/whatsapp_number`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.data?.value) setWhatsappNumber(json.data.value);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveWhatsapp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/settings/whatsapp`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ number: whatsappNumber })
            });

            if (res.ok) {
                toast.success('Configuration WhatsApp mise à jour');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Erreur lors de la mise à jour de la configuration WhatsApp');
            }
        } catch (error) {
            console.error('Network error:', error);
            toast.error('Erreur réseau. Veuillez vérifier votre connexion.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            if (res.ok) {
                toast.success('Mot de passe mis à jour');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await res.json();
                toast.error(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#db6513]" />
            </div>
        );
    }

    return (
        <div
            className="space-y-10 animate-in fade-in duration-500 min-h-full -m-8 p-8"
            style={{
                backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }}
        >
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                    PARAMÈTRES <span className="text-[#db6513]">GÉNÉRAUX</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 leading-none">CONFIGURATION GLOBALE DE LA PLATEFORME</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: FORM SIDE */}
                <div className="lg:col-span-5 space-y-8">
                    <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
                        <TabsList className="bg-white border border-gray-100 p-1 h-12 rounded-sm w-full shadow-sm">
                            <TabsTrigger
                                value="whatsapp"
                                className="flex-1 rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[#db651330] border border-transparent data-[state=inactive]:border-gray-100 data-[state=inactive]:text-gray-500 font-black uppercase text-[10px] tracking-widest gap-2 transition-all duration-200"
                            >
                                <MessageSquare className="w-3.5 h-3.5" /> WHATSAPP
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="flex-1 rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[#db651330] border border-transparent data-[state=inactive]:border-gray-100 data-[state=inactive]:text-gray-500 font-black uppercase text-[10px] tracking-widest gap-2 transition-all duration-200"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" /> SÉCURITÉ
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="whatsapp" className="focus-visible:outline-none m-0">
                                <Card className="rounded-sm border-gray-100 shadow-xl bg-white overflow-hidden">
                                    <CardHeader className="bg-gray-50 border-b border-gray-100 p-6 border-l-4 border-l-[#db6513]">
                                        <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-gray-900">
                                            <MessageSquare className="w-4 h-4 text-[#db6513]" />
                                            Lien de Contact Direct
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Numéro utilisé pour le support client et les commandes.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <form onSubmit={handleSaveWhatsapp} className="space-y-6">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Numéro WhatsApp Business</Label>
                                                <Input
                                                    value={whatsappNumber}
                                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-[14px] text-gray-700 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-12 font-bold"
                                                    placeholder="+212 6XXXXXXXX"
                                                />
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight italic pt-1 text-right">Format international requis</p>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full bg-[#db6513] hover:bg-[#c45610] text-white rounded-sm font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
                                            >
                                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                Sauvegarder les modifications
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security" className="focus-visible:outline-none m-0">
                                <Card className="rounded-sm border-gray-100 shadow-xl bg-white overflow-hidden">
                                    <CardHeader className="bg-gray-50 border-b border-gray-100 p-6 border-l-4 border-l-[#db6513]">
                                        <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-gray-900">
                                            <Lock className="w-4 h-4 text-[#db6513]" />
                                            Gestion des Accès
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Mettez à jour vos identifiants régulièrement.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <form onSubmit={handleSavePassword} className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mot de passe actuel</Label>
                                                <div className="relative">
                                                    <Input
                                                        type={showCurrent ? "text" : "password"}
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-[12px] text-gray-700 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-12 pr-10 font-bold"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrent(!showCurrent)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                                    >
                                                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nouveau mot de passe</Label>
                                                <div className="relative">
                                                    <Input
                                                        type={showNew ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-[12px] text-gray-700 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-12 pr-10 font-bold"
                                                        required
                                                        minLength={8}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNew(!showNew)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                                    >
                                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirmation</Label>
                                                <Input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-[12px] text-gray-700 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-12 font-bold"
                                                    required
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full bg-[#db6513] hover:bg-[#c45610] text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-sm transition-all shadow-md shadow-orange-100 active:scale-[0.98]"
                                            >
                                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                                Sauvegarder le nouveau mot de passe
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* RIGHT: DECORATIVE PANEL */}
                <div className="lg:col-span-7 hidden lg:block animate-in slide-in-from-right-10 duration-700 delay-150">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#db6513] to-orange-300 rounded-sm blur opacity-5 group-hover:opacity-10 transition duration-500"></div>
                        <div className="relative bg-[#161c2b] rounded-sm p-10 border border-white/5 shadow-2xl min-h-[500px] flex flex-col justify-between overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#db6513]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                            {activeTab === 'whatsapp' ? (
                                <>
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#db6513] rounded-sm mb-6">
                                            <Smartphone className="w-3.5 h-3.5 text-white" />
                                            <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Live Connection</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4 leading-none">
                                            Canal de Support <span className="text-[#db6513]">Direct</span>
                                        </h2>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md">
                                            Ce numéro est le point de contact central entre vos clients et votre boutique. Il alimente le bouton WhatsApp flottant et permet une gestion réactive de la relation client.
                                        </p>

                                        <div className="space-y-5 mb-10">
                                            {[
                                                { icon: MousePointer2, text: "Bouton flottant interactif sur la boutique" },
                                                { icon: Zap, text: "Lien de commande rapide via catalogue" },
                                                { icon: MessageSquare, text: "Support client en temps réel & SAV" },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 group/item">
                                                    <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-[#db6513]/50 transition-all">
                                                        <item.icon className="w-4 h-4 text-[#db6513]" />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mock WhatsApp Bubble */}
                                    <div className="mt-auto pt-10 border-t border-white/5 flex items-end justify-end">
                                        <div className="bg-[#25d366] p-4 rounded-2xl rounded-br-none max-w-[240px] shadow-lg relative transform -rotate-1 hover:rotate-0 transition-transform cursor-default">
                                            <p className="text-white text-[12px] font-bold leading-tight">
                                                Bonjour Hermado ! Je souhaite commander le modèle "Luxury Leather" en taille 42. Est-il disponible ?
                                            </p>
                                            <span className="absolute bottom-1 right-2 text-[9px] text-white/70 font-bold">14:32</span>
                                            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-[#db6513]/10 rounded-full blur-xl animate-pulse"></div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-sm mb-6 shadow-lg shadow-red-900/40">
                                            <ShieldAlert className="w-3.5 h-3.5 text-white" />
                                            <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Protection Active</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4 leading-none">
                                            Bonnes Pratiques <span className="text-[#db6513]">Sécurité</span>
                                        </h2>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-md">
                                            La sécurité de vos données administrateur est primordiale pour la continuité de votre activité. Suivez ces protocoles pour une protection optimale.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-10">
                                            {[
                                                { icon: Lock, text: "Changez votre mot de passe tous les 90 jours" },
                                                { icon: CheckCircle2, text: "Utilisez 12+ caractères avec symboles spéciaux" },
                                                { icon: ShieldCheck, text: "Ne partagez jamais vos identifiants d'accès" },
                                                { icon: ShieldAlert, text: "Déconnectez-vous après chaque session de travail" },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 rounded-sm bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all cursor-default group/item">
                                                    <item.icon className="w-4 h-4 text-[#db6513]" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#db6513] flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Dernière Maintenance</p>
                                                <p className="text-[11px] font-black text-white uppercase mt-1 leading-none">{lastModified}</p>
                                            </div>
                                        </div>
                                        <div className="w-20 h-1 bg-[#db6513] rounded-full opacity-30 shadow-2xl shadow-[#db6513]"></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSettings;
