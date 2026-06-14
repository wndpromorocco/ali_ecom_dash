import React from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Send, Phone, MapPin, User, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getColorName } from '@/lib/utils';

interface CartPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.894 4.445-9.897 9.896 0 2.132.569 3.591 1.573 5.323l-1.034 3.775 3.974-1.043zm11.367-7.635c-.195-.101-1.148-.567-1.326-.631-.178-.065-.307-.1-.437.1-.13.2-.503.631-.617.762-.113.13-.227.147-.422.045-.195-.102-.823-.304-1.567-.968-.58-.517-.971-1.156-1.084-1.352-.114-.197-.011-.302.088-.401.089-.089.195-.227.292-.34.098-.113.13-.194.195-.324.065-.13.033-.243-.016-.341-.049-.1-.437-1.052-.599-1.442-.158-.38-.311-.327-.427-.333-.11-.005-.235-.006-.361-.006s-.328.045-.5.234c-.171.188-.65.635-.65 1.548 0 .913.664 1.795.756 1.918.091.122 1.307 1.995 3.167 2.798.442.19.786.305 1.056.39.444.141.849.121 1.169.073.357-.053 1.148-.47 1.31-.923.162-.454.162-.843.113-.923-.049-.08-.178-.129-.373-.23z" />
  </svg>
);

