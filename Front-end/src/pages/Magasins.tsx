import { MapPin, Clock, Phone, Search, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const stores = [
  // Rabat locations
  {
    name: 'Herbio Al Manal (CYM)',
    address: 'Al manal, Amal 5, Al Massira, CYM, Rabat',
    phone: '0661954937',
    hours: '09:00–19:00',
    lat: 34.017,
    lng: -6.867,
  },
  {
    name: 'Herbio Rabat - Agdal',
    address: 'Avenue Fal Ould Oumeir, Agdal, Rabat',
    phone: '0661954937',
    hours: '09:00–19:00',
    lat: 34.013,
    lng: -6.839,
  },
  {
    name: 'Herbio Rabat - Centre Ville',
    address: 'Avenue Mohammed V, Centre Ville, Rabat',
    phone: '0661954937',
    hours: '09:00–19:00',
    lat: 34.020,
    lng: -6.835,
  },
  {
    name: 'Herbio Rabat - Hay Riad',
    address: 'Avenue Annakhil, Hay Riad, Rabat',
    phone: '0661954937',
    hours: '09:00–19:00',
    lat: 34.026,
    lng: -6.867,
  },
];

const Magasins = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Nos Magasins</span>
      </div>

      {/* Page header */}
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-wide mb-2">Nos Magasins</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-6">
          Trouvez le magasin Fadel trading le plus proche de chez vous.
        </p>
        {/* Contact info from footer */}
        <div className="bg-muted rounded-xl p-4 md:p-6 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Al manal, Amal 5, Al Massira, CYM, Rabat.</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <span>0661954937</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span>contact@herbio.ma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Locator section */}
      <div className="container mx-auto px-4">
        {/* Search bar */}
        <div className="bg-muted rounded-xl p-3 md:p-4 flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par adresse, quartier..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground"
            aria-label="Rechercher un magasin"
          />
        </div>

        {/* Map + list layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Map */}
          <div className="lg:col-span-8">
            <div className="relative w-full h-[420px] md:h-[520px] rounded-xl overflow-hidden border border-border">
              <iframe
                title="Carte des magasins Fadel trading"
                className="absolute inset-0 w-full h-full"
                src="https://www.google.com/maps?q=Rabat%2C%20Morocco&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Simple markers overlay to suggest multiple points */}
              <div className="absolute inset-0">
                {stores.map((store, idx) => (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 -translate-y-full"
                    style={{
                      left: `${20 + idx * 15}%`,
                      top: `${40 + (idx % 3) * 12}%`,
                    }}
                  >
                    <div className="bg-white border border-border rounded-lg shadow-sm px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{store.name}</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button className="text-xs px-2 py-1 border rounded-md">Itinéraire</button>
                        <button className="text-xs px-2 py-1 border rounded-md">En savoir plus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Store list */}
          <div className="lg:col-span-4">
            <div className="space-y-4">
              {stores.map((store, idx) => (
                <div key={idx} className="border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.address}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <Phone className="w-4 h-4" /> <span>{store.phone}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <Clock className="w-4 h-4" /> <span>Ouvert de {store.hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Magasins;