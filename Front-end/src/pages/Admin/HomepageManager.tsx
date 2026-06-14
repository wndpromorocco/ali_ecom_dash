import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Layout,
    Upload,
    Trash2,
    Save,
    Zap,
    Clock,
    Plus,
    XCircle,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Palette,
    UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE, DOMAIN_BASE } from '@/config';

const GallerySlot = ({ slot, data, className, onUpload, isUploading }: any) => {
    return (
        <div className={`relative group bg-gray-50 border border-gray-100 rounded-sm overflow-hidden transition-all hover:border-[#db6513]/30 shadow-sm ${className}`}>
            {data?.imageUrl ? (
                <img
                    src={data.imageUrl.startsWith('/uploads') ? `${DOMAIN_BASE}${data.imageUrl}` : data.imageUrl}
                    alt={data.altText || `Gallery slot ${slot}`}
                    className="w-full h-full object-contain p-4 mix-blend-darken hover:scale-105 transition-transform duration-500"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <ImageIcon className="w-8 h-8 text-gray-200" />
                </div>
            )}

            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">SLOT {slot}</span>
            </div>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 rounded-sm font-black uppercase text-[9px] tracking-widest bg-white hover:bg-[#db6513] hover:text-white border-none shadow-xl"
                    onClick={() => document.getElementById(`gallery-file-${slot}`)?.click()}
                    disabled={isUploading}
                    type="button"
                >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Upload className="w-3.5 h-3.5 mr-2" />}
                    Changer l'image
                </Button>
                <input
                    type="file"
                    id={`gallery-file-${slot}`}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpload(slot, file);
                    }}
                />
            </div>
        </div>
    );
};