const CartPreview: React.FC<CartPreviewProps> = ({ isOpen, onClose }) => {
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    address: '',
    phone: '',
    size: ''
  });

  const lockedSize = Array.from(new Set(cart.map(item => item.selectedSize).filter(Boolean))).join(', ');

  // Reset step when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setStep('cart'), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppSubmit = () => {
    if (!formData.fullName || !formData.phone || !formData.city) {
      toast.error('Veuillez remplir les informations essentielles');
      return;
    }

    const itemsList = cart.map(item => {
      const parts = [];
      if (item.selectedSize || item.size) parts.push(`Taille: ${item.selectedSize || item.size}`);
      if (item.selectedColor || item.color) parts.push(`Couleur: ${getColorName(item.selectedColor || item.color)}`);
      const details = parts.length > 0 ? ` (${parts.join(', ')})` : '';
      return `- ${item.quantity}x ${item.name}${details} - ${formatPrice(item.price * item.quantity)}`;
    }).join('\n');
    const message = `Bonjour Fadel trading, je souhaite commander les articles suivants:
\n${itemsList}
\n*Total:* ${formatPrice(totalPrice)}
\n*Mes Informations:*
- *Nom:* ${formData.fullName}
- *Ville:* ${formData.city}
- *Adresse:* ${formData.address}
- *Tél:* ${formData.phone}
\nMerci!`;

    const encodedMessage = encodeURIComponent(message);
    const adminWhatsApp = settings?.whatsapp_number || '212649595793';

    // Send POST request to backend API
    try {
      const apiPayload = {
        items: cart.map(item => ({
          productId: item.id || item.productId,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || item.size,
          selectedColor: item.selectedColor || item.color
        })),
        shippingInfo: {
          firstName: formData.fullName.split(' ')[0] || formData.fullName,
          lastName: formData.fullName.includes(' ') ? formData.fullName.split(' ').slice(1).join(' ') : 'Client',
          phone: formData.phone,
          email: 'whatsapp-order@hermado.ma',
          address1: formData.address,
          city: formData.city
        },
        paymentMethod: 'CASH_ON_DELIVERY',
        shippingMethod: 'STANDARD',
        notes: `Commande WhatsApp depuis le Panier.\nDetails: ${itemsList}`
      };

      fetch(`${API_BASE}/api/v1/orders/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });
    } catch (error) {
      console.error('Failed to execute API call for cart order creation', error);
    }

    window.open(`https://wa.me/${adminWhatsApp}?text=${encodedMessage}`, '_blank');
    onClose();
  };

  const panelVariants = {
    cart: { x: 0 },
    checkout: { x: '-100%' }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]"
            />

            {/* Cart Preview Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white z-[9991] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  {step === 'checkout' && (
                    <button
                      onClick={() => setStep('cart')}
                      className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-[#5C2E00]"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-[#5C2E00]">
                      {step === 'cart' ? 'Votre Panier' : 'Détails de Livraison'}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                      {step === 'cart' ? `${totalItems} article(s)` : 'Remplissez vos informations'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 rounded-full hover:bg-white hover:shadow-md transition-all text-[#5C2E00] focus:outline-none bg-white/50 z-[10000]"
                  style={{ pointerEvents: 'auto' }}
                  aria-label="Fermer le panier"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Steps Wrapper */}
              <div className="flex-1 relative overflow-hidden">
                <div
                  className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
                  style={{ transform: step === 'cart' ? 'translateX(0)' : 'translateX(-100%)' }}
                >
                  {/* Step 1: CART VIEW */}
                  <div className="w-full flex-shrink-0 h-full flex flex-col">
                    <div className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
                      {cart.length === 0 ? (
                        <div className="text-center py-20">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                            <ShoppingBag className="w-8 h-8 text-gray-200" />
                          </div>
                          <p className="text-[12px] font-black uppercase tracking-widest text-gray-300 mb-8">Votre panier est vide</p>
                          <Button
                            onClick={onClose}
                            className="bg-[#5C2E00] hover:bg-[#db6513] text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-full transition-all"
                          >
                            Continuer mes achats
                          </Button>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.id} className="group relative flex flex-col gap-4 pb-8 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-4">
                                <h3 className="text-[13px] font-black uppercase tracking-tight text-gray-900 leading-tight group-hover:text-[#db6513] transition-colors">{item.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">
                                  {item.selectedSize || item.size ? `Pointure: ${item.selectedSize || item.size}` : ''}
                                  {(item.selectedSize || item.size) && (item.selectedColor || item.color) ? ' | ' : ''}
                                  {item.selectedColor || item.color ? `Couleur: ${item.selectedColor || item.color}` : ''}
                                  {!item.selectedSize && !item.size && !item.selectedColor && !item.color ? 'Non spécifiée' : ''}
                                </p>
                              </div>
                              <span className="text-[14px] font-black text-[#5C2E00] tabular-nums">{formatPrice(item.price)}</span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                                <button
                                  onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-[#db6513] transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-[12px] font-black w-10 text-center text-[#5C2E00]">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-[#db6513] transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-6">
                                <button
                                  className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                                  onClick={() => removeFromCart(item.cartItemId || item.id)}
                                >
                                  Supprimer
                                </button>
                                <span className="text-[13px] font-black text-[#db6513] tabular-nums">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* Step 1 Footer */}
                    {cart.length > 0 && (
                      <div className="border-t border-gray-100 p-6 sm:p-8 pt-6 space-y-6 bg-gray-50/30">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</span>
                          <span className="text-[24px] font-black text-[#db6513] tracking-tighter leading-none">{formatPrice(totalPrice)}</span>
                        </div>
                        <button
                          className="w-full bg-[#5C2E00] hover:bg-[#db6513] text-white font-black uppercase text-[11px] tracking-[0.2em] py-5 shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 rounded-sm group"
                          onClick={() => setStep('checkout')}
                        >
                          Valider la commande
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step 2: CHECKOUT FORM */}
                  <div className="w-full flex-shrink-0 h-full flex flex-col bg-white">
                    <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Nom Complet</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Votre nom complet"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-200 rounded-sm"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Ville</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Votre ville"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-200 rounded-sm"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Adresse</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Votre adresse exacte"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-200 rounded-sm"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Téléphone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="06 -- -- -- --"
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-200 rounded-sm"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Taille / Pointure</label>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                              name="size"
                              value={lockedSize || formData.size}
                              onChange={handleInputChange}
                              placeholder="Ex: 42"
                              readOnly={!!lockedSize}
                              className={`w-full pl-10 pr-4 py-3 border text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-200 rounded-sm ${lockedSize ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : 'bg-gray-50 border-gray-100'}`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-sm">
                        <p className="text-[11px] text-[#5C2E00] flex items-start gap-2 leading-relaxed">
                          <Send className="w-4 h-4 mt-0.5 text-[#db6513]" />
                          En cliquant sur le bouton ci-dessous, vous serez redirigé vers WhatsApp pour confirmer votre commande manuellement.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 Footer */}
                    <div className="border-t border-gray-100 p-6 sm:p-8 pt-6 space-y-4 bg-white">
                      <button
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase text-[11px] tracking-[0.2em] py-5 shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 rounded-sm group"
                        onClick={handleWhatsAppSubmit}
                      >
                        <WhatsAppIcon className="w-5 h-5 fill-current" />
                        Confirmer sur WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartPreview;
