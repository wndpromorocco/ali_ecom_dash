import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { API_BASE, DOMAIN_BASE } from '@/config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRequestValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleResetValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'code') setCode(e.target.value);
        if (e.target.name === 'newPassword') setNewPassword(e.target.value);
    };

    const onRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const json = await res.json();
            if (res.ok) {
                setStep('reset');
                setMessage('Un code de réinitialisation a été envoyé à votre adresse e-mail.');
            } else {
                setError(json.message || 'Une erreur est survenue.');
            }
        } catch (err) {
            setError('Erreur réseau.');
        } finally {
            setLoading(false);
        }
    };

    const onResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const json = await res.json();
            if (res.ok) {
                setMessage('Mot de passe réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.');
                setTimeout(() => navigate('/compte'), 3000);
            } else {
                setError(json.message || 'Code invalide ou expiré.');
            }
        } catch (err) {
            setError('Erreur réseau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="account-page">
            <div className="acc-header">
                <h1 className="acc-title">Mot de passe oublié ?</h1>
                <p className="acc-desc">
                    {step === 'request'
                        ? 'Entrez votre adresse e-mail pour recevoir un code de réinitialisation.'
                        : 'Entrez le code reçu par e-mail et votre nouveau mot de passe.'}
                </p>
            </div>

            <div className="acc-form">
                {message && <div className="text-green-600 font-medium text-center">{message}</div>}
                {error && <div className="text-red-600 font-medium text-center">{error}</div>}

                {step === 'request' ? (
                    <form onSubmit={onRequestSubmit} className="w-full max-w-md flex flex-col gap-4">
                        <div className="acc-field">
                            <label htmlFor="email" className="acc-label text-center">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="acc-input"
                                value={email}
                                onChange={handleRequestValueChange}
                            />
                        </div>
                        <Button type="submit" className="acc-submit" disabled={loading}>
                            {loading ? 'Envoi...' : 'Envoyer le code'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={onResetSubmit} className="w-full max-w-md flex flex-col gap-4">
                        <div className="acc-field">
                            <label htmlFor="code" className="acc-label text-center">Code de vérification</label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                className="acc-input"
                                value={code}
                                onChange={handleResetValueChange}
                                placeholder="Ex: 123456"
                            />
                        </div>
                        <div className="acc-field">
                            <label htmlFor="newPassword" className="acc-label text-center">Nouveau mot de passe</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                className="acc-input"
                                value={newPassword}
                                onChange={handleResetValueChange}
                            />
                        </div>
                        <Button type="submit" className="acc-submit" disabled={loading}>
                            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
