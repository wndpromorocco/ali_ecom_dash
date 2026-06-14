import React, { useState, useEffect } from 'react';
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Trash2,
    Upload,
    Save,
    Pencil,
    Settings,
    Ruler,
    Palette,
    Percent,
    Loader2,
    Package,
    TrendingDown,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    Image as ImageIcon,
    History,
    Calendar,
    Clock,
    X,
    Search,
    ChevronDown,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { API_BASE, DOMAIN_BASE } from '@/config';
import { getValidCssColor } from '@/lib/utils';


const SHOE_CATEGORIES = ["Femmes", "Hommes", "Enfants"];

/* ─────────────────────────────────────────────────────────────────────────────
   UX IMPROVEMENTS (zero functional changes):
   1.  Stats always visible — even when the form is open, shown in compact row
   2.  Form split into clearly labeled steps/sections with visual dividers
   3.  Image upload area uses a sensible fixed height instead of aspect-[330/495]
   4.  Color picker is horizontally scrollable on small screens — no overflow
   5.  Submit button has normal padding (no py-10 monster height)
   6.  Delete uses a custom inline confirm prompt instead of blocking confirm()
   7.  Inventory table has search + live filter
   8.  Inventory table has a proper empty-state illustration
   9.  Table has skeleton loading rows while isLoading is true
   10. Promotion Switch uses consistent orange styling
   11. Form header is sticky so the section title is always visible while scrolling
   12. Responsive grid breakpoints tightened — no field overflow on md viewports
───────────────────────────────────────────────────────────────────────────── */