const HomepageManager = () => {
    const ADMIN_SLUG = import.meta.env.VITE_ADMIN_SLUG;
    const [heroSlides, setHeroSlides] = useState<any[]>([]);
    const [promo, setPromo] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');

    // Gallery State
    const [gallerySlots, setGallerySlots] = useState<any[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

    // Black Friday State
    const [bfConfig, setBfConfig] = useState({
        is_active: true,
        emoji: '👟',
        line1: 'BLACK',
        line2: 'FRIDAY',
        badge_text: 'Super Soldes',
        bg_color: '#db6513',
        text_color: '#dc2626',
        border_color: '#dc2626',
    });
    const [bfSaving, setBfSaving] = useState(false);

    // Hero Form State
    const [heroForm, setHeroForm] = useState({
        title: '',
        subtitle: '',
        order: '0'
    });
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string>('');

    // Promo Form State
    const [promoForm, setPromoForm] = useState({
        section_title: '',
        section_subtitle: '',
        product_id: '',
        image_url: ''
    });
    const [promoImage, setPromoImage] = useState<File | null>(null);
    const [promoPreview, setPromoPreview] = useState<string>('');
    const [isUploadingPromo, setIsUploadingPromo] = useState(false);

    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchData();
        fetchGallery();
        fetchBF();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [heroRes, promoRes, prodRes] = await Promise.all([
                fetch(`${API_BASE}/homepage/hero`),
                fetch(`${API_BASE}/homepage/promo`),
                fetch(`${API_BASE}/products?limit=1000`)
            ]);

            if (heroRes.ok) {
                const json = await heroRes.json();
                setHeroSlides(json.data || []);
            }
            if (promoRes.ok) {
                const json = await promoRes.json();
                const p = json.data;
                if (p) {
                    setPromo(p);
                    setPromoForm({
                        is_active: p.isActive,
                        promo_end_date: p.promoEndDate ? formatTo24h(p.promoEndDate) : '',
                        section_title: p.sectionTitle || '',
                        section_subtitle: p.sectionSubtitle || '',
                        product_id: p.productId || '',
                        image_url: p.imageUrl || ''
                    });
                    if (p.imageUrl) {
                        setPromoPreview(p.imageUrl.startsWith('/uploads') ? `${DOMAIN_BASE}${p.imageUrl}` : p.imageUrl);
                    }
                }
            }
            if (prodRes.ok) {
                const json = await prodRes.json();
                setProducts(json.data || []);
            }
        } catch (error) {
            console.error('Error fetching homepage data:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGallery = async () => {
        setGalleryLoading(true);
        try {
            const res = await fetch(`${API_BASE}/homepage/gallery`);
            if (res.ok) {
                const json = await res.json();
                setGallerySlots(json.data || []);
            }
        } catch (error) {
            console.error('Gallery fetch error:', error);
        } finally {
            setGalleryLoading(false);
        }
    };

    const fetchBF = async () => {
        try {
            const res = await fetch(`${API_BASE}/homepage/blackfriday`);
            if (res.ok) {
                const json = await res.json();
                if (json.data) {
                    setBfConfig({
                        is_active: json.data.isActive,
                        emoji: json.data.emoji || '👟',
                        line1: json.data.line1 || 'BLACK',
                        line2: json.data.line2 || 'FRIDAY',
                        badge_text: json.data.badgeText || 'Super Soldes',
                        bg_color: json.data.bgColor || '#db6513',
                        text_color: json.data.textColor || '#dc2626',
                        border_color: json.data.borderColor || '#dc2626',
                    });
                }
            }
        } catch (error) {
            console.error('BF fetch error:', error);
        }
    };

    const formatTo24h = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setHeroImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setHeroPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleHeroSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!heroImage) {
            toast.error('Veuillez sélectionner une image');
            return;
        }

        setIsSaving(true);
        const fd = new FormData();
        fd.append('image', heroImage);
        fd.append('title', heroForm.title);
        fd.append('subtitle', heroForm.subtitle);
        fd.append('order', heroForm.order);

        try {
            const res = await fetch(`${API_BASE}/homepage/hero`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });

            if (res.ok) {
                toast.success('Slide ajouté avec succès');
                setHeroForm({ title: '', subtitle: '', order: '0' });
                setHeroImage(null);
                setHeroPreview('');
                const json = await res.json();
                setHeroSlides([...heroSlides, json.data].sort((a, b) => a.order - b.order));
            } else {
                toast.error('Erreur lors de l\'ajout');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    const handleHeroDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/homepage/hero/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Slide supprimé');
                setHeroSlides(heroSlides.filter(s => s.id !== id));
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        }
    };

    const handlePromoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        let finalImageUrl = promoForm.image_url;

        // If there's a new image to upload
        if (promoImage) {
            setIsUploadingPromo(true);
            try {
                const fd = new FormData();
                fd.append('image', promoImage);
                const uploadRes = await fetch(`${API_BASE}/homepage/promo/upload-image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fd
                });
                if (uploadRes.ok) {
                    const uploadJson = await uploadRes.json();
                    finalImageUrl = uploadJson.data.imageUrl;
                } else {
                    toast.error("Erreur lors de l'upload de l'image");
                    setIsSaving(false);
                    setIsUploadingPromo(false);
                    return;
                }
            } catch (error) {
                console.error("Promo image upload error:", error);
                toast.error("Erreur réseau lors de l'upload");
                setIsSaving(false);
                setIsUploadingPromo(false);
                return;
            } finally {
                setIsUploadingPromo(false);
            }
        }

        try {
            const res = await fetch(`${API_BASE}/homepage/promo`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...promoForm,
                    image_url: finalImageUrl
                })
            });

            if (res.ok) {
                toast.success('Configuration de l\'offre mise à jour');
                const json = await res.json();
                setPromo(json.data);
                setPromoImage(null); // Clear pending upload
            } else {
                toast.error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGalleryUpload = async (slot: number, file: File) => {
        setUploadingSlot(slot);
        const fd = new FormData();
        fd.append('image', file);
        // We could also send alt_text here if we wanted, but the requirement said 
        // "immediate upload on file select".

        try {
            const res = await fetch(`${API_BASE}/homepage/gallery/${slot}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            if (res.ok) {
                toast.success(`Slot ${slot} mis à jour`);
                fetchGallery();
            } else {
                toast.error('Erreur lors de l\'upload');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setUploadingSlot(null);
        }
    };

    const handleBFSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBfSaving(true);
        try {
            const res = await fetch(`${API_BASE}/homepage/blackfriday`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bfConfig)
            });
            if (res.ok) {
                toast.success('Configuration Black Friday mise à jour');
                fetchBF();
            } else {
                const json = await res.json();
                toast.error(json.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setBfSaving(false);
        }
    };

    // Countdown logic for preview
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    useEffect(() => {
        if (!promoForm.promo_end_date) return;
        const interval = setInterval(() => {
            const end = new Date(promoForm.promo_end_date).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000)
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [promoForm.promo_end_date]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#db6513]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 leading-none">
                        GESTION DE <span className="text-[#db6513]">VITRINE</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 leading-none underline decoration-[#db6513]/30 underline-offset-4">CONFIGURATION DE LA PAGE D'ACCUEIL</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-sm border border-gray-100 shadow-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Statut de Visibilité</span>
                        <span className="text-[11px] font-black uppercase text-green-600 flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            En Ligne
                        </span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border border-gray-100 p-1 h-12 rounded-sm w-full lg:w-auto shadow-sm gap-1 overflow-x-auto flex-nowrap justify-start lg:justify-center scrollbar-hide">
                    <TabsTrigger
                        value="hero"
                        className="flex-shrink-0 lg:flex-1 w-32 md:w-48 rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                    >
                        <Layout className="w-3.5 h-3.5" /> HERO
                    </TabsTrigger>
                    <TabsTrigger
                        value="promo"
                        className="flex-shrink-0 lg:flex-1 w-32 md:w-48 rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                    >
                        <Zap className="w-3.5 h-3.5" /> PROMO
                    </TabsTrigger>
                    <TabsTrigger
                        value="gallery"
                        className="flex-shrink-0 lg:flex-1 w-32 md:w-48 rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                    >
                        <ImageIcon className="w-3.5 h-3.5" /> GALERIE
                    </TabsTrigger>
                    <TabsTrigger
                        value="blackfriday"
                        className="flex-shrink-0 lg:flex-1 w-32 md:w-48 rounded-sm h-full data-[state=active]:bg-[#db6513] data-[state=active]:text-white data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2 transition-all"
                    >
                        <Palette className="w-3.5 h-3.5" /> BLACK FRIDAY
                    </TabsTrigger>
                </TabsList>

                {/* HERO SECTION TAB */}
                <TabsContent value="hero" className="mt-8 space-y-8 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
                        {/* List Area - show first on desktop, first on mobile too since it's the current state view */}
                        <div className="lg:col-span-7 order-2 lg:order-1 space-y-6">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-[#db6513]" />
                                Slides Actuels ({heroSlides.length})
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {heroSlides.length === 0 ? (
                                    <Card className="border-dashed border-2 border-gray-100 rounded-sm p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
                                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                            <ImageIcon className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Aucune slide configurée</p>
                                        <p className="text-[9px] font-bold text-gray-300 uppercase mt-2 max-w-[200px]">Uploadez votre première image pour commencer la vitrine.</p>
                                    </Card>
                                ) : (
                                    heroSlides.map((slide) => (
                                        <Card key={slide.id} className="rounded-sm border-gray-100 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="w-full sm:w-48 h-32 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                                                    <img
                                                        src={slide.imageUrl.startsWith('http') ? slide.imageUrl : `${DOMAIN_BASE}${slide.imageUrl}`}
                                                        alt={slide.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-sm">
                                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">#{slide.order}</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-[13px] font-black uppercase text-gray-900 tracking-wide">{slide.title || 'Sans titre'}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 line-clamp-1">{slide.subtitle || 'Aucun sous-titre'}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 sm:mt-0">
                                                        <div className="flex items-center gap-1.5 h-6 bg-green-50 px-2 rounded-full">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                            <span className="text-[8px] font-black uppercase text-green-600 tracking-widest">Active</span>
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleHeroDelete(slide.id)}
                                                            className="h-8 w-8 rounded-sm shadow-sm"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Upload Form */}
                        <div className="lg:col-span-5 order-1 lg:order-2">
                            <Card className="rounded-sm border-gray-100 shadow-xl bg-white overflow-hidden sticky top-24">
                                <CardHeader className="bg-gray-900 border-b border-gray-800 p-6 border-l-4 border-l-[#db6513]">
                                    <CardTitle className="text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                                        <Plus className="w-4 h-4 text-[#db6513]" />
                                        Nouvelle Slide
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Ajoutez un visuel d'impact à votre vitrine principale.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleHeroSubmit} className="space-y-6">
                                        {/* Image Upload Area */}
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Visuel (L:1920 x H:800 recommandé)</Label>
                                            <div className="group relative h-48 bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden transition-all hover:border-[#db6513]/40 rounded-sm">
                                                {heroPreview ? (
                                                    <>
                                                        <img src={heroPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-2 right-2 rounded-sm h-8 w-8"
                                                            onClick={() => { setHeroImage(null); setHeroPreview(''); }}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <label className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3 group-hover:bg-[#fdf0e8]/20 transition-colors">
                                                        <div className="w-12 h-12 rounded-full bg-[#fdf0e8] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                                            <Upload className="h-6 w-6 text-[#db6513]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">DÉPOSER L'IMAGE</p>
                                                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">PNG, JPG — max 5MB</p>
                                                        </div>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageChange} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="col-span-3 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Titre (Facultatif)</Label>
                                                <Input
                                                    value={heroForm.title}
                                                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                                                    className="w-full border border-gray-100 rounded-sm px-3 py-2.5 text-[12px] text-gray-900 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-11 font-bold"
                                                    placeholder="EX: NOUVELLE COLLECTION"
                                                />
                                            </div>
                                            <div className="col-span-1 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ordre</Label>
                                                <Input
                                                    type="number"
                                                    value={heroForm.order}
                                                    onChange={(e) => setHeroForm({ ...heroForm, order: e.target.value })}
                                                    className="w-full border border-gray-100 rounded-sm px-3 py-2.5 text-[12px] text-gray-900 text-center bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-11 font-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sous-titre (Facultatif)</Label>
                                            <Input
                                                value={heroForm.subtitle}
                                                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                                                className="w-full border border-gray-100 rounded-sm px-3 py-2.5 text-[12px] text-gray-900 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 transition-all h-11 font-bold"
                                                placeholder="DESCRIPTION COURTE EN CARROUSEL"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSaving || !heroImage}
                                            className="w-full bg-gray-900 hover:bg-black text-white rounded-sm font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg transition-all group active:scale-95"
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />}
                                            PUBLIER LA SLIDE
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* GALERIE VITRINE TAB */}
                <TabsContent value="gallery" className="mt-8 space-y-8 focus-visible:outline-none">
                    <Card className="rounded-sm border-gray-100 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b border-gray-100 p-8 border-l-4 border-l-[#db6513]">
                            <CardTitle className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-gray-900">
                                <ImageIcon className="w-5 h-5 text-[#db6513]" />
                                CONFIGURATION DE LA GALERIE
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Gérez les 5 emplacements d'images du bloc galerie.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 h-auto md:h-[600px]">
                                {/* Slot 1 - Tall Left */}
                                <GallerySlot
                                    slot={1}
                                    data={gallerySlots.find(s => s.slot === 1)}
                                    className="col-span-1 row-span-2"
                                    onUpload={handleGalleryUpload}
                                    isUploading={uploadingSlot === 1}
                                />

                                {/* Slot 2 - Top Row */}
                                <GallerySlot
                                    slot={2}
                                    data={gallerySlots.find(s => s.slot === 2)}
                                    className="col-span-1 row-span-1"
                                    onUpload={handleGalleryUpload}
                                    isUploading={uploadingSlot === 2}
                                />

                                {/* Slot 3 - Top Row */}
                                <GallerySlot
                                    slot={3}
                                    data={gallerySlots.find(s => s.slot === 3)}
                                    className="col-span-1 row-span-1"
                                    onUpload={handleGalleryUpload}
                                    isUploading={uploadingSlot === 3}
                                />

                                {/* Slot 4 - Tall Right (Occupied by BF Preview) */}
                                <div className="col-span-1 row-span-2 bg-[#db6513]/10 border-2 border-dashed border-yellow-500/30 rounded-sm flex flex-col items-center justify-center p-6 text-center">
                                    <Palette className="w-8 h-8 text-yellow-600 mb-3 opacity-50" />
                                    <p className="text-[10px] font-black text-yellow-700 uppercase tracking-widest leading-tight">CARTE BLACK FRIDAY</p>
                                    <p className="text-[8px] font-bold text-yellow-600/60 uppercase tracking-widest mt-2 leading-relaxed">Cet emplacement est géré dans l'onglet 4</p>
                                </div>

                                {/* Slot 4 (data-wise) - Visual Slot 2 Bottom */}
                                <GallerySlot
                                    slot={4}
                                    data={gallerySlots.find(s => s.slot === 4)}
                                    className="col-span-1 row-span-1"
                                    onUpload={handleGalleryUpload}
                                    isUploading={uploadingSlot === 4}
                                />

                                {/* Slot 5 (data-wise) - Visual Slot 3 Bottom */}
                                <GallerySlot
                                    slot={5}
                                    data={gallerySlots.find(s => s.slot === 5)}
                                    className="col-span-1 row-span-1"
                                    onUpload={handleGalleryUpload}
                                    isUploading={uploadingSlot === 5}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BLACK FRIDAY TAB */}
                <TabsContent value="blackfriday" className="mt-8 space-y-8 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
                        {/* Form */}
                        <div className="lg:col-span-5">
                            <Card className="rounded-sm border-gray-100 shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50 border-b border-gray-100 p-8 border-l-4 border-l-[#db6513]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-gray-900">
                                                <Palette className="w-5 h-5 text-[#db6513]" />
                                                CARTE BLACK FRIDAY
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Personnalisez le visuel de la promotion.</CardDescription>
                                        </div>
                                        <Switch
                                            checked={bfConfig.is_active}
                                            onCheckedChange={(val) => setBfConfig({ ...bfConfig, is_active: val })}
                                            className="data-[state=checked]:bg-[#db6513] scale-110"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handleBFSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Emoji (Sneaker)</Label>
                                                <Input
                                                    value={bfConfig.emoji}
                                                    onChange={(e) => setBfConfig({ ...bfConfig, emoji: e.target.value })}
                                                    className="h-12 text-2xl text-center"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Texte Badge</Label>
                                                <Input
                                                    value={bfConfig.badge_text}
                                                    onChange={(e) => setBfConfig({ ...bfConfig, badge_text: e.target.value })}
                                                    className="h-12 font-bold uppercase text-[12px]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ligne 1</Label>
                                            <Input
                                                value={bfConfig.line1}
                                                onChange={(e) => setBfConfig({ ...bfConfig, line1: e.target.value })}
                                                className="h-12 font-black uppercase text-[14px]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ligne 2</Label>
                                            <Input
                                                value={bfConfig.line2}
                                                onChange={(e) => setBfConfig({ ...bfConfig, line2: e.target.value })}
                                                className="h-12 font-black uppercase text-[14px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur Fond</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={bfConfig.bg_color}
                                                        onChange={(e) => setBfConfig({ ...bfConfig, bg_color: e.target.value })}
                                                        className="w-12 h-12 p-1 rounded-sm cursor-pointer"
                                                    />
                                                    <Input
                                                        value={bfConfig.bg_color}
                                                        onChange={(e) => setBfConfig({ ...bfConfig, bg_color: e.target.value })}
                                                        className="flex-1 h-12 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur Texte</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={bfConfig.text_color}
                                                        onChange={(e) => setBfConfig({ ...bfConfig, text_color: e.target.value })}
                                                        className="w-12 h-12 p-1 rounded-sm cursor-pointer"
                                                    />
                                                    <Input
                                                        value={bfConfig.text_color}
                                                        onChange={(e) => setBfConfig({ ...bfConfig, text_color: e.target.value })}
                                                        className="flex-1 h-12 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur Bordure Badge</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={bfConfig.border_color}
                                                        onChange={(e) => setBfConfig({ ...bfConfig, border_color: e.target.value })}
                                                        className="w-12 h-12 p-1 rounded-sm cursor-pointer"
                                                    />
                                                    <Input
                                                        value={bfConfig.border_color}
                                                        onChange={(e) => setBfConfig({ ...bfConfig, border_color: e.target.value })}
                                                        className="flex-1 h-12 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={bfSaving}
                                            className="w-full bg-gray-900 hover:bg-black text-white rounded-sm font-black uppercase tracking-[0.2em] text-[11px] h-12 shadow-xl transition-all"
                                        >
                                            {bfSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            ENREGISTRER LA CONFIGURATION
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview */}
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-[#db6513]" />
                                APERÇU EN TEMPS RÉEL
                            </h2>

                            <div className="bg-gray-100 rounded-sm p-6 sm:p-12 flex items-center justify-center border border-gray-200 border-dashed min-h-[300px] sm:min-h-[400px]">
                                <div
                                    className="flex flex-col items-center justify-center p-6 rounded-sm w-[260px] h-[280px] text-center shadow-2xl transition-all duration-200"
                                    style={{ backgroundColor: bfConfig.bg_color }}
                                >
                                    <span className="text-4xl mb-4">{bfConfig.emoji}</span>
                                    <p
                                        className="font-black text-[22px] uppercase leading-none italic"
                                        style={{ color: bfConfig.text_color }}
                                    >
                                        {bfConfig.line1}
                                    </p>
                                    <p
                                        className="font-black text-[22px] uppercase leading-none italic mb-4"
                                        style={{ color: bfConfig.text_color }}
                                    >
                                        {bfConfig.line2}
                                    </p>
                                    <div
                                        className="border-2 rounded-full px-4 py-1"
                                        style={{ borderColor: bfConfig.border_color }}
                                    >
                                        <span
                                            className="font-black text-[9px] uppercase tracking-[0.2em]"
                                            style={{ color: bfConfig.text_color }}
                                        >
                                            {bfConfig.badge_text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center italic">La carte s'affiche exactement ainsi sur la page d'accueil</p>
                        </div>
                    </div>
                </TabsContent>

                {/* PROMO SECTION TAB */}
                <TabsContent value="promo" className="mt-4 sm:mt-8 space-y-8 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
                        {/* Configuration Form */}
                        <div className="space-y-8">
                            <Card className="rounded-sm border-gray-100 shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4 sm:p-8 border-l-4 border-l-[#db6513]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-[14px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-gray-900">
                                                <Zap className="w-5 h-5 text-[#db6513] fill-[#db6513]" />
                                                L'OFFRE EXCLUSIVE
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Configurez le compte à rebours de la page d'accueil.</CardDescription>
                                        </div>
                                        <Switch
                                            checked={promoForm.is_active}
                                            onCheckedChange={(val) => setPromoForm({ ...promoForm, is_active: val })}
                                            className="data-[state=checked]:bg-[#db6513] scale-110"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-8">
                                    <form onSubmit={handlePromoSubmit} className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-[#db6513]" /> Date d'Échéance
                                                </Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={promoForm.promo_end_date}
                                                    onChange={(e) => setPromoForm({ ...promoForm, promo_end_date: e.target.value })}
                                                    step="1"
                                                    className="w-full border border-gray-100 rounded-sm px-4 py-3 text-[14px] text-gray-900 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 h-12 font-black tracking-wider [&::-webkit-datetime-edit-ampm-field]:hidden [&::-webkit-datetime-edit-hour-field]:text-[14px] uppercase"
                                                    required
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label className="text-[10px] uppercase font-black text-gray-400">Image de l'Offre Exclusive</Label>
                                                <div
                                                    className="bg-white border border-dashed border-gray-200 rounded-sm p-6 text-center text-sm text-gray-500 cursor-pointer hover:border-[#db6513]/40 transition-all group relative overflow-hidden h-28 sm:h-32 max-h-36 flex flex-col items-center justify-center gap-2"
                                                    onClick={() => document.getElementById('promo-image-upload')?.click()}
                                                >
                                                    {promoPreview ? (
                                                        <>
                                                            <img
                                                                src={promoPreview}
                                                                alt="Promo Preview"
                                                                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                                                            />
                                                            <div className="relative z-10 flex flex-col items-center gap-1">
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                <span className="text-[9px] font-black uppercase text-gray-600">Image prête</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UploadCloud size={24} className="text-gray-300 group-hover:text-[#db6513]/50 transition-colors" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Déposez ou <span className="text-[#db6513]">cliquez</span></span>
                                                            <span className="text-[8px] font-bold text-gray-300 uppercase">PNG/JPG (Max 5MB)</span>
                                                        </>
                                                    )}
                                                    <input
                                                        id="promo-image-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setPromoImage(file);
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setPromoPreview(reader.result as string);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                {promoPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setPromoImage(null); setPromoPreview(''); setPromoForm({ ...promoForm, image_url: '' }); }}
                                                        className="text-[8px] font-black uppercase text-red-500 self-center tracking-widest mt-1"
                                                    >
                                                        Supprimer l'image
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Titre Principal</Label>
                                                <Input
                                                    value={promoForm.section_title}
                                                    onChange={(e) => setPromoForm({ ...promoForm, section_title: e.target.value })}
                                                    className="w-full border border-gray-100 rounded-sm px-4 py-3 text-[13px] text-gray-900 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 h-12 font-black"
                                                    placeholder="EX: OFFRE EXCLUSIVE FINIT BIENTÔT !"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sous-titre / Accroche</Label>
                                                <textarea
                                                    value={promoForm.section_subtitle}
                                                    onChange={(e) => setPromoForm({ ...promoForm, section_subtitle: e.target.value })}
                                                    className="w-full border border-gray-100 rounded-sm px-4 py-3 text-[12px] text-gray-700 bg-white focus:border-[#e8721f] focus:ring-2 focus:ring-orange-100 min-h-[80px] font-bold resize-none"
                                                    placeholder="Notre plus grande démarque saisonnière à ce jour."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Produit Vedette</Label>
                                                <Select value={promoForm.product_id} onValueChange={(val) => setPromoForm({ ...promoForm, product_id: val })}>
                                                    <SelectTrigger className="h-12 rounded-sm border-gray-100 text-[11px] font-black uppercase tracking-widest bg-white shadow-sm">
                                                        <SelectValue placeholder="Sélectionner un produit..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 rounded-sm border-gray-100">
                                                        {products.map((p) => (
                                                            <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase py-2">
                                                                {p.sku} — {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full lg:w-full bg-[#db6513] hover:bg-[#c45610] text-white rounded-sm font-black uppercase tracking-[0.2em] text-[11px] h-12 shadow-xl shadow-orange-100 transition-all hover:-translate-y-0.5"
                                        >
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            METTRE À JOUR LA CAMPAGNE
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* LIVE PREVIEW AREA */}
                        <div className="h-full flex flex-col gap-6 lg:sticky lg:top-6 self-start">
                            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-[#db6513]" />
                                Aperçu en Temps Réel
                            </h2>

                            <div
                                className="relative rounded-sm overflow-hidden bg-[#161c2b] p-4 sm:p-8 lg:p-12 border border-white/5 shadow-2xl min-h-[320px] sm:min-h-[450px] flex flex-col items-center justify-center text-center transition-all duration-700"
                                style={promoPreview ? {
                                    backgroundImage: `linear-gradient(rgba(22, 28, 43, 0.8), rgba(22, 28, 43, 0.9)), url(${promoPreview})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                } : {}}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#db6513]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#db6513]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                                <div className="relative z-10 flex flex-col items-center max-w-lg">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#db6513] rounded-sm mb-6 animate-bounce">
                                        <Zap className="w-3.5 h-3.5 text-white fill-white" />
                                        <span className="text-[9px] font-black uppercase text-white tracking-[0.3em]">Exclusivité Web</span>
                                    </div>

                                    <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-tight italic">
                                        {promoForm.section_title || 'Offre Exclusive Finit Bientôt !'}
                                    </h3>

                                    <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-8 sm:mb-12 opacity-80 leading-relaxed max-w-md">
                                        {promoForm.section_subtitle || 'Notre plus grande démarque saisonnière à ce jour.'}
                                    </p>

                                    {/* Timer Preview */}
                                    <div className="flex gap-2 sm:gap-4 md:gap-8 mb-8 sm:mb-12">
                                        {[
                                            { val: timeLeft.days, label: 'Jours' },
                                            { val: timeLeft.hours, label: 'Heures' },
                                            { val: timeLeft.minutes, label: 'Min' },
                                            { val: timeLeft.seconds, label: 'Sec' }
                                        ].map((unit, i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center mb-2 group shadow-lg">
                                                    <span className="text-lg sm:text-2xl md:text-3xl font-black text-white group-hover:text-[#db6513] transition-colors">{String(unit.val).padStart(2, '0')}</span>
                                                </div>
                                                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em]">{unit.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Featured Product Small Preview */}
                                    {promoForm.product_id && (
                                        <div className="bg-white/5 border border-white/10 rounded-sm p-3 flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                                            {products.find(p => p.id === promoForm.product_id)?.images?.[0] && (
                                                <div className="w-12 h-12 bg-white rounded-sm overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={products.find(p => p.id === promoForm.product_id).images[0].startsWith('http') ? products.find(p => p.id === promoForm.product_id).images[0] : `${DOMAIN_BASE}${products.find(p => p.id === promoForm.product_id).images[0]}`}
                                                        className="w-full h-full object-contain p-1"
                                                    />
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-[#db6513] uppercase tracking-widest">Produit Associé</p>
                                                <p className="text-[10px] font-bold text-white uppercase tracking-wider truncate w-40">
                                                    {products.find(p => p.id === promoForm.product_id)?.name}
                                                </p>
                                            </div>
                                            <div className="ml-4 w-9 h-9 rounded-full bg-[#db6513] flex items-center justify-center shadow-lg shadow-orange-900/50">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Card className="border-none bg-[#fdf0e8]/50 p-4 border-l-4 border-[#db6513]">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-4 h-4 text-[#db6513] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-800 tracking-wide">Note de Configuration</p>
                                        <p className="text-[9px] text-gray-500 mt-1 leading-relaxed font-bold uppercase tracking-widest">
                                            Cet aperçu utilise le style sombre du thème principal. Assurez-vous que l'offre est activée pour qu'elle apparaisse sur la page publique.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HomepageManager;
