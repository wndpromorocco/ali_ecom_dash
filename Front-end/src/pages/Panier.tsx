import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCatalog } from '@/hooks/useCatalog';
import { useNavigate } from 'react-router-dom';
import OrderModal from '@/components/OrderModal';

const Panier = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems, addToCart } = useCart();
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { products: apiProducts } = useCatalog();

  const shippingCost = 50.00;
  const totalTTC = (totalPrice + shippingCost);
  const freeShippingThreshold = 500;
  const remainingForFreeShipping = Math.max(freeShippingThreshold - totalPrice, 0);
  const { formatPrice } = useCurrency();

  // Get 4 real products from the catalog (that aren't already in the cart)
  const recommendations = apiProducts
    .filter((p) => !cart.some((cartItem) => cartItem.id === p.id))
    .slice(0, 4);

  const handleCheckoutClick = () => {
    setIsOrderModalOpen(true);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Votre panier est vide</CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-4">
                Il semble que vous n'ayez pas encore ajouté de produits à votre panier.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Link to="/boutique">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continuer vos achats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-[32px] md:text-[40px] font-black uppercase tracking-tighter text-[#5C2E00] leading-none">Votre <span className="text-[#db6513]">Panier</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-3 italic">Maroquinerie d'Excellence — Livraison Premium</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Cart Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-none border-b-2 border-[#5C2E00]/10 pb-4">
              <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <div>Désignation</div>
                <div className="text-center">Prix Unitaire</div>
                <div className="text-center">Quantité</div>
                <div className="text-right">Total</div>
              </div>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white shadow-sm hover:shadow-md transition-all duration-300 p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center border border-gray-50 group">
                  {/* Product Info */}
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <div className="w-24 h-24 bg-gray-50 flex-shrink-0 border border-gray-100 overflow-hidden shadow-inner flex items-center justify-center p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-black uppercase tracking-tight text-[#5C2E00] group-hover:text-[#db6513] transition-colors">{item.name}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Réf: {item.sku || 'HER-001'}</p>
                      <button
                        onClick={() => removeFromCart(item.cartItemId || item.id)}
                        className="text-[9px] font-black uppercase tracking-widest text-red-300 hover:text-red-500 mt-4 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Retirer
                      </button>
                    </div>
                  </div>

                  {/* Desktop Columns Overlay */}
                  <div className="hidden lg:grid grid-cols-3 gap-8 items-center w-full max-w-[450px]">
                    <div className="text-center text-[15px] font-black text-[#5C2E00] tracking-tight">{formatPrice(item.price)}</div>

                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-100 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-[#db6513] transition-colors border border-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-[12px] font-black text-[#5C2E00]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-[#db6513] transition-colors border border-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right text-[15px] font-black text-[#db6513] tracking-tight">{formatPrice(item.price * item.quantity)}</div>
                  </div>

                  {/* Mobile Pricing (Overlay) */}
                  <div className="lg:hidden flex items-center justify-between w-full pt-4 border-t border-gray-50 mt-2">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-100 shadow-inner">
                      <button onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)} className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-[12px] font-black w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)} className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    </div>
                    <span className="text-[16px] font-black text-[#db6513]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations Section Alignment Fix */}
            <div className="mt-16 pt-16 border-t border-gray-100">
              <div className="flex items-center justify-between mb-10 px-2">
                <div>
                  <h2 className="text-[20px] font-black uppercase tracking-tighter text-[#5C2E00]">Vous pourriez aussi aimer</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sélectionnés pour vous</p>
                </div>
                <div className="h-px flex-1 bg-gray-100 mx-8 hidden sm:block" />
              </div>
              <ProductCarousel
                items={recommendations as any}
                onAdd={(item) => addToCart(item as any)}
                itemsPerSlide={4}
              />
            </div>
          </div>

          {/* Cart Summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-white shadow-2xl border border-gray-100 p-8 space-y-8">
              <div className="space-y-6">
                <h2 className="text-[16px] font-black uppercase tracking-widest text-[#5C2E00] border-b border-gray-100 pb-4">Résumé de Commande</h2>

                {/* Progress Bar for Free Shipping */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Progression Livraison Gratuite</span>
                    <span className="text-[10px] font-black text-[#5C2E00]">{Math.min(Math.round((totalPrice / freeShippingThreshold) * 100), 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-[#db6513] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(219,101,19,0.3)]"
                      style={{ width: `${Math.min((totalPrice / freeShippingThreshold) * 100), 100}%` }}
                    />
                  </div>
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-[10px] font-bold text-gray-500 italic">Plus que <span className="text-[#db6513] font-black">{formatPrice(remainingForFreeShipping)}</span> pour profiter de la livraison offerte !</p>
                  ) : (
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">✓ Félicitations ! Votre livraison est offerte.</p>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center text-[12px] font-bold text-gray-500">
                    <span className="uppercase tracking-widest">{totalItems > 1 ? `${totalItems} Articles` : '1 Article'}</span>
                    <span className="font-black text-[#5C2E00]">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-gray-500">
                    <span className="uppercase tracking-widest">Livraison</span>
                    <span className="font-black text-[#5C2E00]">{totalPrice >= freeShippingThreshold ? "OFFERT" : formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#5C2E00]">Total TTC</span>
                    <span className="text-[32px] font-black text-[#db6513] tracking-tighter leading-none">
                      {formatPrice(totalPrice >= freeShippingThreshold ? totalPrice : totalTTC)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full bg-[#111827] hover:bg-[#db6513] text-white hover:text-[#5C2E00] font-black uppercase text-[12px] tracking-[0.25em] py-5 shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5 fill-current transition-transform group-hover:rotate-12" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.894 4.445-9.897 9.896 0 2.132.569 3.591 1.573 5.323l-1.034 3.775 3.974-1.043zm11.367-7.635c-.195-.101-1.148-.567-1.326-.631-.178-.065-.307-.1-.437.1-.13.2-.503.631-.617.762-.113.13-.227.147-.422.045-.195-.102-.823-.304-1.567-.968-.58-.517-.971-1.156-1.084-1.352-.114-.197-.011-.302.088-.401.089-.089.195-.227.292-.34.098-.113.13-.194.195-.324.065-.13.033-.243-.016-.341-.049-.1-.437-1.052-.599-1.442-.158-.38-.311-.327-.427-.333-.11-.005-.235-.006-.361-.006s-.328.045-.5.234c-.171.188-.65.635-.65 1.548 0 .913.664 1.795.756 1.918.091.122 1.307 1.995 3.167 2.798.442.19.786.305 1.056.39.444.141.849.121 1.169.073.357-.053 1.148-.47 1.31-.923.162-.454.162-.843.113-.923-.049-.08-.178-.129-.373-.23z" />
                  </svg>
                  Commander via WhatsApp
                </button>
                <Link
                  to="/boutique"
                  className="w-full h-14 border border-gray-200 text-gray-400 hover:text-[#5C2E00] hover:border-[#5C2E00] font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <span className="mr-1">←</span> Retour à la Collection
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 opacity-40 grayscale">
                {/* Re-using some generic payment icons / text */}
                <span className="text-[8px] font-black uppercase tracking-tighter">Visa</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Mastercard</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Paypal</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Stripe</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        items={cart}
        totalPrice={totalPrice >= freeShippingThreshold ? totalPrice : totalTTC}
      />
    </div>
  );
};

export default Panier;
