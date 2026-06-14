import React, { useState, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Plus,
    X,
    LayoutGrid,
    ChevronRight,
    Palette,
    Loader2,
    Trash2,
    Tags,
    Cylinder,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE, DOMAIN_BASE } from '@/config';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

const CategoryManagement = () => {
    const { categories, isLoading, refetch } = useCatalog({ showInactive: true });
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

    const [isSaving, setIsSaving] = useState(false);

    // Modals state
    const [modalConfig, setModalConfig] = useState<{
        open: boolean;
        type: 'cible' | 'type' | 'color';
        mode: 'add' | 'delete';
        data?: any;
    }>({ open: false, type: 'cible', mode: 'add' });

    const [newInputValue, setNewInputValue] = useState('');
    const [newArValue, setNewArValue] = useState('');

    const token = localStorage.getItem('accessToken');

    // Filtered data
    const cibles = categories.filter(c => !c.parentId);
    const types = selectedCategory ? categories.filter(c => c.parentId === selectedCategory.id) : [];
    const colors = selectedSubCategory ? (selectedSubCategory.colors || []) : [];

    const handleAdd = async () => {
        setIsSaving(true);
        try {
            if (modalConfig.type === 'color') {
                // Updating an existing category (the Type) to add a color
                const updatedColors = [...colors, newInputValue];
                const res = await fetch(`${API_BASE}/categories/${selectedSubCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ colors: updatedColors })
                });
                if (res.ok) {
                    toast.success('Attribut ajouté');
                    const updated = await res.json();
                    setSelectedSubCategory(updated.data);
                    refetch();
                }
            } else {
                // Creating a new category (Cible or Type)
                const payload = {
                    name: newInputValue,
                    nameAr: newArValue || newInputValue, // Fallback if no AR name
                    parentId: modalConfig.type === 'type' ? selectedCategory.id : undefined,
                    types: [],
                    colors: []
                };
                const res = await fetch(`${API_BASE}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    toast.success(modalConfig.type === 'cible' ? 'Catégorie créée' : 'Sous-catégorie créée');
                    refetch();
                } else {
                    const err = await res.json();
                    toast.error(err.message || 'Erreur lors de la création');
                }
            }
            setModalConfig({ ...modalConfig, open: false });
            setNewInputValue('');
            setNewArValue('');
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        try {
            if (modalConfig.type === 'color') {
                const updatedColors = colors.filter((c: string) => c !== modalConfig.data);
                const res = await fetch(`${API_BASE}/categories/${selectedSubCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ colors: updatedColors })
                });
                if (res.ok) {
                    toast.success('Attribut supprimé');
                    const updated = await res.json();
                    setSelectedSubCategory(updated.data);
                    refetch();
                }
            } else {
                const res = await fetch(`${API_BASE}/categories/${modalConfig.data.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    toast.success('Supprimé avec succès');
                    if (modalConfig.type === 'cible' && selectedCategory?.id === modalConfig.data.id) setSelectedCategory(null);
                    if (modalConfig.type === 'type' && selectedSubCategory?.id === modalConfig.data.id) setSelectedSubCategory(null);
                    refetch();
                } else {
                    const err = await res.json();
                    toast.error(err.message || 'Impossible de supprimer cet élément (peut-être contient-il des produits ou sous-catégories)');
                }
            }
            setModalConfig({ ...modalConfig, open: false });
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && categories.length === 0) return (
        <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                        CATALOGUE & <span className="text-[#2563EB]">ATTRIBUTS</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 leading-none">GESTION DE LA HIÉRARCHIE DU CATALOGUE</p>
                </div>
                <div className="bg-white p-2 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-sm w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 sm:border-r border-gray-50">
                        <div className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Mode Edition Live</span>
                    </div>
                    <Button
                        onClick={() => setModalConfig({ open: true, type: 'cible', mode: 'add' })}
                        className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-sm px-6 h-10 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Nouvelle Catégorie
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
                {/* 1. CATÉGORIES PRINCIPALES */}
                <Card className="rounded-sm border-gray-100 shadow-xl overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] bg-white md:col-span-1">
                    <CardHeader className="bg-gray-900 p-6 text-white border-b border-gray-800">
                        <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Tags className="w-4 h-4 text-[#2563EB]" /> 1. Catégories Principales
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">Familles principales du catalogue</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {cibles.map(cible => (
                                <div
                                    key={cible.id}
                                    className={`group flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-[#dbeafe] duration-150 ${selectedCategory?.id === cible.id ? 'bg-[#dbeafe]/50 border-l-[3px] border-l-[#2563EB] shadow-inner' : 'border-l-[3px] border-l-transparent'}`}
                                    onClick={() => {
                                        setSelectedCategory(cible);
                                        setSelectedSubCategory(null);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-black uppercase tracking-wide transition-colors group-hover:text-[#2563EB] ${selectedCategory?.id === cible.id ? 'text-[#2563EB]' : 'text-gray-600'}`}>{cible.name}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{cible.nameAr || '---'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalConfig({ open: true, type: 'cible', mode: 'delete', data: cible });
                                            }}
                                            className="p-2.5 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory?.id === cible.id ? 'translate-x-1 text-[#2563EB]' : 'text-gray-200'}`} />
                                    </div>
                                </div>
                            ))}
                            {cibles.length === 0 && (
                                <div className="p-16 text-center">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Aucune catégorie</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. SOUS-CATÉGORIES */}
                <Card className="rounded-sm border-gray-100 shadow-xl overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] relative bg-white">
                    {!selectedCategory && (
                        <div className="absolute inset-0 bg-white border border-gray-100 rounded-sm min-h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <Tags className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-3">SÉLECTIONNEZ UNE CATÉGORIE</p>
                        </div>
                    )}
                    <CardHeader className={`${selectedCategory ? 'bg-gray-800' : 'bg-gray-100'} p-6 text-white transition-colors border-b border-gray-700`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Cylinder className="w-4 h-4 text-[#2563EB]" /> 2. Sous-catégories
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                                    Sous-catégories pour {selectedCategory?.name || '...'}
                                </CardDescription>
                            </div>
                            {selectedCategory && (
                                <button
                                    onClick={() => setModalConfig({ open: true, type: 'type', mode: 'add' })}
                                    className="w-8 h-8 bg-[#2563EB] text-white flex items-center justify-center hover:bg-[#1D4ED8] transition-all rounded-sm shadow-md"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {types.map(type => (
                                <div
                                    key={type.id}
                                    className={`group flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-[#dbeafe] duration-150 ${selectedSubCategory?.id === type.id ? 'bg-[#dbeafe]/50 border-l-[3px] border-l-[#2563EB] shadow-inner' : 'border-l-[3px] border-l-transparent'}`}
                                    onClick={() => setSelectedSubCategory(type)}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-black uppercase tracking-wide transition-colors group-hover:text-[#2563EB] ${selectedSubCategory?.id === type.id ? 'text-[#2563EB]' : 'text-gray-600'}`}>{type.name}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{type.colors?.length || 0} ATTRIBUTS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalConfig({ open: true, type: 'type', mode: 'delete', data: type });
                                            }}
                                            className="p-2.5 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors rounded-full min-w-[2rem] min-h-[2rem] flex items-center justify-center"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedSubCategory?.id === type.id ? 'translate-x-1 text-[#2563EB]' : 'text-gray-200'}`} />
                                    </div>
                                </div>
                            ))}
                            {selectedCategory && types.length === 0 && (
                                <div className="p-16 text-center">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Aucune sous-catégorie</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. ATTRIBUTS TECHNIQUES */}
                <Card className="rounded-sm border-gray-100 shadow-xl overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] relative bg-white md:col-span-2 lg:col-span-1">
                    {!selectedSubCategory && (
                        <div className="absolute inset-0 bg-white border border-gray-100 rounded-sm min-h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <Palette className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-3">SÉLECTIONNEZ UNE SOUS-CATÉGORIE</p>
                        </div>
                    )}
                    <CardHeader className={`${selectedSubCategory ? 'bg-gray-900' : 'bg-gray-100'} p-6 text-white transition-colors border-b border-gray-800`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-[#2563EB]" /> 3. Attributs Techniques
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                                    Attributs pour {selectedSubCategory?.name || '...'}
                                </CardDescription>
                            </div>
                            {selectedSubCategory && (
                                <button
                                    onClick={() => setModalConfig({ open: true, type: 'color', mode: 'add' })}
                                    className="w-8 h-8 bg-[#2563EB] text-white flex items-center justify-center hover:bg-[#1D4ED8] transition-all rounded-sm shadow-md"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {colors.map((color: string) => (
                                <div key={color} className="group relative flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-sm shadow-sm transition-all hover:border-[#2563EB30]">
                                    <div
                                        className="w-5 h-5 shadow-inner border border-black/5 transition-transform group-hover:scale-110 rounded-sm"
                                        style={{ backgroundColor: '#2563EB15' }}
                                    />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-700 truncate">{color}</span>
                                    <button
                                        onClick={() => setModalConfig({ open: true, type: 'color', mode: 'delete', data: color })}
                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {selectedSubCategory && colors.length === 0 && (
                                <div className="col-span-2 p-16 text-center border-2 border-dashed border-gray-100 bg-gray-50 rounded-sm">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Aucun attribut</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MODALS */}
            <Dialog open={modalConfig.open} onOpenChange={(val) => setModalConfig({ ...modalConfig, open: val })}>
                <DialogContent className="rounded-2xl border-[#1F2937] bg-[#0F172A] max-w-lg shadow-2xl p-0 overflow-hidden text-white border-none">
                    <div className="bg-[#111827] p-8 text-white border-b border-[#1F2937] rounded-t-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-wider text-white">
                                {modalConfig.mode === 'add' ? (
                                    <>AJOUTER <span className="text-[#2563EB]">{modalConfig.type === 'cible' ? 'UNE CATÉGORIE' : modalConfig.type === 'type' ? 'UNE SOUS-CATÉGORIE' : 'UN ATTRIBUT'}</span></>
                                ) : (
                                    <>SUPPRIMER <span className="text-red-500">CONFIRMATION</span></>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">
                                {modalConfig.mode === 'add'
                                    ? 'Enrichissement du catalogue Fadel trading.'
                                    : 'Cette action supprimera définitivement l\'élément sélectionné.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 bg-[#0F172A]">
                        {modalConfig.mode === 'add' ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {modalConfig.type === 'color' ? "VALEUR DE L'ATTRIBUT (EX: 1000W, 300L)" : modalConfig.type === 'cible' ? 'NOM DE LA CATÉGORIE (FR)' : 'NOM DE LA SOUS-CATÉGORIE (FR)'}
                                    </Label>

                                    {modalConfig.type === 'color' ? (
                                        <Input
                                            value={newInputValue}
                                            onChange={(e) => setNewInputValue(e.target.value)}
                                            placeholder="Ex: 1000W, 300L, Samsung"
                                            className="w-full border-[#2D3748] rounded-sm px-3 py-2.5 text-[12px] text-white placeholder-gray-500 bg-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-colors duration-200 h-12 uppercase font-bold"
                                        />
                                    ) : (
                                        <Input
                                            value={newInputValue}
                                            onChange={(e) => setNewInputValue(e.target.value)}
                                            placeholder="Ex: Réfrigérateurs"
                                            className="w-full border-[#2D3748] rounded-sm px-3 py-2.5 text-[12px] text-white placeholder-gray-500 bg-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-colors duration-200 h-12 uppercase font-bold"
                                        />
                                    )}
                                </div>

                                {modalConfig.type !== 'color' && (
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right block">الاسم باللغة العربية (AR)</Label>
                                        <Input
                                            value={newArValue}
                                            onChange={(e) => setNewArValue(e.target.value)}
                                            placeholder="أدخل الاسم هنا..."
                                            className="w-full border-[#2D3748] rounded-sm px-3 py-2.5 text-lg text-white placeholder-gray-600 bg-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-colors duration-200 h-12 text-right dir-rtl font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-red-50 border border-red-100 rounded-sm mb-6">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-[16px] font-black text-gray-900 uppercase tracking-tight">{modalConfig.data?.name || modalConfig.data}</p>
                                <p className="text-[10px] text-red-500 mt-3 font-bold px-10 uppercase tracking-widest leading-relaxed">
                                    {modalConfig.type === 'color'
                                        ? "SUPPRESSION DÉFINITIVE DE L'ATTRIBUT."
                                        : 'VÉRIFIEZ L\'ABSENCE DE PRODUITS LIÉS.'}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 mt-10">
                            <Button
                                className="rounded-xl border-[#1F2937] bg-transparent hover:bg-[#111827] font-black uppercase text-[10px] tracking-[0.2em] h-14 flex-1 transition-all text-gray-500 border"
                                onClick={() => setModalConfig({ ...modalConfig, open: false })}
                            >
                                Annuler
                            </Button>
                            <Button
                                disabled={isSaving || (modalConfig.mode === 'add' && !newInputValue)}
                                onClick={modalConfig.mode === 'add' ? handleAdd : handleDelete}
                                className={`rounded-xl font-black uppercase text-[10px] tracking-[0.3em] h-14 flex-1 shadow-lg transition-all ${modalConfig.mode === 'add' ? 'bg-[#E6A37C] hover:bg-[#d4926b] text-[#0F172A] shadow-[#E6A37C]/10' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/10'}`}
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : modalConfig.mode === 'add' ? 'VALIDER' : 'CONFIRMER'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryManagement;
