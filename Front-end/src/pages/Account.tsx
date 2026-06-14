import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  Briefcase,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { API_BASE, DOMAIN_BASE } from '@/config';

const Account = () => {
  const { user, login, register, logout, loading: profileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const [changePwLoading, setChangePwLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleLoginSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
    if (!email || !password) return;

    const success = await login({ email, password });
    if (success) {
      navigate('/compte', { replace: true });
    }
  };

  const handleRegisterSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement)?.value;
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement)?.value;
    if (!email || !password || !firstName || !lastName) return;

    const success = await register({ email, password, firstName, lastName });
    if (success) {
      navigate('/compte', { replace: true });
    }
  };

  const [resetStep, setResetStep] = useState<'initial' | 'sending' | 'code-sent'>('initial');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleRequestReset = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setResetStep('sending');
    setErrorMsg(null);
    setResetMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/request-secure-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setResetStep('code-sent');
        setResetMessage("Le code de vérification a été envoyé.");
      } else {
        const json = await res.json();
        setErrorMsg(json.message || "Une erreur est survenue.");
        setResetStep('initial');
      }
    } catch (e) {
      setErrorMsg("Erreur réseau. Veuillez réessayer.");
      setResetStep('initial');
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setChangePwLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-and-update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: resetCode, newPassword })
      });
      const json = await res.json();
      if (res.ok) {
        alert("Mot de passe mis à jour avec succès.");
        setShowSettings(false);
        setResetStep('initial');
        setResetCode('');
        setNewPassword('');
      } else {
        setErrorMsg(json.message || "Une erreur est survenue.");
      }
    } catch (e) {
      setErrorMsg("Erreur réseau. Veuillez réessayer.");
    } finally {
      setChangePwLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="account-page max-w-6xl mx-auto px-4 py-8 md:py-16">
      {/* Breadcrumb */}
      <nav className="acc-breadcrumb mb-8">
        <Link to="/" className="acc-crumb">Accueil</Link>
        <span className="acc-sep" aria-hidden>/</span>
        <span className="acc-crumb acc-current">Mon Compte</span>
      </nav>

      {user ? (
        <div className="acc-dashboard-v3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 uppercase">Bienvenue, {user.firstName || 'CLIENT'}</h1>
              <p className="text-lg text-muted-foreground">Gérez vos informations, vos commandes et vos paramètres de sécurité.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Action Cards */}
            <Link to="/compte/commandes" className="group bg-card border rounded-3xl p-8 hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:scale-125 transition-transform origin-top-right"></div>
              <div className="bg-primary/10 text-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2">Mes Commandes</h2>
              <p className="text-muted-foreground text-sm mb-4">Consultez l'historique de vos achats et suivez vos colis.</p>
              <div className="flex items-center text-primary font-bold text-sm">
                Gérer <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link to="/compte/portfolio" className="group bg-card border rounded-3xl p-8 hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full group-hover:scale-125 transition-transform origin-top-right"></div>
              <div className="bg-teal-500/10 text-teal-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2">Mon Profil</h2>
              <p className="text-muted-foreground text-sm mb-4">Modifiez vos informations personnelles et vos adresses.</p>
              <div className="flex items-center text-teal-600 font-bold text-sm">
                Gérer <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`group text-left bg-card border rounded-3xl p-8 transition-all relative overflow-hidden ${showSettings ? 'border-primary ring-2 ring-primary/20 shadow-xl' : 'hover:border-primary hover:shadow-xl hover:shadow-primary/5'}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full group-hover:scale-125 transition-transform origin-top-right"></div>
              <div className="bg-[#2563EB]/10 text-[#1D4ED8] w-14 h-14 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2">Paramètres</h2>
              <p className="text-muted-foreground text-sm mb-4">Gérez vos préférences de compte et votre sécurité.</p>
              <div className="flex items-center text-[#1D4ED8] font-bold text-sm">
                Modifier <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showSettings ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </div>
            </button>
          </div>

          {showSettings && (
            <div className="bg-muted/30 border rounded-[2rem] p-8 md:p-12 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Sécurité</h2>
              </div>

              {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{errorMsg}</div>}
              {resetMessage && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100">{resetMessage}</div>}

              <div className="max-w-2xl">
                {resetStep === 'initial' || resetStep === 'sending' ? (
                  <div className="p-6 bg-white rounded-3xl border shadow-sm flex flex-col items-center text-center">
                    <h3 className="text-lg font-bold mb-2">Mise à jour sécurisée</h3>
                    <p className="text-sm text-muted-foreground mb-6">Un code de vérification sera envoyé à {user.email}.</p>
                    <Button
                      onClick={handleRequestReset}
                      disabled={resetStep === 'sending'}
                      className="rounded-full px-8 py-6 h-auto text-base font-bold"
                    >
                      {resetStep === 'sending' ? "Envoi du code..." : "Changer le mot de passe"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyAndReset} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Code de vérification</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none text-center text-2xl tracking-[0.5em] font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1">Nouveau mot de passe</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" disabled={changePwLoading || resetCode.length < 6} className="rounded-full px-10 py-6 h-auto text-base font-bold shadow-lg shadow-primary/20">
                        {changePwLoading ? "Chargement..." : "Mettre à jour le mot de passe"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setResetStep('initial')}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="acc-auth-container max-w-4xl mx-auto">
          {/* Header */}
          <section className="text-center mb-12">
            <h1 className="text-2xl md:text-4xl font-black mb-4 uppercase tracking-tight">
              {activeTab === 'existing' ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              {activeTab === 'existing'
                ? "Accédez à votre compte pour gérer vos commandes."
                : "Rejoignez Fadel trading pour une expérience d'achat personnalisée."
              }
            </p>
          </section>

          {/* Nav Tabs */}
          <div className="flex p-1 bg-muted/50 rounded-2xl mb-12 max-w-md mx-auto">
            <button
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all ${activeTab === 'existing' ? 'bg-white shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('existing')}
            >
              Déjà inscrit ?
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all ${activeTab === 'new' ? 'bg-white shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => { setActiveTab('new'); setTermsAccepted(false); }}
            >
              Nouveau client ?
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            {activeTab === 'existing' ? (
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">E-mail<span className="text-red-500">*</span></label>
                  <input name="email" type="email" placeholder="votre@email.com" className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Mot de passe<span className="text-red-500">*</span></label>
                  <input name="password" type="password" placeholder="••••••••" className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
                </div>
                <Button type="submit" className="w-full py-7 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">Gérer</Button>
                <div className="text-center mt-6">
                  <Link to="/mot-de-passe-oublie" className="text-primary font-bold hover:underline">Mot de passe oublié ?</Link>
                </div>
              </form>
            ) : (
              <form className="space-y-8" onSubmit={handleRegisterSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Nom<span className="text-red-500">*</span></label>
                    <input name="lastName" type="text" placeholder="Nom" className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Prénom<span className="text-red-500">*</span></label>
                    <input name="firstName" type="text" placeholder="Prénom" className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">E-mail<span className="text-red-500">*</span></label>
                    <input name="email" type="email" placeholder="votre@email.com" className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Mot de passe<span className="text-red-500">*</span></label>
                    <input name="password" type="password" placeholder="••••••••" className="w-full px-5 py-4 rounded-2xl border focus:ring-2 focus:ring-primary/20 transition-all outline-none" required />
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" name="terms" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.currentTarget.checked)} className="mt-1 w-5 h-5 accent-primary" />
                    <span className="text-sm text-muted-foreground font-medium leading-relaxed">J'accepte les conditions générales et la politique de confidentialité.</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={!termsAccepted}
                  className="w-full py-7 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20"
                >
                  Créer un compte
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
