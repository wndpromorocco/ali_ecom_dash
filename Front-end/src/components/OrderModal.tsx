import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { API_BASE } from '@/config';
import { getValidCssColor, getColorName } from '@/lib/utils';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: any[]; // Works for single item or cart items
    totalPrice: number;
}

export default function OrderModal({ isOpen, onClose, items, totalPrice }: OrderModalProps) {
    const { settings } = useSettings();
    const { clearCart } = useCart();
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        phone: '',
    });

    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');

    const isSingleProduct = items.length === 1;
    const singleProduct = isSingleProduct ? items[0] : null;

    let availableSizes: string[] = [];
    if (isSingleProduct && singleProduct.size) {
        const sizeData = String(singleProduct.size);
        if (sizeData.includes('-')) {
            const [min, max] = sizeData.split('-').map(Number);
            if (!isNaN(min) && !isNaN(max) && min <= max) {
                availableSizes = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
            }
        } else if (sizeData.includes(',')) {
            availableSizes = sizeData.split(',').map(s => s.trim());
        } else {
            availableSizes = [sizeData];
        }
    }

    let availableColors: string[] = [];
    if (isSingleProduct) {
        if (singleProduct.colors && singleProduct.colors.length > 0) {
            availableColors = singleProduct.colors;
        } else if (singleProduct.color) {
            availableColors = [singleProduct.color];
        }
    }

    useEffect(() => {
        if (isOpen && isSingleProduct) {
            if (singleProduct.selectedSize) setSelectedSize(singleProduct.selectedSize);
            else if (availableSizes.length === 1) setSelectedSize(availableSizes[0]);
            else setSelectedSize('');

            if (singleProduct.selectedColor) setSelectedColor(singleProduct.selectedColor);
            else if (availableColors.length === 1) setSelectedColor(availableColors[0]);
            else setSelectedColor('');
        }
    }, [isOpen, isSingleProduct, items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSingleProduct) {
            const isShoes = !singleProduct.category || (singleProduct.category.toLowerCase() !== 'sac' && singleProduct.category.toLowerCase() !== 'accessoires' && singleProduct.category.toLowerCase() !== 'lunettes');
            if (isShoes && availableSizes.length > 1 && !selectedSize) {
                toast.error('Veuillez sélectionner une pointure.');
                return;
            }
            if (availableColors.length > 1 && !selectedColor) {
                toast.error('Veuillez sélectionner une couleur.');
                return;
            }
        }

        let productsText = "";
        if (items.length === 1) {
            const finalSize = selectedSize || items[0].selectedSize || items[0].size;
            const finalColor = selectedColor || items[0].selectedColor || items[0].color;
            productsText = `${items[0].name}${finalSize ? ` (Taille: ${finalSize})` : ''}${finalColor ? ` (Couleur: ${getColorName(finalColor)})` : ''}`;
        } else {
            productsText = "\n" + items.map(item => `- ${item.name} x${item.quantity || 1} ${(item.selectedSize || item.size) ? `(Taille: ${item.selectedSize || item.size})` : ''} ${(item.selectedColor || item.color) ? `(Couleur: ${getColorName(item.selectedColor || item.color)})` : ''}`).join("\n");
        }

        const message = `Bonjour Fadel trading, Nouvelle commande :\n\nProduit : ${productsText}\nPrix : ${totalPrice} MAD\nClient : ${formData.name}\nVille : ${formData.city}\nAdresse : ${formData.address}\nTel : ${formData.phone}`;

        // Send POST request to backend API BEFORE redirecting to WA.me
        try {
            const apiPayload = {
                items: items.map(item => ({
                    productId: item.id || item.productId,
                    quantity: item.quantity || 1,
                    selectedSize: item.selectedSize || item.size,
                    selectedColor: item.selectedColor || item.color
                })),
                shippingInfo: {
                    firstName: formData.name.split(' ')[0] || formData.name,
                    lastName: formData.name.includes(' ') ? formData.name.split(' ').slice(1).join(' ') : 'Client',
                    phone: formData.phone,
                    email: 'whatsapp-order@hermado.ma', // dummy required by validation
                    address1: formData.address,
                    city: formData.city
                },
                paymentMethod: 'CASH_ON_DELIVERY',
                shippingMethod: 'STANDARD',
                notes: `Commande WhatsApp automatique.\nDetails: ${productsText}`
            };

            fetch(`${API_BASE}/api/v1/orders/guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            }).then(res => {
                if (!res.ok) console.error("Backend order creation returned an error", res.status);
            }).catch(err => console.error("Network error during backend order creation", err));

        } catch (error) {
            console.error('Failed to execute API call for order creation', error);
        }

        const phoneNumber = settings?.whatsapp_number?.replace(/[\s\+]/g, '') || '212600000000';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
        clearCart(); // Clear cart after starting WhatsApp process
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="ltr">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden rounded-xl border border-[#1E3A8A]/10"
                    >
                        {/* Header */}
                        <div className="bg-[#1E3A8A] px-6 py-5 flex items-center justify-between">
                            <div className="flex flex-col">
                                <h3 className="text-white font-black uppercase tracking-[0.1em] flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Commander / الطلب
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/60 hover:text-white transition-colors bg-white/10 rounded-full p-1.5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5">
                            {isSingleProduct && (singleProduct.selectedColors || singleProduct.selectedColor || availableColors.length > 1) && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] flex justify-between mb-1">
                                        <span>Couleur</span>
                                        <span dir="rtl" className="font-bold">اللون</span>
                                    </label>
                                    {singleProduct.selectedColor ? (
                                        <input
                                            readOnly
                                            type="text"
                                            value={singleProduct.selectedColor}
                                            className="w-full px-4 py-3 border border-[#1E3A8A]/20 bg-gray-100 text-gray-600 outline-none font-bold capitalize"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {availableColors.map((colorHex, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setSelectedColor(colorHex)}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === colorHex ? 'border-[#D46B2D] scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                                                    style={{ backgroundColor: getValidCssColor(colorHex) }}
                                                    title={colorHex}
                                                    aria-label={`Select color ${colorHex}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isSingleProduct && (singleProduct.selectedSize || availableSizes.length > 1) && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] flex justify-between mb-1">
                                        <span>Pointure</span>
                                        <span dir="rtl" className="font-bold">المقاس</span>
                                    </label>
                                    {singleProduct.selectedSize ? (
                                        <input
                                            readOnly
                                            type="text"
                                            value={singleProduct.selectedSize}
                                            className="w-full px-4 py-3 border border-[#1E3A8A]/20 bg-gray-100 text-gray-600 outline-none font-bold"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {availableSizes.map((size) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`w-10 h-10 text-[12px] rounded-sm flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'bg-[#1E3A8A] text-white shadow-md' : 'border border-gray-300 hover:border-[#1E3A8A] text-gray-700 bg-white'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] flex justify-between">
                                    <span>Nom Complet</span>
                                    <span dir="rtl" className="font-bold">الإسم الكامل</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Mohammed "
                                    className="w-full px-4 py-3 border border-[#1E3A8A]/20 bg-gray-50 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all placeholder:text-gray-400 font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] flex justify-between">
                                    <span>Ville</span>
                                    <span dir="rtl" className="font-bold">المدينة</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ex: Casablanca"
                                    className="w-full px-4 py-3 border border-[#1E3A8A]/20 bg-gray-50 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all placeholder:text-gray-400 font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] flex justify-between">
                                    <span>Adresse Complète</span>
                                    <span dir="rtl" className="font-bold">العنوان</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Ex: Quartier, Rue, N°"
                                    className="w-full px-4 py-3 border border-[#1E3A8A]/20 bg-gray-50 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all placeholder:text-gray-400 font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] flex justify-between">
                                    <span>Téléphone</span>
                                    <span dir="rtl" className="font-bold">رقم الهاتف</span>
                                </label>
                                <input
                                    required
                                    type="tel"
                                    dir="ltr"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="06 XX XX XX XX"
                                    className="w-full px-4 py-3 text-right sm:text-left border border-[#1E3A8A]/20 bg-gray-50 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all placeholder:text-gray-400 font-bold"
                                />
                            </div>

                            {/* Total Display */}
                            <div className="mt-2 bg-[#2563EB]/10 border border-[#2563EB]/20 px-4 py-3 rounded flex justify-between items-center">
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#2563EB]">À Payer / المجموع</span>
                                <span className="text-xl font-black text-[#1E3A8A]">{totalPrice} MAD</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white flex items-center justify-center gap-3 py-4 mt-2 font-black uppercase text-[12px] tracking-[0.2em] transition-all duration-300 shadow-xl shadow-[#2563EB]/20 active:scale-95"
                            >
                                Confirmer la Commande
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
