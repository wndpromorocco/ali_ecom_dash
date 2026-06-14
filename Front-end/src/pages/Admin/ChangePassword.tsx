import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { API_BASE, DOMAIN_BASE } from '@/config';

const ChangePassword = () => {
    const ADMIN = import.meta.env.VITE_ADMIN_SLUG;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            if (res.ok) {
                toast.success('Mot de passe mis à jour. Veuillez vous reconnecter.');
                // Logout after password change for security
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate(`/${ADMIN}/login`);
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

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="mt-8">
                <div className="max-w-3xl">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(`/${ADMIN}/dashboard`)}
                        className="mb-8 text-gray-400 hover:text-[#2563EB] transition-colors p-0 hover:bg-transparent font-bold uppercase text-[10px] tracking-widest"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Dashboard
                    </Button>

                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 text-gray-900">
                        SÉCURITÉ <span className="text-[#2563EB]">ACCÈS</span>
                    </h1>

                    <Card className="border border-gray-100 rounded-sm shadow-2xl overflow-hidden bg-white">
                        <CardHeader className="bg-gray-900 text-white p-6 border-b border-gray-800">
                            <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Lock className="h-4 w-4 text-[#2563EB]" />
                                Modifier le Mot de Passe
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                                Assurez la sécurité de votre accès administrateur.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 bg-white">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mot de passe actuel</Label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrent ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="rounded-sm border-gray-200 h-12 pr-10 focus-visible:ring-[#2563EB] font-bold"
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
                                            className="rounded-sm border-gray-200 h-12 pr-10 focus-visible:ring-[#2563EB] font-bold"
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
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirmer le mot de passe</Label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="rounded-sm border-gray-200 h-12 focus-visible:ring-[#2563EB] font-bold"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-gray-900 hover:bg-black text-white rounded-sm font-black uppercase tracking-[0.2em] h-14 shadow-xl transition-all border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 text-xs"
                                >
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#2563EB]" />
                                    ) : (
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                    )}
                                    {isSaving ? "MISE À JOUR..." : "VALIDER LE CHANGEMENT"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
