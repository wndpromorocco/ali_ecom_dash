import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE, DOMAIN_BASE } from '@/config';
import { ShoppingBag, ChevronRight, Package, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OrderItem = {
    id: string;
    orderNumber?: string;
    status?: string;
    createdAt: string;
    totalAmount?: number;
    subtotal?: number;
    shippingAmount?: number;
    items?: Array<{ id: string; quantity?: number; price?: number; product?: { name?: string; images?: string[] } }>
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const toggleOrderDetails = (id: string) => {
        setExpandedOrderId((prev) => (prev === id ? null : id));
    };

    const fetchOrders = useMemo(() => {
        return async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (res.ok && Array.isArray(json?.data)) {
                    setOrders(json.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
                <p className="text-muted-foreground mb-6">Veuillez vous connecter pour voir vos commandes.</p>
                <Link to="/compte">
                    <Button>Mon Compte</Button>
                </Link>
            </div>
        );
    }

    const getStatusLabel = (status: string | undefined) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': return 'LIVRÉ';
            case 'PENDING': return 'EN ATTENTE';
            default: return status || 'EN ATTENTE';
        }
    };

    return (
        <div className="account-page max-w-5xl mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="acc-breadcrumb mb-8">
                <Link to="/" className="acc-crumb">Accueil</Link>
                <span className="acc-sep" aria-hidden>/</span>
                <Link to="/compte" className="acc-crumb">Mon Compte</Link>
                <span className="acc-sep" aria-hidden>/</span>
                <span className="acc-crumb acc-current">Mes Commandes</span>
            </nav>

            <header className="mb-12">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase">Historique des Commandes</h1>
                <p className="text-lg text-muted-foreground">Suivez et gérez vos commandes passées.</p>
            </header>

            {loading ? (
                <div className="flex flex-col items-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium">Chargement de vos commandes...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-muted/30 rounded-3xl p-12 text-center border-2 border-dashed">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                    <h2 className="text-xl font-bold mb-2">Aucune commande trouvée</h2>
                    <p className="text-muted-foreground mb-8 text-balance">Vous n'avez pas encore passé de commande chez Fadel trading.</p>
                    <Link to="/boutique">
                        <Button size="lg" className="rounded-full px-8">Découvrir la boutique</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        return (
                            <div
                                key={order.id}
                                className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-primary">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg">Commande #{order.orderNumber || order.id.slice(0, 8)}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> <span className="font-semibold px-1">Montant total:</span> {Number(order.totalAmount || 0)} MAD</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            className="rounded-full group-hover:bg-primary group-hover:text-white transition-all px-6"
                                            onClick={() => toggleOrderDetails(order.id)}
                                        >
                                            {expandedOrderId === order.id ? 'Fermer' : 'Voir les détails'} <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Details Section */}
                                {expandedOrderId === order.id && (
                                    <div className="border-t p-6 md:p-8 bg-muted/10">
                                        <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Articles de la commande</h4>
                                        <div className="space-y-3">
                                            {(order.items || []).map((item) => (
                                                <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-background p-4 rounded-xl border gap-4 shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-lg bg-muted flex flex-shrink-0 items-center justify-center text-primary font-bold">
                                                            {item.product?.name?.charAt(0) || <Package className="w-5 h-5" />}
                                                        </div>
                                                        <span className="font-medium">{item.product?.name || 'Produit inconnu'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-6 text-sm w-full sm:w-auto">
                                                        <span className="text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Quantité: {item.quantity || 1}</span>
                                                        <span className="font-bold">{Number(item.price || 0)} MAD</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
