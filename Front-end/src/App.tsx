import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ColorPaletteProvider } from "@/contexts/ColorPaletteContext";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import HeaderV2 from "@/components/HeaderV2";
import Footer from "@/components/Footer";
import Home from "./pages/Home";
import HomeV2 from "./pages/HomeV2";
import Boutique from "./pages/Boutique";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import Magasins from "./pages/Magasins";
import AdminLogin from "./pages/Admin/AdminLogin";
import ProductManagement from "./pages/Admin/ProductManagement";
import CategoryManagement from "./pages/Admin/CategoryManagement";
import DashboardSettings from "./pages/Admin/DashboardSettings";
import HomepageManager from "./pages/Admin/HomepageManager";
import ChangePassword from "./pages/Admin/ChangePassword";
import AdminLayout from "./components/AdminLayout";

import Catalogue from "./pages/Catalogue";
import Panier from "./pages/Panier";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Portfolio from "./pages/Portfolio";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();
const ADMIN = import.meta.env.VITE_ADMIN_SLUG;

const HeaderSwitcher = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith(`/${ADMIN}`)) return null;
  return <Header />;
};


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return <Navigate to={`/${ADMIN}/login`} replace />;
  }

  return <>{children}</>;
};

const FooterSwitcher = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith(`/${ADMIN}`)) return null;
  return <Footer />;
};

const App = () => {
  useEffect(() => {
    document.documentElement.lang = 'fr';
    document.documentElement.dir = 'ltr';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ColorPaletteProvider>
          <CurrencyProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <div className="flex flex-col min-h-screen">
                    <HeaderSwitcher />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/homev2" element={<HomeV2 />} />
                        <Route path="/boutique" element={<Boutique />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/boutique/:id" element={<ProductDetails />} />
                        <Route path="/magasins" element={<Magasins />} />
                        <Route path="/catalogue" element={<Catalogue />} />
                        <Route path="/panier" element={<Panier />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/compte" element={<Account />} />
                        <Route path="/compte/commandes" element={<Orders />} />
                        <Route path="/compte/portfolio" element={<Portfolio />} />
                        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />

                        {/* Admin Routes */}
                        <Route path={`/${ADMIN}/login`} element={<AdminLogin />} />
                        <Route
                          path={`/${ADMIN}`}
                          element={
                            <ProtectedRoute>
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Navigate to={`/${ADMIN}/dashboard`} replace />} />
                          <Route path="dashboard" element={<ProductManagement />} />
                          <Route path="categories" element={<CategoryManagement />} />
                          <Route path="products/new" element={<ProductManagement isAddingNewDefault={true} />} />
                          <Route path="homepage" element={<HomepageManager />} />
                          <Route path="settings" element={<DashboardSettings />} />
                          <Route path="change-password" element={<ChangePassword />} />
                        </Route>

                        {/* Admin Honey-pot / Redirections */}
                        <Route path="/admin/*" element={<Navigate to="/" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/backoffice" element={<Navigate to="/" replace />} />
                        <Route path="/wp-admin" element={<Navigate to="/" replace />} />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <FooterSwitcher />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </CurrencyProvider>
        </ColorPaletteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
