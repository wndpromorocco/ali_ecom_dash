import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber: string;
}

const OrderSuccessModal = ({ isOpen, onClose, orderNumber }: OrderSuccessModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 text-center animate-in zoom-in-95 duration-500 relative">
                    {/* Decorative pulse background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full animate-ping duration-[3s] -z-10"></div>

                    <div className="flex justify-center mb-8">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-bounce duration-1000">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Commande Réussie !</h2>
                    <div className="text-muted-foreground mb-8 text-lg">
                        Votre commande <span className="font-bold text-primary block mt-2 text-2xl">#{orderNumber}</span> a été enregistrée avec succès. Vous recevrez un e-mail de confirmation sous peu.
                    </div>

                    <div className="space-y-4">
                        <Link to="/compte/commandes" className="block w-full">
                            <Button
                                onClick={onClose}
                                className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Suivre ma commande
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>

                        <Link to="/boutique" className="block w-full">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="w-full h-16 rounded-2xl font-bold text-lg border-2 hover:bg-muted/50 flex items-center justify-center gap-3"
                            >
                                <Home className="w-5 h-5" />
                                Continuer mes achats
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-8 text-xs text-muted-foreground uppercase font-bold tracking-widest">
                        Un e-mail de confirmation a été envoyé.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OrderSuccessModal;
