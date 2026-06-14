import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Search, ShoppingCart, CheckCircle2 } from 'lucide-react';
import type { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';

type ChatRole = 'assistant' | 'user';

type ChatMessage =
  | { id: string; role: ChatRole; text: string }
  | { id: string; role: ChatRole; text: string; items?: Product[]; product?: Product; kind?: 'results' | 'order' | 'product_info' };

const QUICK_REPLIES = [
  { label: 'View products', query: 'products' },
  { label: 'Honey', query: 'miel' },
  { label: 'Tea', query: 'thé' },
  { label: 'Oil', query: 'huile' },
  { label: 'Spices', query: 'epices' },
  { label: 'Amlou', query: 'amlou' },
  { label: 'Olive oil', query: "huile d'olive" },
  { label: 'Info: Honey', query: 'info miel' },
  { label: 'Info: Tea', query: 'info thé' },
  { label: 'Info: Olive oil', query: "info huile d'olive" },
  { label: 'Track order', query: 'track order' },
];

function normalize(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function matchProducts(all: Product[], q: string): Product[] {
  const query = normalize(q).trim();
  if (!query) return [];
  const synonyms: Record<string, string[]> = {
    miel: ['miels & ruches', 'honey'],
    the: ['herbes & tisanes', 'tea'],
    huile: ['huiles & olives', 'oil'],
    epices: ['epices & marinades', 'spices'],
    couscous: ['couscous & grains'],
  };
  const tokens = query.split(/\s+/);
  const isCategory = Object.keys(synonyms).find((k) => query.includes(k));
  const categories = new Set<string>([
    ...(synonyms[isCategory ?? ''] ?? []),
    query,
  ]);
  const scored = all
    .map((p) => {
      const name = normalize(p.name);
      const cat = normalize(p.category);
      let score = 0;
      if (categories.has(cat)) score += 3;
      tokens.forEach((t) => {
        if (t && name.includes(t)) score += 2;
        if (t && cat.includes(t)) score += 1;
      });
      return { p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.p);
  return scored;
}

function findBestProduct(all: Product[], q: string): Product | undefined {
  const normQ = normalize(q).trim();
  if (!normQ) return undefined;
  const top = matchProducts(all, normQ);
  if (top.length) return top[0];
  const exact = all.find((p) => normalize(p.name) === normQ);
  if (exact) return exact;
  return all.find((p) => normQ.includes(normalize(p.name)) || normalize(p.name).includes(normQ));
}

function makeId(): string {
  const g = globalThis as {
    crypto?: Crypto & {
      randomUUID?: () => string;
      getRandomValues?: (array: Uint8Array) => void;
    };
  };
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    g.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'));
    return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex.slice(10).join('')}`;
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const HerbioChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    text: 'Hi! I\'m your shopping assistant. Ask me for products, deals, or checkout.',
  }]);
  const { addToCart, cart, totalItems, totalPrice } = useCart();
  const { formatPrice } = useCurrency();
  const nav = useNavigate();

  // Use centralized catalog hook
  const { products: apiProducts, isLoading } = useCatalog();
  const products = apiProducts;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text: string) => {
    const id = makeId();
    setMessages((m) => [...m, { id, role: 'user', text }]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 400));
    const q = normalize(text);
    if (q.includes('checkout') || q.includes('valider') || q.includes('panier')) {
      const summaryId = makeId();
      setMessages((m) => [
        ...m,
        {
          id: summaryId,
          role: 'assistant',
          text: `You have ${totalItems} item(s). Total: ${formatPrice(totalPrice)}.`,
          kind: 'order',
        },
      ]);
      setTyping(false);
      return;
    }
    if (q.includes('info') || q.includes('information') || q.includes('infos') || q.includes('detail') || q.includes('details') || q.includes('about')) {
      const p = findBestProduct(products, text);
      const idInfo = makeId();
      setMessages((m) => [
        ...m,
        p
          ? { id: idInfo, role: 'assistant', text: 'Product info', product: p, kind: 'product_info' }
          : { id: idInfo, role: 'assistant', text: 'No product matched your info request. Try specifying the product name.' },
      ]);
      setTyping(false);
      return;
    }
    if (q.includes('track')) {
      const trackId = makeId();
      setMessages((m) => [
        ...m,
        { id: trackId, role: 'assistant', text: 'Enter your order number (e.g., HB-2025-0001). Tracking UI coming soon.' },
      ]);
      setTyping(false);
      return;
    }
    if (q.includes('products')) {
      const idRes = makeId();
      setMessages((m) => [
        ...m,
        { id: idRes, role: 'assistant', text: 'Top picks for you', items: products.slice(0, 6), kind: 'results' },
      ]);
      setTyping(false);
      return;
    }
    const results = matchProducts(products, q);
    const idRes = makeId();
    setMessages((m) => [
      ...m,
      results.length
        ? { id: idRes, role: 'assistant', text: `Found ${results.length} result(s)`, items: results, kind: 'results' }
        : { id: idRes, role: 'assistant', text: 'No products matched your query. Try another keyword or tap a quick reply.' },
    ]);
    setTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input.trim());
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          className="h-20 w-20 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-7 h-7 animate-pulse" aria-hidden="true">
              <path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
            <span className="mt-1 px-2 text-[10px] font-semibold text-center leading-tight">Commandez facilement</span>
          </div>
        </button>
      )}

      {open && (
        <div className="w-[92vw] max-w-[420px] sm:w-[380px] sm:max-w-[380px] bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden">
          <div className="bg-[#7A9B3E] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">Herbio Assistant</div>
                <div className="text-xs text-white/80">Online • WhatsApp-style</div>
              </div>
            </div>
            <button
              className="rounded-full p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 bg-neutral-50">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr.query}
                  className="px-3 py-1.5 rounded-full text-xs bg-white border border-neutral-200 hover:border-neutral-300 shadow-sm"
                  onClick={() => send(qr.query)}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[56vh] sm:max-h-[380px] overflow-y-auto px-3 py-2 space-y-3" role="log" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'assistant' ? 'flex gap-2' : 'flex gap-2 justify-end'}>
                {m.role === 'assistant' && (
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#7A9B3E]" aria-hidden />
                )}
                <div className={`rounded-2xl px-3 py-2 text-sm ${m.role === 'assistant' ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-200 text-neutral-900'}`}>
                  <div>{m.text}</div>
                  {'items' in m && m.items && m.kind === 'results' && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {m.items.map((p) => (
                        <div key={p.id} className="rounded-lg border bg-white overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-20 object-cover" />
                          <div className="p-2">
                            <div className="text-xs font-medium line-clamp-2">{p.name}</div>
                            <div className="text-xs text-neutral-600">{formatPrice(p.price)}</div>
                            <button
                              className="mt-2 w-full inline-flex items-center justify-center gap-1 text-xs bg-[#7A9B3E] text-white rounded-md px-2 py-1.5 hover:bg-[#6a8a35]"
                              onClick={() => addToCart(p)}
                              aria-label={`Add ${p.name} to cart`}
                            >
                              <ShoppingCart className="h-3 w-3" /> Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {'kind' in m && m.kind === 'product_info' && m.product && (
                    <div className="mt-2">
                      <div className="flex gap-2">
                        <img src={m.product.image} alt={m.product.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{m.product.name}</div>
                          <div className="text-xs text-neutral-600">{m.product.category}</div>
                          {m.product.description && (
                            <div className="mt-1 text-xs text-neutral-700">{m.product.description}</div>
                          )}
                          <div className="mt-2 text-sm font-bold">{formatPrice(m.product.price)}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 text-xs bg-[#7A9B3E] text-white rounded-md px-3 py-1.5"
                          onClick={() => addToCart(m.product!)}
                          aria-label={`Add ${m.product.name} to cart`}
                        >
                          <ShoppingCart className="h-3 w-3" /> Add to Cart
                        </button>
                        <button
                          className="inline-flex items-center gap-1 text-xs bg-black text-white rounded-md px-3 py-1.5"
                          onClick={() => send(m.product!.category)}
                        >
                          Similar Products
                        </button>
                      </div>
                    </div>
                  )}
                  {'kind' in m && m.kind === 'order' && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs text-neutral-700">Recent items:</div>
                      <div className="space-y-1">
                        {cart.slice(-3).map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-xs">
                            <span className="line-clamp-1">{c.name} × {c.quantity}</span>
                            <span className="text-neutral-600">{formatPrice(c.price * c.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 text-xs bg-black text-white rounded-md px-3 py-1.5"
                          onClick={() => nav('/panier')}
                        >
                          View Cart
                        </button>
                        <button
                          className="inline-flex items-center gap-1 text-xs bg-[#25D366] text-white rounded-md px-3 py-1.5"
                          onClick={() => nav('/checkout')}
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-neutral-500 text-xs px-2">
                <CheckCircle2 className="h-3 w-3" /> Assistant is typing…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-full border bg-neutral-50 px-3 py-2 focus-within:ring-2 focus-within:ring-[#25D366]/40">
                <Search className="h-4 w-4 text-neutral-500" />
                <input
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="Search products or ask a question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message input"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#7A9B3E] text-white text-sm hover:bg-[#6a8a35]"
                aria-label="Send"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HerbioChatWidget;
