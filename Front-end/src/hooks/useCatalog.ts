import { useState, useEffect } from 'react';
import type { Product } from '@/contexts/CartContext';
import { API_BASE, DOMAIN_BASE } from '@/config';

// Import fallback images
import tilleulImg from '@/assets/tilleul-1-1024x1024.jpg';
import roselleSecheeImg from '@/assets/roselle_sechee-1-1024x1024 (1).jpg';
import fleursOrangerImg from '@/assets/fleurs_d-oranger-1-1024x1024.jpg';
import feuillesLaurierImg from '@/assets/feuilles_de_laurier-1-1024x1024.jpg';
import feuillesDOlivierImg from '@/assets/feuilles_d-olivier-1-1024x1024.jpg';
import feuillesMoringaImg from '@/assets/feuilles_de_moringa-1-1024x1024.jpg';
import poudreMoringaImg from '@/assets/poudre_de_moringa-1-1024x1024.jpg';
import coriandreImg from '@/assets/coriandre-1-1024x1024.jpg';
import thymSecheImg from '@/assets/thym_seche-1-1024x1024.jpg';
import marjolaineSecheeImg from '@/assets/marjolaine_sechee-1-1024x1024.jpg';
import verveineSecheeImg from '@/assets/verveine_sechee-1-1024x1024.jpg';
import romarinSecheImg from '@/assets/romarin_seche-1-1024x1024.jpg';
import origanSecheImg from '@/assets/origan_seche-1-1024x1024.jpg';
import theAuSafranImg from '@/assets/the_au_safran-1-1024x1024.jpg';
import theMatchaImg from '@/assets/the_matcha-1-1024x1024.jpg';
import theALaMentheImg from '@/assets/the_a_la_menthe-1-1024x1024.jpg';
import melangePourTheMarocainImg from '@/assets/melange_pour_the_marocain-1-1024x1024.jpg';
import mentheSecheeImg from '@/assets/menthe_sechee-1-1024x1024.jpg';
import menthePouliotImg from '@/assets/menthe_pouliot-1-1024x1024.jpg';
import lavandeSecheeImg from '@/assets/lavande_sechee-1-1024x1024.jpg';
import theALaFleurDOrangerImg from '@/assets/the_a_la_fleur_d-oranger-1-1024x1024.jpg';
import theAuxHerbesImg from '@/assets/the_aux_herbes-1-1024x1024.jpg';
import theCitronGingembreImg from '@/assets/the_citron_gingembre-1-1024x1024.jpg';
import theALaGommeArabiqueImg from '@/assets/the_a_la_gomme_arabique-1-1024x1024.jpg';
import melangeAntiBallonnementImg from '@/assets/melange_anti_ballonnement-1-1024x1024.jpg';

const FALLBACK_IMAGES = [
    tilleulImg, roselleSecheeImg, fleursOrangerImg, feuillesLaurierImg, feuillesDOlivierImg,
    feuillesMoringaImg, poudreMoringaImg, coriandreImg, thymSecheImg, marjolaineSecheeImg,
    verveineSecheeImg, romarinSecheImg, origanSecheImg, theAuSafranImg, theMatchaImg,
    theALaMentheImg, melangePourTheMarocainImg, mentheSecheeImg, menthePouliotImg,
    lavandeSecheeImg, theALaFleurDOrangerImg, theAuxHerbesImg, theCitronGingembreImg,
    theALaGommeArabiqueImg, melangeAntiBallonnementImg,
];

export const useCatalog = (options: { showInactive?: boolean } = {}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCatalog = async () => {
        try {
            setIsLoading(true);
            const lng = 'fr';
            const showInactiveParam = options.showInactive ? '&showInactive=true' : '';

            // Fetch products and categories in parallel from local APIs
            const [productsRes, categoriesRes] = await Promise.all([
                fetch(`${API_BASE}/products?limit=100&lng=${lng}${showInactiveParam}`),
                fetch(`${API_BASE}/categories?lng=${lng}`)
            ]);

            if (!productsRes.ok || !categoriesRes.ok) {
                throw new Error('Failed to fetch catalog data from local API');
            }

            const productsJson = await productsRes.json();
            const categoriesJson = await categoriesRes.json();

            if (productsJson.success && categoriesJson.success) {
                const localProducts: Product[] = productsJson.data.map((p: any, index: number) => {
                    let primaryImage = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                    if (p.images && p.images.length > 0) {
                        const imgStr = p.images[0];
                        const imgUrl = typeof imgStr === 'object' && (imgStr as any).url ? (imgStr as any).url : imgStr;
                        if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '') {
                            primaryImage = imgUrl; // Raw path
                        }
                    }

                    // Also format the entire images array for the gallery
                    const formattedImages = (p.images || []).map((img: any) => {
                        const url = typeof img === 'object' && img.url ? img.url : img;
                        return url || '';
                    }).filter(url => url !== '');

                    return {
                        id: p.id,
                        name: p.name,
                        nameAr: p.nameAr,
                        price: p.price,
                        image: primaryImage, // Maintain compatibility for grid
                        images: formattedImages, // Full array for gallery
                        category: p.category?.name || 'Uncategorized',
                        categoryId: p.categoryId,
                        modelId: p.modelId,
                        typeId: p.typeId,
                        description: p.description || '',
                        descriptionAr: p.descriptionAr,
                        sku: p.sku,
                        color: p.color,
                        colors: p.colors || [],
                        type: p.type,
                        size: p.size,
                        discountPrice: p.discountPrice,
                        isActive: p.isActive,
                        quantity: p.quantity
                    };
                });

                setProducts(localProducts);
                setCategories(categoriesJson.data);
            } else {
                setError('Failed to load local catalog');
            }
        } catch (err) {
            console.error('Local catalog fetch error:', err);
            setError('Connection to local catalog failed');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCatalog();
    }, [options.showInactive]);

    return { products, categories, isLoading, error, refetch: fetchCatalog };
};
