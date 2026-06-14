import React, { useState, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from 'react-colorful';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLOR_GROUPS = {
    Classique: [
        { name: 'Noir', hex: '#000000' },
        { name: 'Brun', hex: '#5C2E00' },
        { name: 'Camel', hex: '#C19A6B' },
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Marine', hex: '#000080' },
        { name: 'Gris Anthracite', hex: '#36454F' }
    ],
    Sport: [
        { name: 'Blanc', hex: '#FFFFFF' },
        { name: 'Gris Clair', hex: '#D3D3D3' },
        { name: 'Rouge Hermado', hex: '#E63946' },
        { name: 'Bleu Sport', hex: '#1D3557' },
        { name: 'Vert Forêt', hex: '#2D6A4F' },
        { name: 'Orange', hex: '#F4A261' }
    ],
    Autres: [
        { name: 'Or', hex: '#db6513' },
        { name: 'Argent', hex: '#C0C0C0' },
        { name: 'Bordeaux', hex: '#800020' },
        { name: 'Taupe', hex: '#483C32' },
        { name: 'Vert Pastel', hex: '#B7E4C7' },
        { name: 'Rose Poudré', hex: '#FFD1DC' }
    ]
};

const CategoryManagement = () => {
    const { categories, isLoading, refetch } = useCatalog({ showInactive: true });
    const [selectedCible, setSelectedCible] = useState<any>(null);
    const [selectedType, setSelectedType] = useState<any>(null);

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
    const types = selectedCible ? categories.filter(c => c.parentId === selectedCible.id) : [];
    const colors = selectedType ? (selectedType.colors || []) : [];

    const handleAdd = async () => {
        setIsSaving(true);
        try {
            if (modalConfig.type === 'color') {
                // Updating an existing category (the Type) to add a color
                const updatedColors = [...colors, newInputValue];
                const res = await fetch(`${API_BASE}/categories/${selectedType.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ colors: updatedColors })
                });
                if (res.ok) {
                    toast.success('Couleur ajoutée');
                    const updated = await res.json();
                    setSelectedType(updated.data);
                    refetch();
                }
            } else {
                // Creating a new category (Cible or Type)
                const payload = {
                    name: newInputValue,
                    nameAr: newArValue || newInputValue, // Fallback if no AR name
                    parentId: modalConfig.type === 'type' ? selectedCible.id : undefined,
                    types: [],
                    colors: []
                };
                const res = await fetch(`${API_BASE}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    toast.success(modalConfig.type === 'cible' ? 'Cible créée' : 'Modèle créé');
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
                const res = await fetch(`${API_BASE}/categories/${selectedType.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ colors: updatedColors })
                });
                if (res.ok) {
                    toast.success('Couleur supprimée');
                    const updated = await res.json();
                    setSelectedType(updated.data);
                    refetch();
                }
            } else {
                const res = await fetch(`${API_BASE}/categories/${modalConfig.data.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    toast.success('Supprimé avec succès');
                    if (modalConfig.type === 'cible' && selectedCible?.id === modalConfig.data.id) setSelectedCible(null);
                    if (modalConfig.type === 'type' && selectedType?.id === modalConfig.data.id) setSelectedType(null);
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
            <Loader2 className="h-8 w-8 animate-spin text-[#db6513]" />
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                        CATALOGUE & <span className="text-[#db6513]">ATTRIBUTS</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 leading-none">GESTION DE LA HIÉRARCHIE DU CATALOGUE</p>
                </div>
                <div className="bg-white p-2 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-sm w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 sm:border-r border-gray-50">
                        <div className="w-2 h-2 rounded-full bg-[#db6513] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Mode Edition Live</span>
                    </div>
                    <Button
                        onClick={() => setModalConfig({ open: true, type: 'cible', mode: 'add' })}
                        className="w-full sm:w-auto bg-[#db6513] hover:bg-[#c45610] text-white rounded-sm px-6 h-10 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Nouvelle Cible
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
                {/* 1. CIBLES (Hommes, Femmes, etc.) */}
                <Card className="rounded-sm border-gray-100 shadow-xl overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] bg-white md:col-span-1">
                    <CardHeader className="bg-gray-900 p-6 text-white border-b border-gray-800">
                        <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Tags className="w-4 h-4 text-[#db6513]" /> 1. Cibles (Cible)
                        </CardTitle>
                        <CardDescription className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">Secteurs principaux de vente</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-50">
                            {cibles.map(cible => (
                                <div
                                    key={cible.id}
                                    className={`group flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-[#fdf0e8] duration-150 ${selectedCible?.id === cible.id ? 'bg-[#fdf0e8]/50 border-l-[3px] border-l-[#db6513] shadow-inner' : 'border-l-[3px] border-l-transparent'}`}
                                    onClick={() => {
                                        setSelectedCible(cible);
                                        setSelectedType(null);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-black uppercase tracking-wide transition-colors group-hover:text-[#db6513] ${selectedCible?.id === cible.id ? 'text-[#db6513]' : 'text-gray-600'}`}>{cible.name}</span>
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
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedCible?.id === cible.id ? 'translate-x-1 text-[#db6513]' : 'text-gray-200'}`} />
                                    </div>
                                </div>
                            ))}
                            {cibles.length === 0 && (
                                <div className="p-16 text-center">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Aucune cible</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. TYPES (Sneakers, Bottes, etc.) */}
                <Card className="rounded-sm border-gray-100 shadow-xl overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] relative bg-white">
                    {!selectedCible && (
                        <div className="absolute inset-0 bg-white border border-gray-100 rounded-sm min-h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <Tags className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-3">SÉLECTIONNEZ UNE CIBLE</p>
                        </div>
                    )}
                    <CardHeader className={`${selectedCible ? 'bg-gray-800' : 'bg-gray-100'} p-6 text-white transition-colors border-b border-gray-700`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Cylinder className="w-4 h-4 text-[#db6513]" /> 2. Modèles (Type)
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                                    Sous-catégories pour {selectedCible?.name || '...'}
                                </CardDescription>
                            </div>
                            {selectedCible && (
                                <button
                                    onClick={() => setModalConfig({ open: true, type: 'type', mode: 'add' })}
                                    className="w-8 h-8 bg-[#db6513] text-white flex items-center justify-center hover:bg-[#c45610] transition-all rounded-sm shadow-md"
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
                                    className={`group flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-[#fdf0e8] duration-150 ${selectedType?.id === type.id ? 'bg-[#fdf0e8]/50 border-l-[3px] border-l-[#db6513] shadow-inner' : 'border-l-[3px] border-l-transparent'}`}
                                    onClick={() => setSelectedType(type)}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-black uppercase tracking-wide transition-colors group-hover:text-[#db6513] ${selectedType?.id === type.id ? 'text-[#db6513]' : 'text-gray-600'}`}>{type.name}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{type.colors?.length || 0} COULEURS</span>
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
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedType?.id === type.id ? 'translate-x-1 text-[#db6513]' : 'text-gray-200'}`} />
                                    </div>
                                </div>
                            ))}
                            {selectedCible && types.length === 0 && (
                                <div className="p-16 text-center">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Aucun modèle</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. COLORS (Palette de Couleurs) */}
                <Card className="rounded-sm border-gray-100 shadow-xl overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] relative bg-white md:col-span-2 lg:col-span-1">
                    {!selectedType && (
                        <div className="absolute inset-0 bg-white border border-gray-100 rounded-sm min-h-[400px] flex flex-col items-center justify-center p-8 text-center opacity-60">
                            <Palette className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-3">SÉLECTIONNEZ UN MODÈLE</p>
                        </div>
                    )}
                    <CardHeader className={`${selectedType ? 'bg-gray-900' : 'bg-gray-100'} p-6 text-white transition-colors border-b border-gray-800`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-[#db6513]" /> 3. Palette de Couleurs
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                                    Variantes pour {selectedType?.name || '...'}
                                </CardDescription>
                            </div>
                            {selectedType && (
                                <button
                                    onClick={() => setModalConfig({ open: true, type: 'color', mode: 'add' })}
                                    className="w-8 h-8 bg-[#db6513] text-white flex items-center justify-center hover:bg-[#c45610] transition-all rounded-sm shadow-md"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {colors.map((color: string) => (
                                <div key={color} className="group relative flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-sm shadow-sm transition-all hover:border-[#db651330]">
                                    <div
                                        className="w-5 h-5 shadow-inner border border-black/5 transition-transform group-hover:scale-110 rounded-sm"
                                        style={{ backgroundColor: color.toLowerCase() }}
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
                            {selectedType && colors.length === 0 && (
                                <div className="col-span-2 p-16 text-center border-2 border-dashed border-gray-100 bg-gray-50 rounded-sm">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Palette vide</p>
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
                                    <>AJOUTER <span className="text-[#db6513]">{modalConfig.type === 'cible' ? 'UNE CIBLE' : modalConfig.type === 'type' ? 'UN MODÈLE' : 'UNE COULEUR'}</span></>
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
                                        {modalConfig.type === 'color' ? 'SÉLECTIONNEZ UNE COULEUR' : 'NOM DU MODÈLE (FR)'}
                                    </Label>

                                    {modalConfig.type === 'color' ? (
                                        <Tabs defaultValue="Classique" className="w-full mt-2">
                                            <TabsList className="grid grid-cols-3 bg-gray-50 border border-gray-100 p-1 h-10 rounded-sm mb-6">
                                                {Object.keys(COLOR_GROUPS).map(group => (
                                                    <TabsTrigger
                                                        key={group}
                                                        value={group}
                                                        className="rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white font-black uppercase text-[9px] tracking-widest transition-all text-gray-400 bg-[#2D3748]/30"
                                                    >
                                                        {group}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>

                                            {Object.entries(COLOR_GROUPS).map(([group, list]) => (
                                                <TabsContent key={group} value={group} className="focus-visible:outline-none">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        {list.map(c => (
                                                            <button
                                                                key={c.hex}
                                                                type="button"
                                                                onClick={() => setNewInputValue(c.name)}
                                                                className={`flex items-center gap-2 p-2.5 border transition-all rounded-sm shadow-sm ${newInputValue === c.name ? 'border-[#db6513] bg-[#db6513]/10 ring-1 ring-[#db6513]' : 'border-[#2D3748] bg-[#111827] hover:border-[#db6513]/50'}`}
                                                            >
                                                                <div className="w-4 h-4 border border-black/20 rounded-sm" style={{ backgroundColor: c.hex }} />
                                                                <span className="text-[9px] font-black text-gray-200 uppercase truncate tracking-tight">{c.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </TabsContent>
                                            ))}

                                            <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-col items-center">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E6A37C] mb-6 block w-full text-left">Palette Visuelle & Signature</Label>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                                                    <div className="custom-color-picker shadow-2xl rounded-2xl overflow-hidden border border-[#1F2937] bg-[#111827] p-2">
                                                        <HexColorPicker
                                                            color={newInputValue.startsWith('#') ? newInputValue : '#ffffff'}
                                                            onChange={setNewInputValue}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-4 w-full">
                                                        <div className="flex items-center gap-4 p-5 bg-[#111827] rounded-2xl border border-[#1F2937] shadow-inner">
                                                            <div
                                                                className="w-14 h-14 rounded-xl shadow-xl border-2 border-white/10 transition-transform duration-500 transform hover:scale-105"
                                                                style={{ backgroundColor: newInputValue.startsWith('#') ? newInputValue : (Object.values(COLOR_GROUPS).flat().find(c => c.name === newInputValue)?.hex || '#FFFFFF') }}
                                                            />
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Aperçu Couleur</span>
                                                                <span className="text-sm font-mono font-black text-[#E6A37C] uppercase tracking-widest">{newInputValue}</span>
                                                            </div>
                                                        </div>

                                                        <div className="relative group">
                                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                                <span className="text-[#E6A37C] font-black text-xs">HEX</span>
                                                            </div>
                                                            <Input
                                                                value={newInputValue.startsWith('#') ? newInputValue.substring(1) : newInputValue}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || /^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                                        setNewInputValue(val.startsWith('#') ? val : `#${val}`);
                                                                    }
                                                                }}
                                                                placeholder="FFFFFF"
                                                                className="pl-12 w-full border-[#1F2937] rounded-xl text-[13px] text-white bg-[#111827] focus:border-[#E6A37C] focus:ring-1 focus:ring-[#E6A37C]/20 transition-all h-12 font-mono uppercase tracking-widest"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tabs>
                                    ) : (
                                        <Input
                                            value={newInputValue}
                                            onChange={(e) => setNewInputValue(e.target.value)}
                                            placeholder="Ex: Sneakers de Luxe"
                                            className="w-full border-[#2D3748] rounded-sm px-3 py-2.5 text-[12px] text-white placeholder-gray-500 bg-[#111827] focus:outline-none focus:border-[#db6513] focus:ring-2 focus:ring-[#db6513]/10 transition-colors duration-200 h-12 uppercase font-bold"
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
                                            className="w-full border-[#2D3748] rounded-sm px-3 py-2.5 text-lg text-white placeholder-gray-600 bg-[#111827] focus:outline-none focus:border-[#db6513] focus:ring-2 focus:ring-[#db6513]/10 transition-colors duration-200 h-12 text-right dir-rtl font-bold"
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
                                        ? 'SUPPRESSION DÉFINITIVE DE LA PALETTE.'
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
