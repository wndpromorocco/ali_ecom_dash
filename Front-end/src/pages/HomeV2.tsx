import React, { useState, useMemo } from 'react';
import { Star, Truck, Leaf, Users, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useCart } from '@/contexts/CartContext';
import HoneyJarImage from '@/assets/maximilian-muller-DVgDtF_naaE-unsplash.jpg';
import CoopBasketImage from '@/assets/jan-kraus-ZCbbgeN2pPI-unsplash.jpg';

const HomeV2 = () => {
  const { addToCart } = useCart();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Use centralized catalog hook
  const { products: apiProducts, categories: apiCategories, isLoading } = useCatalog();

  const categories = useMemo(() => {
    return ['Tous', ...apiCategories];
  }, [apiCategories]);

  const filteredProducts = selectedCategory === 'Tous'
    ? apiProducts
    : apiProducts.filter(product => product.category === selectedCategory);

  const displayedProducts = filteredProducts.slice(0, 8);

  const testimonials = [
    {
      id: 1,
      name: "Khadija Benali",
      location: "Rabat",
      rating: 5,
      text: "Produit 100% authentique comme promis. Service respectueux et livraison rapide. Merci pour ce service exceptionnel",
      avatar: "K"
    },
    {
      id: 2,
      name: "Ahmed Maghribi",
      location: "Rabat",
      rating: 5,
      text: "La meilleure huile que j'ai achetée. Qualité excellente et prix raisonnable. Je commanderai à nouveau sans hésitation",
      avatar: "A"
    },
    {
      id: 3,
      name: "Fatima Zahra",
      location: "Casablanca",
      rating: 5,
      text: "Produit fantastique et qualité excellente. Reçu en un temps record et le service était parfait. Je recommande vivement",
      avatar: "F"
    },
    {
      id: 4,
      name: "Mohamed Tazi",
      location: "Meknès",
      rating: 5,
      text: "Expérience d'achat excellente du début à la fin. Produit authentique et livraison respectueuse comme promis. Excellent travail",
      avatar: "M"
    },
    {
      id: 5,
      name: "Aicha Qasimi",
      location: "Agadir",
      rating: 5,
      text: "Produit qui vaut chaque dirham dépensé. Emballage élégant et qualité exceptionnelle. Merci pour toute cette expérience",
      avatar: "A"
    },
    {
      id: 6,
      name: "Youssef Idrissi",
      location: "Marrakech",
      rating: 5,
      text: "Qualité exceptionnelle et produit remarquable. La commande est arrivée en parfait état. Service client et réactivité rapides",
      avatar: "Y"
    }
  ];

  const faqs = [
    {
      id: 1,
      question: "Comment puis-je payer ?",
      answer: "Nous acceptons tous les modes de paiement sécurisés, y compris les cartes de crédit, le paiement à la livraison et le virement bancaire."
    },
    {
      id: 2,
      question: "Combien de temps prend la livraison ?",
      answer: "La livraison prend de 24 à 48 heures dans les grandes villes, et 3 à 5 jours pour les zones éloignées."
    },
    {
      id: 3,
      question: "La livraison est-elle gratuite ?",
      answer: "Oui, la livraison est gratuite pour les commandes de plus de 200 dirhams. Pour les commandes inférieures, les frais de livraison sont de 25 dirhams."
    },
    {
      id: 4,
      question: "Que faire si le produit ne me plaît pas ?",
      answer: "Vous pouvez retourner le produit dans les 7 jours suivant la réception avec une garantie de remboursement intégral."
    },
    {
      id: 5,
      question: "Les produits sont-ils authentiques ?",
      answer: "Tous nos produits sont 100% authentiques et proviennent directement des producteurs locaux et des coopératives."
    },
    {
      id: 6,
      question: "Comment puis-je suivre ma commande ?",
      answer: "Vous recevrez un numéro de suivi par SMS et e-mail dès l'expédition de votre commande."
    },
    {
      id: 7,
      question: "Puis-je modifier ou annuler ma commande ?",
      answer: "Vous pouvez modifier ou annuler votre commande dans l'heure suivant la confirmation. Après cela, aucune modification n'est possible."
    },
    {
      id: 8,
      question: "Quelles sont les zones de livraison ?",
      answer: "Nous livrons dans tout le Maroc, y compris les grandes villes et les zones éloignées."
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#E8F5E3] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <span className="text-[#2D5F2E]">✓</span> COOPERATIVE HERBIO - PRODUITS AUTHENTIQUES
              </div>

              <h1 className="text-2xl md:text-5xl font-bold text-[#1a1a1a] leading-tight">
                Bienvenue chez Herbio
                <br />
                du Terroir
              </h1>

              <p className="text-base text-gray-700 leading-relaxed max-w-lg">
                Découvrez la plus belle sélection de produits naturels et biologiques, soigneusement sélectionnés pour votre famille et votre bien-être au quotidien
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="bg-[#2D5F2E] hover:bg-[#244a25] text-white px-8 py-3 text-base font-semibold rounded-md transition-colors">
                  Acheter Maintenant
                </button>
                <button className="border-2 border-[#2D5F2E] text-[#2D5F2E] hover:bg-[#2D5F2E] hover:text-white px-8 py-3 text-base font-semibold rounded-md transition-colors">
                  En Savoir Plus
                </button>
              </div>
            </div>

            <div className="relative">
              <img
                src={CoopBasketImage}
                alt="Produits de la coopérative Herbio"
                className="w-full h-[500px] object-cover rounded-2xl shadow-lg"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-[#2D5F2E]">100%</div>
                <div className="text-xs text-gray-600">Bio & Authentique</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi Nous Choisir */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
              Pourquoi Nous Choisir ?
            </h2>
            <p className="text-base text-gray-700 max-w-2xl mx-auto">
              Découvrez ce qui fait de nous votre partenaire de confiance pour des produits authentiques et de qualité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a1a] mb-3">Qualité Garantie</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Produits 100% bio certifiés et rigoureusement contrôlés selon les standards les plus élevés
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a1a] mb-3">Impact Social</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Soutenez directement les familles d'agriculteurs et contribuez au développement local durable
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a1a] mb-3">Authenticité</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Recettes traditionnelles préservées et transmises depuis des générations avec passion
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#2D5F2E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a1a] mb-3">Fraîcheur Optimale</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Livraison rapide et soignée directement de la ferme pour préserver toute la fraîcheur
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Produits Vedettes */}
      <section className="py-16 px-4 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Nos Produits Vedettes</h2>
            <p className="text-base text-gray-700 max-w-2xl mx-auto">
              Découvrez notre sélection de produits fraîchement cueillis de notre exploitation
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                  ? 'bg-[#2D5F2E] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {isLoading ? (
              <div className="col-span-full py-10 text-center text-muted-foreground animate-pulse">Chargement des produits...</div>
            ) : (
              displayedProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 left-3 bg-[#2D5F2E] text-white px-3 py-1 rounded-md text-xs font-semibold">
                      Bio
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-base text-[#1a1a1a] mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-[#2563EB]" />
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#2D5F2E]">{product.price} MAD</span>
                      <button
                        className="bg-[#2D5F2E] hover:bg-[#244a25] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                        onClick={() => addToCart(product)}
                        aria-label={`Ajouter ${product.name} au panier`}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center">
            <button className="bg-[#2D5F2E] hover:bg-[#244a25] text-white px-8 py-3 rounded-md text-base font-semibold transition-colors">
              Voir tous les Produits
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-base text-gray-700">
              Nous nous efforçons continuellement d'offrir la meilleure expérience d'achat en ligne à nos précieux clients
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-[#2563EB]" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2D5F2E] rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#1a1a1a]">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#2563EB] text-[#1a1a1a] px-6 py-3 rounded-full text-base font-semibold">
              <span>⭐ 4,9/5</span>
              <span className="text-sm">sur 1000+ avis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kitchen Products */}
      <section className="py-16 px-4 bg-[#FFF8E7]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                PRODUITS DE LA CUISINE
              </div>

              <h2 className="text-2xl md:text-4xl font-bold text-[#1a1a1a] mb-6">
                Miels & Produits
                <br />
                <span className="text-yellow-600">de la Ruche</span>
              </h2>

              <p className="text-base text-gray-700 mb-8 leading-relaxed">
                Découvrez nos miels purs et authentiques, récoltés avec soin par nos apiculteurs locaux.
                Une sélection premium de produits naturels issus de nos ruches artisanales.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#2D5F2E]/10 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#2D5F2E] rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">100% BIO</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#2D5F2E]/10 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#2D5F2E] rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">SANS ADDITIFS</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#2D5F2E]/10 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#2D5F2E] rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">EMBALLAGE ÉCOLOGIQUE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#2D5F2E]/10 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#2D5F2E] rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">LIVRAISON RAPIDE</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="bg-[#2D5F2E] hover:bg-[#244a25] text-white px-6 py-3 rounded-md font-semibold transition-colors">
                  Découvrir nos Miels
                </button>
                <button className="border-2 border-[#2D5F2E] text-[#2D5F2E] hover:bg-[#2D5F2E] hover:text-white px-6 py-3 rounded-md font-semibold transition-colors">
                  En Savoir Plus
                </button>
              </div>
            </div>

            <div className="relative">
              <img
                src={HoneyJarImage}
                alt="Miels et produits de la ruche"
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">
              Questions Fréquemment Posées
            </h2>
            <p className="text-base text-gray-700">
              Trouvez rapidement les réponses aux questions les plus courantes sur nos produits et services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#1a1a1a]">{faq.question}</span>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-[#2D5F2E]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#1B4332] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Rejoignez la Communauté Herbio
          </h2>
          <p className="text-lg mb-10 opacity-90 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles, offres exclusives et conseils sur nos produits biologiques
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/50 outline-none"
            />
            <button className="bg-[#FFD700] text-[#1a1a1a] hover:bg-[#2563EB] px-6 py-3 rounded-md font-semibold transition-colors">
              S'inscrire
            </button>
          </div>

          <p className="text-sm opacity-75 mt-4">
            Nous respectons votre vie privée. Désabonnez-vous à tout moment.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomeV2;