const ProductManagement = ({ isAddingNewDefault = false }: { isAddingNewDefault?: boolean }) => {
    const ADMIN = import.meta.env.VITE_ADMIN_SLUG;
    const { products, categories, isLoading, refetch } = useCatalog({ showInactive: true });
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isAddingNew, setIsAddingNew] = useState(isAddingNewDefault);
    const [isPromotion, setIsPromotion] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(0);

    const formatTo24h = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // FIX #6 — replace blocking confirm() with tracked state
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // FIX #7 — table search state
    const [tableSearch, setTableSearch] = useState('');

    const initialFormState = {
        name: '',
        nameAr: '',
        description: '',
        price: '',
        discountPrice: '',
        promoStart: '',
        promoEnd: '',
        colors: [] as string[],
        type: '',
        warranty: '',
        categoryId: '',
        sku: '',
        images: ['', '', '', ''],
        isActive: true,
        quantity: 10,
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        const originalPrice = parseFloat(formData.price) || 0;
        const promoPrice = parseFloat(formData.discountPrice) || 0;

        if (originalPrice > 0 && promoPrice > 0) {
            const calculation = ((originalPrice - promoPrice) / originalPrice) * 100;
            setDiscountPercent(Math.round(calculation));
        } else {
            setDiscountPercent(0);
        }
    }, [formData.price, formData.discountPrice]);
    const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(['', '', '', '']);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [availableColors, setAvailableColors] = useState<string[]>([]);

    // Summary Statistics
    const stats = {
        total: products.length,
        promos: products.filter(p => {
            const now = new Date();
            const start = p.promoStart ? new Date(p.promoStart) : null;
            const end = p.promoEnd ? new Date(p.promoEnd) : null;
            const hasPromoPrice = (p as any).discountPrice > 0;
            const isDateValid = (!start || now >= start) && (!end || now <= end);
            return hasPromoPrice && isDateValid;
        }).length,
        outOfStock: products.filter(p => (p as any).quantity === 0).length,
    };

    useEffect(() => {
        if (isAddingNewDefault) {
            setIsAddingNew(true);
            setEditingProduct(null);
            setFormData(initialFormState);
            setImagePreviews(['', '', '', '']);
            setImageFiles([null, null, null, null]);
        }
    }, [isAddingNewDefault]);

    const cibles = categories.filter((c: any) => !c.parentId);

    useEffect(() => {
        if (formData.categoryId && categories.length > 0) {
            const subTypes = categories.filter((c: any) => c.parentId === formData.categoryId);
            setAvailableTypes(subTypes.map(t => t.name));
            if (formData.type) {
                const selectedTypeCat = subTypes.find(t => t.name === formData.type);
                if (selectedTypeCat) {
                    setAvailableColors(selectedTypeCat.colors || []);
                } else {
                    // Fallback: If editing, keep colors available even if type cat matches partially
                    setAvailableColors(editingProduct?.colors || []);
                }
            } else {
                setAvailableColors(editingProduct?.colors || []);
            }
        } else {
            setAvailableTypes([]);
            setAvailableColors(editingProduct?.colors || []);
        }
    }, [formData.categoryId, formData.type, categories, editingProduct]);

    const handleEdit = (product: any) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingProduct(product);
        setIsPromotion(!!product.discountPrice);
        const currentImages = Array.isArray(product.images) ? product.images : [];
        const formImages = [...currentImages];
        while (formImages.length < 4) formImages.push('');
        setFormData({
            name: product.name,
            nameAr: product.nameAr || '',
            description: product.description || '',
            price: product.price.toString(),
            discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
            promoStart: product.promoStart ? formatTo24h(product.promoStart) : '',
            promoEnd: product.promoEnd ? formatTo24h(product.promoEnd) : '',
            colors: Array.isArray(product.colors)
                ? product.colors
                : (typeof product.color === 'string' && product.color.length > 0
                    ? product.color.split(',').map((c: string) => c.trim())
                    : []),
            type: product.type || '',
            // loaded from the existing `size` DB column, now repurposed for warranty
            warranty: product.size || '',
            categoryId: product.categoryId,
            sku: product.sku,
            images: formImages as string[],
            isActive: product.isActive ?? true,
            quantity: product.quantity ?? 10,
        });
        setImagePreviews(formImages);
        setImageFiles([null, null, null, null]);
        setIsAddingNew(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const newPreviews = [...imagePreviews];
            newPreviews[index] = reader.result as string;
            setImagePreviews(newPreviews);
        };
        reader.readAsDataURL(file);
        const newFiles = [...imageFiles];
        newFiles[index] = file;
        setImageFiles(newFiles);
    };

    const removeImage = (index: number) => {
        const newFiles = [...imageFiles];
        newFiles[index] = null;
        setImageFiles(newFiles);
        const newPreviews = [...imagePreviews];
        newPreviews[index] = '';
        setImagePreviews(newPreviews);
        const newImages = [...formData.images];
        newImages[index] = '';
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'images') return;
                if (key === 'colors') { fd.append(key, JSON.stringify(value)); return; }
                if (key === 'tags') { fd.append(key, JSON.stringify(value)); return; }
                if (key === 'price') { fd.append(key, formData.price); return; }
                if (key === 'discountPrice' && isPromotion) { fd.append(key, formData.discountPrice || ''); return; }
                if (key === 'isActive') { fd.append(key, value.toString()); return; }
                // 'warranty' is persisted via the existing 'size' DB column (avoids a schema migration)
                if (key === 'warranty') { fd.append('size', value as string); return; }
                fd.append(key, value as string);
            });
            imageFiles.forEach((file) => { if (file) fd.append('images', file); });
            if (editingProduct && !imageFiles.some(f => f !== null)) {
                (formData.images as string[]).forEach(img => { if (img.trim() !== '') fd.append('images', img); });
            }
            const url = editingProduct
                ? `${API_BASE}/products/${editingProduct.id}`
                : `${API_BASE}/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            if (res.ok) {
                toast.success(editingProduct ? 'Produit mis à jour' : 'Produit créé avec succès');
                setIsAddingNew(false);
                setEditingProduct(null);
                setFormData(initialFormState);
                setImageFiles([null, null, null, null]);
                setImagePreviews(['', '', '', '']);
                refetch();
            } else {
                const errorResponse = await res.json();
                toast.error(errorResponse.message || 'Erreur lors de l\'enregistrement');
            }
        } catch {
            toast.error('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    // FIX #7 — filtered products for table
    const filteredProducts = products.filter(p => {
        if (!tableSearch.trim()) return true;
        const q = tableSearch.toLowerCase();
        return (
            p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            (p as any).category?.toLowerCase().includes(q)
        );
    });

    // FIX #6 — inline delete handler
    const handleDelete = async (productId: string) => {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success('Modèle retiré de l\'inventaire');
            refetch();
        }
        setDeleteConfirmId(null);
    };
    return (
        <div className="space-y-6">

            {/* ── PAGE HEADER & ACTIONS ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[24px] font-black uppercase tracking-tight text-gray-900 leading-none">
                        Registre d'Inventaire
                    </h1>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-1.5 leading-none">
                        Gestion des stocks et visibilité temps réel
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setIsAddingNew(!isAddingNew);
                            if (isAddingNew) {
                                setEditingProduct(null);
                                setFormData(initialFormState);
                            }
                        }}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-sm transition-all shadow-md hover:-translate-y-0.5 ${isAddingNew
                            ? 'border-2 border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 bg-transparent'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[#2563EB30]'
                            }`}
                    >
                        {isAddingNew
                            ? <><XCircle className="h-4 w-4" /> ANNULER</>
                            : <><Plus className="h-4 w-4" /> NOUVEAU PRODUIT</>
                        }
                    </Button>
                </div>
            </div>

            {/* ── STATS — always visible (compact when form is open) ─── */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 transition-all duration-300 ${isAddingNew ? 'opacity-70' : ''}`}>
                <Card className="bg-white border border-gray-100 rounded-sm px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total Produits</p>
                        <p className="text-[28px] font-black text-gray-900 leading-none mt-0.5">{stats.total}</p>
                    </div>
                </Card>
                <Card className="bg-white border border-gray-100 rounded-sm px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Promotions Actives</p>
                        <p className="text-[28px] font-black text-gray-900 leading-none mt-0.5">{stats.promos}</p>
                    </div>
                </Card>
                <Card className="bg-white border border-gray-100 rounded-sm px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-200">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">En Rupture</p>
                        <p className="text-[28px] font-black text-gray-900 leading-none mt-0.5">{stats.outOfStock}</p>
                    </div>
                </Card>
            </div>

            {/* ── ADD / EDIT FORM ───────────────────────────────────── */}
            {isAddingNew && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-400">
                    <form onSubmit={handleSubmit}>
                        <Card className="border border-gray-100 rounded-sm shadow-xl overflow-hidden">

                            {/* FIX #11: sticky form header with responsive top offset */}
                            <div className="bg-gray-900 border-l-4 border-[#2563EB] px-6 py-4 flex items-center justify-between text-white sticky top-[56px] lg:top-[48px] z-30">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-wider">
                                        {editingProduct ? 'MODIFIER LE PRODUIT' : 'AJOUTER UNE PIÈCE'}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        Configurez les détails techniques du modèle.
                                    </CardDescription>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                                    <History className="h-4 w-4 text-[#2563EB]" />
                                </div>
                            </div>

                            <CardContent className="p-0 bg-white">
                                <div className="grid grid-cols-1 lg:grid-cols-12">

                                    {/* ── LEFT: Media & Status ─────────────────────────── */}
                                    <div className="lg:col-span-4 p-6 border-r border-gray-100 space-y-6">

                                        {/* Section label */}
                                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                            <ImageIcon className="h-3.5 w-3.5 text-[#2563EB]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Médias & Statut</span>
                                        </div>

                                        {/* FIX #3: sensible fixed height for primary image, not aspect-[330/495] */}
                                        <div>
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 block">
                                                Photo Principale
                                            </Label>
                                            <div className="group relative h-48 sm:h-52 bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-[#3B82F6]/60 rounded-sm">
                                                {imagePreviews[0] ? (
                                                    <>
                                                        <img
                                                            src={imagePreviews[0].startsWith('http') || imagePreviews[0].startsWith('data:') ? imagePreviews[0] : `${DOMAIN_BASE}${imagePreviews[0]}`}
                                                            alt="Principal"
                                                            className="w-full h-full object-contain p-3"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-2 right-2 rounded-sm h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeImage(0)}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <label className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center">
                                                            <Upload className="h-5 w-5 text-[#3B82F6]" />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            Cliquer pour uploader
                                                        </p>
                                                        <p className="text-[8px] text-gray-300 uppercase tracking-widest">PNG, JPG — max 5MB</p>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(0, e)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gallery */}
                                        <div>
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3 block">
                                                Galerie (3 angles)
                                            </Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[1, 2, 3].map((idx) => (
                                                    <div key={idx} className="group relative aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden transition-all hover:border-[#3B82F6]/50 rounded-sm">
                                                        {imagePreviews[idx] ? (
                                                            <>
                                                                <img
                                                                    src={imagePreviews[idx].startsWith('http') || imagePreviews[idx].startsWith('data:') ? imagePreviews[idx] : `${DOMAIN_BASE}${imagePreviews[idx]}`}
                                                                    alt={`Angle ${idx}`}
                                                                    className="w-full h-full object-contain p-1.5"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/75 flex items-center justify-center"
                                                                    onClick={() => removeImage(idx)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-white" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                                                <Plus className="h-5 w-5 text-gray-300" />
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(idx, e)} />
                                                            </label>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status toggles */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-sm divide-y divide-gray-100">
                                            <div className="flex items-center justify-between px-4 py-3.5">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">Statut Live</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Visible sur le catalogue</p>
                                                </div>
                                                <Switch
                                                    checked={formData.isActive}
                                                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))}
                                                    className="data-[state=checked]:bg-[#2563EB]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3.5">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-800">Disponibilité Stock</p>
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${formData.quantity > 0 ? 'text-gray-400' : 'text-red-500'}`}>
                                                        {formData.quantity > 0 ? 'En Stock' : 'Épuisé'}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={formData.quantity > 0}
                                                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, quantity: val ? 10 : 0 }))}
                                                    className="data-[state=checked]:bg-[#2563EB]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── RIGHT: Information ───────────────────────────── */}
                                    <div className="lg:col-span-8 p-6 space-y-8">

                                        {/* ── Section 1: Identité ─────────────────────── */}
                                        <div>
                                            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                                                <Package className="h-3.5 w-3.5 text-[#2563EB]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">01 — Identité du Modèle</span>
                                            </div>

                                            {/* FIX #12: tighter responsive grid, was md:grid-cols-2 only */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Nom du Modèle (FR)</Label>
                                                    <Input
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="h-10 rounded-sm border-gray-200 text-[12px] font-bold focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700 text-right block">اسم المنتج (AR)</Label>
                                                    <Input
                                                        name="nameAr"
                                                        value={formData.nameAr}
                                                        onChange={handleInputChange}
                                                        dir="rtl"
                                                        className="h-10 rounded-sm border-gray-200 text-[12px] font-bold text-right focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Description & Spécifications</Label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    className="w-full min-h-[100px] px-3 py-2.5 border border-gray-200 rounded-sm text-[12px] text-gray-700 placeholder-gray-300 bg-white resize-none focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                                                    placeholder="Spécifications techniques, garantie, puissance (Watt)..."
                                                />
                                            </div>
                                        </div>

                                        {/* ── Section 2: Classification ────────────────── */}
                                        <div>
                                            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                                                <Ruler className="h-3.5 w-3.5 text-[#2563EB]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">02 — Classification & Référence</span>
                                            </div>

                                            {/* FIX #12: 4 cols on lg, 2 cols on sm, 1 on xs */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Cible / Rubrique</Label>
                                                    <Select value={formData.categoryId} onValueChange={(val) => setFormData(p => ({ ...p, categoryId: val }))}>
                                                        <SelectTrigger className="h-10 rounded-sm border-gray-200 text-[11px] font-black uppercase tracking-widest cursor-pointer focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100">
                                                            <SelectValue placeholder="Choisir..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-sm border-gray-100">
                                                            {cibles.map((cat: any) => (
                                                                <SelectItem key={cat.id} value={cat.id} className="uppercase text-[10px] font-black tracking-widest">
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Modèle / Type</Label>
                                                    <Select value={formData.type} onValueChange={(val) => setFormData(p => ({ ...p, type: val }))}>
                                                        <SelectTrigger className="h-10 rounded-sm border-gray-200 text-[11px] font-black uppercase tracking-widest cursor-pointer focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100">
                                                            <SelectValue placeholder="Choisir..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-sm border-gray-100">
                                                            {availableTypes.length > 0 ? availableTypes.map((type) => (
                                                                <SelectItem key={type} value={type} className="uppercase text-[10px] font-black tracking-widest">
                                                                    {type}
                                                                </SelectItem>
                                                            )) : (
                                                                <SelectItem value="none" disabled className="uppercase text-[10px] font-black tracking-widest text-gray-400">
                                                                    Aucun type disponible
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">SKU / Référence</Label>
                                                    <Input
                                                        name="sku"
                                                        value={formData.sku}
                                                        onChange={handleInputChange}
                                                        className="h-10 rounded-sm border-gray-200 text-[12px] font-bold focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-700">Garantie (Mois / Ans)</Label>
                                                    <Input
                                                        name="warranty"
                                                        value={formData.warranty}
                                                        onChange={handleInputChange}
                                                        placeholder="12 mois / 2 ans"
                                                        className="h-10 rounded-sm border-gray-200 text-[12px] font-bold focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Section 3: Prix & Promotion ──────────────── */}
                                        <div>
                                            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                                                <Percent className="h-3.5 w-3.5 text-[#2563EB]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">03 — Prix & Promotion</span>
                                            </div>

                                            <div className="bg-[#dbeafe] border border-blue-100 rounded-sm p-5 space-y-5">
                                                {/* FIX #10: consistent promotion switch styling */}
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={isPromotion}
                                                        onCheckedChange={setIsPromotion}
                                                        className="data-[state=checked]:bg-[#2563EB] data-[state=unchecked]:bg-gray-200"
                                                    />
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8] cursor-pointer flex items-center gap-1.5">
                                                        <Percent className="h-3.5 w-3.5" />
                                                        Appliquer une Promotion active
                                                    </Label>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prix Original (MAD)</Label>
                                                        <Input
                                                            name="price"
                                                            value={formData.price}
                                                            onChange={handleInputChange}
                                                            className="h-11 rounded-sm border-gray-200 text-base font-black tracking-wide bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-100"
                                                            required
                                                        />
                                                    </div>
                                                    {isPromotion && (
                                                        <div className="space-y-1.5 animate-in zoom-in-95 duration-200">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#2563EB]">Prix Promo (MAD)</Label>
                                                            <Input
                                                                name="discountPrice"
                                                                value={formData.discountPrice}
                                                                onChange={handleInputChange}
                                                                className="h-11 rounded-sm border-[#3B82F6] border-2 text-base font-black bg-white focus:ring-2 focus:ring-blue-100"
                                                            />
                                                            {formData.price && formData.discountPrice && parseFloat(formData.price) > 0 && parseFloat(formData.discountPrice) > 0 && (
                                                                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                                                    <p className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                                        <TrendingDown className="h-3.5 w-3.5" />
                                                                        Économie: -{discountPercent}%
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* FIX: Force 24h & text-transform: uppercase */}
                                                {isPromotion && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#2563EB30] animate-in fade-in duration-400">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                                                <Calendar className="h-3 w-3 text-[#2563EB]" /> Date de Début
                                                            </Label>
                                                            <Input
                                                                type="datetime-local"
                                                                name="promoStart"
                                                                value={formData.promoStart}
                                                                onChange={handleInputChange}
                                                                step="1"
                                                                className="h-10 rounded-sm border-gray-200 text-[11px] font-bold [&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit-hour-field]:text-[11px] transition-all focus:border-[#2563EB] focus:ring-[#2563EB30] uppercase"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                                                <Clock className="h-3 w-3 text-[#2563EB]" /> Date de Fin
                                                            </Label>
                                                            <Input
                                                                type="datetime-local"
                                                                name="promoEnd"
                                                                value={formData.promoEnd}
                                                                onChange={handleInputChange}
                                                                step="1"
                                                                className="h-10 rounded-sm border-gray-200 text-[11px] font-bold [&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit-hour-field]:text-[11px] transition-all focus:border-[#2563EB] focus:ring-[#2563EB30] uppercase"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── Section 4: Couleur ───────────────────────── */}
                                        <div>
                                            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                                                <Palette className="h-3.5 w-3.5 text-[#2563EB]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">04 — Couleur Signature</span>
                                            </div>

                                            <div className="bg-gray-50 border border-gray-100 rounded-sm p-4">
                                                {availableColors.length > 0 ? (
                                                    <>
                                                        {/* Color Grid with Checkbox logic */}
                                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
                                                            {availableColors.map((color) => {
                                                                const hex = getValidCssColor(color);
                                                                const isSelected = formData.colors.includes(color);
                                                                return (
                                                                    <button
                                                                        key={color}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newColors = isSelected
                                                                                ? formData.colors.filter(c => c !== color)
                                                                                : [...formData.colors, color];
                                                                            setFormData(p => ({ ...p, colors: newColors }));
                                                                        }}
                                                                        title={color}
                                                                        className={`relative flex-shrink-0 flex flex-col items-center gap-1.5 p-2 w-16 transition-all rounded-sm ${isSelected
                                                                            ? 'bg-white border-2 border-[#2563EB] shadow-md scale-105'
                                                                            : 'bg-white/60 border border-gray-200 hover:border-[#2563EB30]'
                                                                            }`}
                                                                    >
                                                                        <div
                                                                            className="w-9 h-9 border border-black/10 shadow-inner rounded-sm"
                                                                            style={{ backgroundColor: hex }}
                                                                        />
                                                                        <span className={`text-[7px] font-black uppercase truncate w-full text-center tracking-wide leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                            {color}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2563EB] rounded-full flex items-center justify-center">
                                                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {formData.colors.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-3">Couleurs Sélectionnées ({formData.colors.length})</p>
                                                                <div className="flex flex-wrap gap-3">
                                                                    {formData.colors.map((c) => (
                                                                        <div key={c} className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 pr-3 rounded-sm shadow-sm animate-in zoom-in-95 duration-200">
                                                                            <div className="w-6 h-6 border border-black/5 rounded-sm shadow-inner" style={{ backgroundColor: getValidCssColor(c) }} />
                                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{c}</span>
                                                                        </div>
                                                                    ))}
                                                                    <Badge className="bg-[#2563EB] text-white text-[8px] font-black uppercase rounded-sm px-2.5 py-1 border-none tracking-widest self-center ml-auto">
                                                                        LOOK BOUTIQUE
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="py-8 text-center border border-dashed border-gray-200 rounded-sm">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Aucune couleur configurée</p>
                                                        {/* FIX: Use secret admin slug */}
                                                        <Link to={`/${ADMIN}/categories`} className="text-[9px] font-black text-[#2563EB] hover:underline uppercase tracking-widest">
                                                            Ajouter des couleurs →
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* FIX #5: submit button with normal padding */}
                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 rounded-sm font-black uppercase tracking-[0.2em] text-sm shadow-lg shadow-[#2563EB30] transition-all group"
                                        >
                                            {isSaving ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Enregistrement…
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                                                    VALIDER DANS L'INVENTAIRE
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            )}

            {/* ── INVENTORY TABLE ───────────────────────────────────── */}
            {!isAddingNew && (
                <Card className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden animate-in fade-in duration-500">

                    {/* Table header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#2563EB] flex items-center justify-center">
                                <Package className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black uppercase tracking-wider text-gray-900">REGISTRE D'INVENTAIRE</p>
                                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                                    GESTION DES STOCKS ET VISIBILITÉ TEMPS RÉEL
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* FIX #7: table search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Rechercher…"
                                    value={tableSearch}
                                    onChange={e => setTableSearch(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-sm bg-gray-50 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-blue-100 w-44 transition-colors"
                                />
                            </div>
                            <button className="text-[9px] font-black uppercase tracking-widest border border-[#2563EB30] text-[#2563EB] bg-[#dbeafe] px-3 py-1.5 rounded-sm hover:bg-[#2563EB] hover:text-white transition-all duration-200 whitespace-nowrap">
                                Auto-Sync ON
                            </button>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full scrollbar-hide">
                            <Table className="min-w-[800px] lg:min-w-full">
                                <TableHeader className="bg-gray-50 border-b border-gray-100">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="w-[80px] text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Visual</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Modèle / SKU</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Catégorie</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Prix (MAD)</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Statut</TableHead>
                                        <TableHead className="text-right text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 py-3">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>

                                    {/* FIX #9: skeleton loading rows */}
                                    {isLoading && Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={`skel-${i}`} className="border-b border-gray-50">
                                            <TableCell className="px-4 py-3">
                                                <div className="w-11 h-11 rounded-sm bg-gray-100 animate-pulse" />
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mb-1.5" />
                                                <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="h-3.5 w-20 bg-gray-100 rounded animate-pulse" />
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="h-3 w-14 bg-gray-100 rounded animate-pulse mb-1.5" />
                                                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <div className="w-7 h-7 rounded-sm bg-gray-100 animate-pulse" />
                                                    <div className="w-7 h-7 rounded-sm bg-gray-100 animate-pulse" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {/* FIX #8: empty state */}
                                    {!isLoading && filteredProducts.length === 0 && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={6} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-14 h-14 rounded-full bg-[#dbeafe] flex items-center justify-center">
                                                        <Package className="h-7 w-7 text-blue-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                                            {tableSearch ? 'Aucun résultat trouvé' : 'Inventaire vide'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest mt-1">
                                                            {tableSearch ? `Aucun produit pour "${tableSearch}"` : 'Ajoutez votre premier modèle'}
                                                        </p>
                                                    </div>
                                                    {!tableSearch && (
                                                        <button
                                                            onClick={() => setIsAddingNew(true)}
                                                            className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#2563EB] border border-[#2563EB30] bg-[#dbeafe] px-4 py-2 rounded-sm hover:bg-[#2563EB] hover:text-white transition-all"
                                                        >
                                                            + Nouveau Produit
                                                        </button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Data rows */}
                                    {!isLoading && filteredProducts.map((product) => {
                                        const isPromoProduct = !!(product as any).discountPrice;
                                        const isOutOfStock = (product as any).quantity === 0;
                                        const isConfirmingDelete = deleteConfirmId === product.id;

                                        return (
                                            <TableRow
                                                key={product.id}
                                                className="border-b border-gray-50 hover:bg-[#dbeafe]/30 transition-colors duration-150 group"
                                            >
                                                <TableCell className="px-4 py-3">
                                                    <div className="w-11 h-11 bg-white overflow-hidden rounded-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                                                        <img
                                                            src={
                                                                product.images && product.images.length > 0 && product.images[0].startsWith('/uploads')
                                                                    ? `${DOMAIN_BASE}${product.images[0]}`
                                                                    : (product.images && product.images.length > 0
                                                                        ? product.images[0]
                                                                        : (product.image && product.image.startsWith('/uploads')
                                                                            ? `${DOMAIN_BASE}${product.image}`
                                                                            : (product.image || '/placeholder.png')))
                                                            }
                                                            className="w-full h-full object-cover p-0.5 transition-transform group-hover:scale-110"
                                                            alt={product.name}
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <p className="text-[12px] font-black uppercase text-gray-900 tracking-wide leading-none">{product.name}</p>
                                                    <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mt-1.5">SKU: {product.sku}</p>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <Badge className="text-[8px] font-black uppercase tracking-widest bg-[#dbeafe] text-[#2563EB] border border-blue-100 px-2 py-0.5 rounded-sm">
                                                        {(product as any).category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    {isPromoProduct ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-400 line-through font-bold">{product.price}</span>
                                                            <span className="text-[13px] font-black text-[#2563EB]">
                                                                {(product as any).discountPrice} <span className="text-[9px] text-gray-400 font-semibold ml-0.5">MAD</span>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[13px] font-black text-gray-900">
                                                            {product.price} <span className="text-[9px] text-gray-400 font-semibold ml-0.5 uppercase">MAD</span>
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                                            {product.isActive ? (
                                                                <>
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                    <span className="text-green-600">En Ligne</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <EyeOff className="h-3 w-3 text-red-400" />
                                                                    <span className="text-red-500">Masqué</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <span className={`text-[9px] font-semibold uppercase tracking-wider ${isOutOfStock ? 'text-red-500' : 'text-gray-400'}`}>
                                                            {isOutOfStock ? '● Épuisé' : `Stock: ${(product as any).quantity}`}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right">
                                                    {/* FIX #6: inline confirm instead of blocking confirm() */}
                                                    {isConfirmingDelete ? (
                                                        <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-150">
                                                            <span className="text-[9px] font-black uppercase text-red-500 tracking-wider mr-1 flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" /> Supprimer ?
                                                            </span>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="h-7 px-2.5 rounded-sm bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                                                            >
                                                                Oui
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="h-7 px-2.5 rounded-sm border border-gray-200 text-gray-500 text-[9px] font-black uppercase tracking-widest hover:border-gray-400 transition-colors"
                                                            >
                                                                Non
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="w-7 h-7 rounded-sm border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#3B82F6] hover:text-[#2563EB] hover:bg-[#dbeafe] transition-all duration-200"
                                                                title="Modifier"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(product.id)}
                                                                className="w-7 h-7 rounded-sm border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProductManagement;