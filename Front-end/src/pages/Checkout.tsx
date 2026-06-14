import { Link, useNavigate } from 'react-router-dom';
import { getWhatsAppLink, getColorName } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ShoppingCart, CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import OrderSuccessModal from '@/components/OrderSuccessModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { API_BASE } from '@/config';

import { useSettings } from '@/hooks/useSettings';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { settings } = useSettings();
  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    country: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("+212649595793");

  useEffect(() => {
    fetch(`${API_BASE}/settings/whatsapp_number`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.value) {
          setWhatsappNumber(res.data.value);
        }
      })
      .catch((err) => {
        console.error("Error fetching whatsapp number:", err);
      });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const subtotal = totalPrice;
  const shipping = 0.00; // HERMADO: Global Free Shipping
  const total = subtotal + shipping;

  const buildWhatsAppMessage = (formData, cartItems, totalValue) => {
    const itemsList = cartItems
      .map(
        (item) =>
          `▸ ${item.name} (Taille: ${item.selectedSize || item.size || 'N/A'}, Couleur: ${getColorName(item.selectedColor || item.color)}, x${item.quantity}) — ${(item.price * item.quantity).toFixed(2)} MAD`
      )
      .join("\n");

    const message = `
🛍️ *NOUVELLE COMMANDE — HERMADO*
━━━━━━━━━━━━━━━━━━━━━━
👤 *CLIENT*
- Prénom : ${formData.firstName}
- Nom : ${formData.lastName}
- Téléphone : ${formData.phone}
- Email : ${formData.email}

📍 *ADRESSE DE LIVRAISON*
- Adresse : ${formData.address}
- Ville : ${formData.city}
- Région : ${formData.country}

🛒 *ARTICLES COMMANDÉS*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━
💰 Sous-total : ${totalValue.toFixed(2)} MAD
🚚 Livraison : Gratuite
✅ *TOTAL : ${totalValue.toFixed(2)} MAD*
━━━━━━━━━━━━━━━━━━━━━━
📅 Date : ${new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}
    `.trim();

    return message;
  };

  const sendToWhatsApp = (formData, cartItems, totalValue) => {
    const message = buildWhatsAppMessage(formData, cartItems, totalValue);
    const cleanNumber = whatsappNumber.replace(/[\s\-\+]/g, "");
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePlaceOrder = async () => {
    if (!agreeToTerms) {
      toast.error("Veuillez accepter les conditions générales.");
      return;
    }

    const requiredFields = ['firstName', 'lastName', 'country', 'address', 'city', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !billingDetails[field as keyof typeof billingDetails]);

    if (missingFields.length > 0) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsProcessing(true);
    try {
      // Send POST request to backend API
      const apiPayload = {
        items: cart.map(item => ({
          productId: item.id || item.productId,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || item.size,
          selectedColor: item.selectedColor || item.color
        })),
        shippingInfo: {
          firstName: billingDetails.firstName,
          lastName: billingDetails.lastName,
          phone: billingDetails.phone,
          email: billingDetails.email || 'whatsapp-order@hermado.ma',
          address1: billingDetails.address,
          city: billingDetails.city,
          region: billingDetails.country || 'Casablanca-Settat',
          postalCode: '00000',
        },
        paymentMethod: 'CASH_ON_DELIVERY',
        shippingMethod: 'STANDARD',
        notes: `Commande WhatsApp depuis la page Checkout.`
      };

      await fetch(`${API_BASE}/api/v1/orders/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      // Send to WhatsApp
      sendToWhatsApp(billingDetails, cart, total);

      // Clear cart
      clearCart();

      // Show success screen
      setOrderSuccess(true);

    } catch (error) {
      console.error("Order error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[22px] font-black uppercase tracking-wider text-gray-900 mb-3">
            Commande Envoyée !
          </h2>
          <p className="text-[12px] text-gray-500 leading-relaxed mb-2">
            Votre commande a été envoyée sur WhatsApp.
            Notre équipe vous contactera dans les plus brefs délais
            pour confirmer et organiser la livraison.
          </p>
          <p className="text-[11px] text-[#db6513] font-bold uppercase tracking-wider mb-8">
            Merci de faire confiance à Hermado 🧡
          </p>
          <a
            href="/"
            className="inline-block bg-[#db6513] hover:bg-[#c45610] text-white text-[11px] font-black uppercase tracking-widest px-8 py-3 rounded-sm transition-all shadow-md shadow-[#db651330]"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-10 md:mb-16">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-3 tracking-tight">Finaliser la commande</h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">Veuillez remplir les informations ci-dessous pour confirmer votre commande.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            {/* Billing Details */}
            <div className="space-y-10">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/95 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl text-primary">Détails de facturation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                        Prénom *
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        value={billingDetails.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Entrez votre prénom"
                        required
                        className="h-12 border-border focus:border-primary focus:ring-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-primary/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                        Nom *
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        value={billingDetails.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Nom de famille"
                        required
                        className="h-12 border-border focus:border-primary focus:ring-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                      Région / Province *
                    </label>
                    <Select value={billingDetails.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className="h-12 border-border focus:border-primary focus:ring-primary rounded-lg transition-all duration-200 hover:border-primary/50">
                        <SelectValue placeholder="Sélectionnez votre région" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agadir-ida-ou-tanane">Agadir-Ida Ou Tanane</SelectItem>
                        <SelectItem value="azilal">Azilal</SelectItem>
                        <SelectItem value="beni-mellal">Béni-Mellal</SelectItem>
                        <SelectItem value="berkane">Berkane</SelectItem>
                        <SelectItem value="ben-slimane">Ben Slimane</SelectItem>
                        <SelectItem value="boujdour">Boujdour</SelectItem>
                        <SelectItem value="boulemane">Boulemane</SelectItem>
                        <SelectItem value="berrechid">Berrechid</SelectItem>
                        <SelectItem value="casablanca">Casablanca</SelectItem>
                        <SelectItem value="chefchaouen">Chefchaouen</SelectItem>
                        <SelectItem value="chichaoua">Chichaoua</SelectItem>
                        <SelectItem value="chtouka-ait-baha">Chtouka Aït Baha</SelectItem>
                        <SelectItem value="driouch">Driouch</SelectItem>
                        <SelectItem value="essaouira">Essaouira</SelectItem>
                        <SelectItem value="errachidia">Errachidia</SelectItem>
                        <SelectItem value="fahs-beni-makada">Fahs-Beni Makada</SelectItem>
                        <SelectItem value="fes-dar-dbibegh">Fès-Dar-Dbibegh</SelectItem>
                        <SelectItem value="figuig">Figuig</SelectItem>
                        <SelectItem value="fquih-ben-salah">Fquih Ben Salah</SelectItem>
                        <SelectItem value="guelmim">Guelmim</SelectItem>
                        <SelectItem value="guercif">Guercif</SelectItem>
                        <SelectItem value="el-hajeb">El Hajeb</SelectItem>
                        <SelectItem value="al-haouz">Al Haouz</SelectItem>
                        <SelectItem value="al-hoceima">Al Hoceïma</SelectItem>
                        <SelectItem value="ifrane">Ifrane</SelectItem>
                        <SelectItem value="inezgane-ait-melloul">Inezgane-Aït Melloul</SelectItem>
                        <SelectItem value="el-jadida">El Jadida</SelectItem>
                        <SelectItem value="jerada">Jerada</SelectItem>
                        <SelectItem value="kenitra">Kénitra</SelectItem>
                        <SelectItem value="kelaat-sraghna">Kelaat Sraghna</SelectItem>
                        <SelectItem value="khemisset">Khemisset</SelectItem>
                        <SelectItem value="khenifra">Khénifra</SelectItem>
                        <SelectItem value="khouribga">Khouribga</SelectItem>
                        <SelectItem value="laayoune">Laâyoune</SelectItem>
                        <SelectItem value="larache">Larache</SelectItem>
                        <SelectItem value="marrakech">Marrakech</SelectItem>
                        <SelectItem value="mdiq-fnideq">M'diq-Fnideq</SelectItem>
                        <SelectItem value="mediouna">Médiouna</SelectItem>
                        <SelectItem value="meknes">Meknès</SelectItem>
                        <SelectItem value="midelt">Midelt</SelectItem>
                        <SelectItem value="marrakech-medina">Marrakech-Medina</SelectItem>
                        <SelectItem value="marrakech-menara">Marrakech-Menara</SelectItem>
                        <SelectItem value="mohammedia">Mohammedia</SelectItem>
                        <SelectItem value="moulay-yacoub">Moulay Yacoub</SelectItem>
                        <SelectItem value="nador">Nador</SelectItem>
                        <SelectItem value="nouaceur">Nouaceur</SelectItem>
                        <SelectItem value="ouarzazate">Ouarzazate</SelectItem>
                        <SelectItem value="oued-ed-dahab">Oued Ed-Dahab</SelectItem>
                        <SelectItem value="oujda-angad">Oujda-Angad</SelectItem>
                        <SelectItem value="ouezzane">Ouezzane</SelectItem>
                        <SelectItem value="rabat">Rabat</SelectItem>
                        <SelectItem value="rehamna">Rehamna</SelectItem>
                        <SelectItem value="safi">Safi</SelectItem>
                        <SelectItem value="sale">Salé</SelectItem>
                        <SelectItem value="sefrou">Sefrou</SelectItem>
                        <SelectItem value="settat">Settat</SelectItem>
                        <SelectItem value="sidi-bennour">Sidi Bennour</SelectItem>
                        <SelectItem value="sidi-ifni">Sidi Ifni</SelectItem>
                        <SelectItem value="sidi-kacem">Sidi Kacem</SelectItem>
                        <SelectItem value="sidi-slimane">Sidi Slimane</SelectItem>
                        <SelectItem value="skhirat-temara">Skhirat-Témara</SelectItem>
                        <SelectItem value="sidi-youssef-ben-ali">Sidi Youssef Ben Ali</SelectItem>
                        <SelectItem value="tarfaya">Tarfaya (EH-partial)</SelectItem>
                        <SelectItem value="taourirt">Taourirt</SelectItem>
                        <SelectItem value="taounate">Taounate</SelectItem>
                        <SelectItem value="taroudant">Taroudant</SelectItem>
                        <SelectItem value="tata">Tata</SelectItem>
                        <SelectItem value="taza">Taza</SelectItem>
                        <SelectItem value="tetouan">Tétouan</SelectItem>
                        <SelectItem value="tinghir">Tinghir</SelectItem>
                        <SelectItem value="tiznit">Tiznit</SelectItem>
                        <SelectItem value="tangier-assilah">Tangier-Assilah</SelectItem>
                        <SelectItem value="tan-tan">Tan-Tan</SelectItem>
                        <SelectItem value="youssoufia">Youssoufia</SelectItem>
                        <SelectItem value="zagora">Zagora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                      Adresse *
                    </label>
                    <Input
                      type="text"
                      value={billingDetails.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Entrez votre adresse complète"
                      required
                      className="h-12 border-border focus:border-primary focus:ring-primary rounded-lg transition-all duration-200 hover:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                      Ville *
                    </label>
                    <Input
                      type="text"
                      value={billingDetails.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Entrez votre ville"
                      required
                      className="h-12 border-border focus:border-primary focus:ring-primary rounded-lg transition-all duration-200 hover:border-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                        Téléphone *
                      </label>
                      <Input
                        type="tel"
                        value={billingDetails.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+212 6XX XXX XXX"
                        required
                        className="h-12 border-border focus:border-primary focus:ring-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3 tracking-wide">
                        E-mail *
                      </label>
                      <Input
                        type="email"
                        value={billingDetails.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="h-12 border-border focus:border-primary focus:ring-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-primary/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-8">
              <Card className="shadow-xl border-0 bg-gray-50 hover:shadow-2xl transition-all duration-300 sticky top-8">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                      <ShoppingCart className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl text-primary">Résumé de la commande</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-3 px-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex-1">
                          <span className="text-foreground font-medium">{item.name}</span>
                          <span className="text-muted-foreground ml-2 text-sm">× {item.quantity}</span>
                        </div>
                        <div className="text-primary font-bold text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Calculations */}
                  <div className="space-y-3 border-t border-border pt-4 px-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground font-medium">Sous-total</span>
                      <span className="text-foreground font-semibold text-lg">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground font-medium">Livraison</span>
                      <div className="text-right">
                        <div className="text-foreground font-semibold">Gratuite</div>
                        <div className="text-muted-foreground text-xs">Livraison standard</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-t-2 border-primary bg-gray-50 rounded-lg px-4 mt-4">
                      <span className="text-xl font-bold text-primary">Total</span>
                      <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors duration-200">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                        required
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1 transition-all duration-200 hover:border-primary/70"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer hover:text-foreground transition-colors duration-200">
                        J'ai lu et j'accepte les {' '}
                        <Link to="/terms" className="text-primary hover:text-primary/80 font-semibold underline transition-colors duration-200">
                          conditions générales
                        </Link>{' '}
                        *
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4 mt-8">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handlePlaceOrder}
                          disabled={!agreeToTerms || isProcessing}
                          className="w-full flex items-center justify-center gap-3 bg-[#db6513] hover:bg-[#c45610] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-[12px] font-black uppercase tracking-[0.15em] px-6 py-4 rounded-sm transition-all duration-200 shadow-md shadow-[#db651330] hover:-translate-y-0.5 h-auto"
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Traitement en cours...
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {/* WhatsApp icon */}
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Confirmer via WhatsApp
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{agreeToTerms ? "Cliquez pour finaliser votre commande" : "Veuillez accepter les conditions générales"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Link to="/boutique" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 font-semibold rounded-lg transition-all duration-300"
                      >
                        Retour à la boutique
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* Removed OrderSuccessModal as it's replaced by full-screen success state */}
    </TooltipProvider>
  );
};

export default Checkout;