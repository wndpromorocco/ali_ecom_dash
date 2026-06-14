import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, MapPin, Phone, Mail, Save, CheckCircle2 } from 'lucide-react';
import { API_BASE, DOMAIN_BASE } from '@/config';
import { toast } from 'sonner';

const Portfolio = () => {
    const { user, fetchProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [address, setAddress] = useState({
        id: '',
        firstName: '',
        lastName: '',
        region: '',
        address1: '',
        city: '',
        phone: '',
        email: '',
    });

    const regions = [
        { value: "agadir-ida-ou-tanane", label: "Agadir-Ida Ou Tanane" },
        { value: "azilal", label: "Azilal" },
        { value: "beni-mellal", label: "Béni-Mellal" },
        { value: "berkane", label: "Berkane" },
        { value: "ben-slimane", label: "Ben Slimane" },
        { value: "boujdour", label: "Boujdour" },
        { value: "boulemane", label: "Boulemane" },
        { value: "berrechid", label: "Berrechid" },
        { value: "casablanca", label: "Casablanca" },
        { value: "chefchaouen", label: "Chefchaouen" },
        { value: "chichaoua", label: "Chichaoua" },
        { value: "chtouka-ait-baha", label: "Chtouka Aït Baha" },
        { value: "driouch", label: "Driouch" },
        { value: "essaouira", label: "Essaouira" },
        { value: "errachidia", label: "Errachidia" },
        { value: "fahs-beni-makada", label: "Fahs-Beni Makada" },
        { value: "fes-dar-dbibegh", label: "Fès-Dar-Dbibegh" },
        { value: "figuig", label: "Figuig" },
        { value: "fquih-ben-salah", label: "Fquih Ben Salah" },
        { value: "guelmim", label: "Guelmim" },
        { value: "guercif", label: "Guercif" },
        { value: "el-hajeb", label: "El Hajeb" },
        { value: "al-haouz", label: "Al Haouz" },
        { value: "al-hoceima", label: "Al Hoceïma" },
        { value: "ifrane", label: "Ifrane" },
        { value: "inezgane-ait-melloul", label: "Inezgane-Aït Melloul" },
        { value: "el-jadida", label: "El Jadida" },
        { value: "jerada", label: "Jerada" },
        { value: "kenitra", label: "Kénitra" },
        { value: "kelaat-sraghna", label: "Kelaat Sraghna" },
        { value: "khemisset", label: "Khemisset" },
        { value: "khenifra", label: "Khénifra" },
        { value: "khouribga", label: "Khouribga" },
        { value: "laayoune", label: "Laâyoune" },
        { value: "larache", label: "Larache" },
        { value: "marrakech", label: "Marrakech" },
        { value: "mdiq-fnideq", label: "M'diq-Fnideq" },
        { value: "mediouna", label: "Médiouna" },
        { value: "meknes", label: "Meknès" },
        { value: "midelt", label: "Midelt" },
        { value: "marrakech-medina", label: "Marrakech-Medina" },
        { value: "marrakech-menara", label: "Marrakech-Menara" },
        { value: "mohammedia", label: "Mohammedia" },
        { value: "moulay-yacoub", label: "Moulay Yacoub" },
        { value: "nador", label: "Nador" },
        { value: "nouaceur", label: "Nouaceur" },
        { value: "ouarzazate", label: "Ouarzazate" },
        { value: "oued-ed-dahab", label: "Oued Ed-Dahab" },
        { value: "oujda-angad", label: "Oujda-Angad" },
        { value: "ouezzane", label: "Ouezzane" },
        { value: "rabat", label: "Rabat" },
        { value: "rehamna", label: "Rehamna" },
        { value: "safi", label: "Safi" },
        { value: "sale", label: "Salé" },
        { value: "sefrou", label: "Sefrou" },
        { value: "settat", label: "Settat" },
        { value: "sidi-bennour", label: "Sidi Bennour" },
        { value: "sidi-ifni", label: "Sidi Ifni" },
        { value: "sidi-kacem", label: "Sidi Kacem" },
        { value: "sidi-slimane", label: "Sidi Slimane" },
        { value: "skhirat-temara", label: "Skhirat-Témara" },
        { value: "sidi-youssef-ben-ali", label: "Sidi Youssef Ben Ali" },
        { value: "tarfaya", label: "Tarfaya" },
        { value: "taourirt", label: "Taourirt" },
        { value: "taounate", label: "Taounate" },
        { value: "taroudant", label: "Taroudant" },
        { value: "tata", label: "Tata" },
        { value: "taza", label: "Taza" },
        { value: "tetouan", label: "Tétouan" },
        { value: "tinghir", label: "Tinghir" },
        { value: "tiznit", label: "Tiznit" },
        { value: "tangier-assilah", label: "Tangier-Assilah" },
        { value: "tan-tan", label: "Tan-Tan" },
        { value: "youssoufia", label: "Youssoufia" },
        { value: "zagora", label: "Zagora" }
    ];

    useEffect(() => {
        const fetchDefaultAddress = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const res = await fetch(`${API_BASE}/addresses/default`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (res.ok && json.data) {
                    setAddress({
                        id: json.data.id,
                        firstName: json.data.firstName || user?.firstName || '',
                        lastName: json.data.lastName || user?.lastName || '',
                        region: json.data.region || '',
                        address1: json.data.address1 || '',
                        city: json.data.city || '',
                        phone: json.data.phone || '',
                        email: json.data.email || user?.email || '',
                    });
                } else if (!res.ok && res.status === 404) {
                    // Si on n'a pas encore d'adresse par défaut, on pré-remplit avec les infos du token
                    setAddress(prev => ({
                        ...prev,
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || ''
                    }));
                } else {
                    // Autres cas (succès sans data par ex)
                    setAddress(prev => ({
                        ...prev,
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || ''
                    }));
                }
            } catch (e) {
                console.error('Error fetching defaults:', e);
            } finally {
                setFetching(false);
            }
        };

        if (user) {
            fetchDefaultAddress();
        } else {
            setFetching(false);
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setLoading(true);
        try {
            const isUpdate = !!address.id;
            const url = isUpdate ? `${API_BASE}/addresses/${address.id}` : `${API_BASE}/addresses`;
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: address.firstName,
                    lastName: address.lastName,
                    region: address.region,
                    address1: address.address1,
                    city: address.city,
                    phone: address.phone.replace(/\s+/g, ''), // Sanitize phone
                    email: address.email,
                    isDefault: true,
                    postalCode: '00000'
                })
            });

            if (res.ok) {
                const json = await res.json();
                if (!isUpdate) setAddress(prev => ({ ...prev, id: json.data.id }));
                await fetchProfile(); // Sync new profile data to global AuthContext
                toast.success('Profil mis à jour avec succès');
            } else {
                let errorMsg = 'Erreur lors de la sauvegarde';
                try {
                    const errJson = await res.json();
                    errorMsg = errJson.message || errorMsg;
                } catch (jsonError) {
                    errorMsg = `Status ${res.status}: ${res.statusText}`;
                }
                console.error("Portfolio save error API response:", res.status, errorMsg);
                toast.error(errorMsg);
            }
        } catch (e: any) {
            console.error("Portfolio save network error:", e);
            toast.error(`Erreur réseau: ${e.message || 'Impossible de joindre le serveur'}`);
        } finally {
            setLoading(true);
            // Brief delay to show success state
            setTimeout(() => setLoading(false), 500);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <User className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
                <p className="text-muted-foreground mb-6">Connectez-vous pour gérer votre profil.</p>
                <Link to="/compte">
                    <Button>Se connecter</Button>
                </Link>
            </div>
        );
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="account-page max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumb */}
            <nav className="acc-breadcrumb mb-10">
                <Link to="/" className="acc-crumb text-sm hover:text-primary transition-colors">Accueil</Link>
                <span className="acc-sep opacity-50" aria-hidden>/</span>
                <Link to="/compte" className="acc-crumb text-sm hover:text-primary transition-colors">Espace Personnel</Link>
                <span className="acc-sep opacity-50" aria-hidden>/</span>
                <span className="acc-crumb acc-current font-bold text-sm">Mon Profil</span>
            </nav>

            <header className="mb-12 text-center">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase">MON PROFIL</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Enregistrez vos informations une seule fois pour commander plus rapidement lors de vos prochains achats.
                </p>
            </header>

            <div className="bg-white border rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5">
                <form onSubmit={handleSave} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* First Name */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold ml-1">
                                <User className="w-4 h-4 text-primary" /> Prénom *
                            </label>
                            <Input
                                value={address.firstName}
                                onChange={e => setAddress({ ...address, firstName: e.target.value })}
                                placeholder="Votre prénom"
                                className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5"
                                required
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold ml-1">
                                <User className="w-4 h-4 text-primary" /> Nom *
                            </label>
                            <Input
                                value={address.lastName}
                                onChange={e => setAddress({ ...address, lastName: e.target.value })}
                                placeholder="Votre nom"
                                className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5"
                                required
                            />
                        </div>
                    </div>

                    {/* Region */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold ml-1">
                            <MapPin className="w-4 h-4 text-primary" /> Région / Province *
                        </label>
                        <Select
                            value={address.region}
                            onValueChange={val => setAddress({ ...address, region: val })}
                        >
                            <SelectTrigger className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5">
                                <SelectValue placeholder="Sélectionnez votre région" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {regions.map(r => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Address */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold ml-1">
                            <MapPin className="w-4 h-4 text-primary" /> Adresse *
                        </label>
                        <Input
                            value={address.address1}
                            onChange={e => setAddress({ ...address, address1: e.target.value })}
                            placeholder="Numéro et nom de rue"
                            className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5"
                            required
                        />
                    </div>

                    {/* City */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold ml-1">
                            <MapPin className="w-4 h-4 text-primary" /> Ville *
                        </label>
                        <Input
                            value={address.city}
                            onChange={e => setAddress({ ...address, city: e.target.value })}
                            placeholder="Ville"
                            className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Phone */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold ml-1">
                                <Phone className="w-4 h-4 text-primary" /> Téléphone *
                            </label>
                            <Input
                                value={address.phone}
                                onChange={e => setAddress({ ...address, phone: e.target.value })}
                                placeholder="+212 6..."
                                className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold ml-1">
                                <Mail className="w-4 h-4 text-primary" /> E-mail *
                            </label>
                            <Input
                                value={address.email}
                                onChange={e => setAddress({ ...address, email: e.target.value })}
                                placeholder="votre@email.com"
                                className="h-14 rounded-2xl border-2 focus:ring-4 focus:ring-primary/10 transition-all text-base px-5"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-center">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-16 px-12 rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>ENREGISTREMENT...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span>ENREGISTRER MON PROFIL</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 text-muted-foreground bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <p className="text-sm font-medium">Vos informations sont sécurisées et ne seront utilisées que pour vos commandes Herbio.</p>
            </div>
        </div>
    );
};

export default Portfolio;
