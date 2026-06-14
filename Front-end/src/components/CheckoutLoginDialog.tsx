import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import Recaptcha from '@/components/Recaptcha';
import { User, LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface CheckoutLoginDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    onSkip: () => void;
}

const CheckoutLoginDialog = ({ isOpen, onOpenChange, onSuccess, onSkip }: CheckoutLoginDialogProps) => {
    const [activeTab, setActiveTab] = useState('login');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const success = await login({ email, password });
        setIsLoading(false);
        if (success) {
            onSuccess();
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!termsAccepted) return;
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            phone: formData.get('phone') as string,
            captchaToken
        };

        const success = await register(data);
        setIsLoading(false);
        if (success) {
            onSuccess();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary p-6 text-primary-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6" />
                            Espace Client
                        </DialogTitle>
                        <DialogDescription className="text-primary-foreground/80 text-base">
                            Connectez-vous ou créez un compte pour une expérience personnalisée.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="login" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <LogIn className="w-4 h-4 mr-2" />
                                Connexion
                            </TabsTrigger>
                            <TabsTrigger value="register" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Inscription
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">E-mail *</label>
                                    <Input name="email" type="email" placeholder="votre@email.com" required className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Mot de passe *</label>
                                    <Input name="password" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary-dark transition-all shadow-md active:scale-[0.98]">
                                    {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Nom *</label>
                                        <Input name="lastName" placeholder="Nom" required className="h-11 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold ml-1">Prénom *</label>
                                        <Input name="firstName" placeholder="Prénom" required className="h-11 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">E-mail *</label>
                                    <Input name="email" type="email" placeholder="votre@email.com" required className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Téléphone</label>
                                    <Input name="phone" placeholder="06XXXXXXXX" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Mot de passe *</label>
                                    <Input name="password" type="password" placeholder="••••••••" required className="h-11 rounded-xl" />
                                </div>

                                <div className="p-3 bg-muted/30 rounded-xl space-y-4 border border-border/50">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="dialog-terms"
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                        />
                                        <label htmlFor="dialog-terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                                            J'accepte les conditions générales et la politique de confidentialité.
                                        </label>
                                    </div>
                                    <Recaptcha onVerify={setCaptchaToken} />
                                </div>

                                <Button type="submit" disabled={isLoading || !termsAccepted} className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary-dark transition-all shadow-md active:scale-[0.98]">
                                    {isLoading ? 'Création en cours...' : 'Créer un compte'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-muted-foreground font-medium">Ou continuer en tant qu'invité</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={onSkip}
                        className="w-full h-12 rounded-xl text-base font-semibold border-2 hover:bg-muted/50 transition-all group"
                    >
                        Commander sans compte
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CheckoutLoginDialog;
