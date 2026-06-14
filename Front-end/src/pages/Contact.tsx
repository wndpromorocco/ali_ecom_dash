import { useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  :root {
    --brown:       #3D1A00;
    --brown-mid:   #5C2E00;
    --gold:        #D4A017;
    --gold-bright: #db6513;
    --gold-pale:   #FDF6DC;
    --cream:       #FAF8F3;
    --white:       #FFFFFF;
    --gray-100:    #F2EFE8;
    --gray-200:    #E4DED2;
    --gray-500:    #9A917E;
    --gray-700:    #4A4035;
    --shadow-gold: 0 8px 40px rgba(212,160,23,0.16);
    --shadow-soft: 0 4px 24px rgba(61,26,0,0.07);
  }

  .hc * { box-sizing: border-box; margin: 0; padding: 0; }
  .hc { font-family: 'DM Sans', sans-serif; background: var(--cream); min-height: 100vh; color: var(--gray-700); }

  /* BANNER */
  .hc-banner { position: relative; height: 200px; background: var(--brown); overflow: hidden; }
  .hc-banner-bg { position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=70') center/cover; opacity: .14; }
  .hc-banner-gold  { position: absolute; top: 0; right: 0; height: 100%; width: 46%; background: var(--gold-bright); opacity: .9;  clip-path: polygon(16% 0%,100% 0%,100% 100%,0% 100%); }
  .hc-banner-gold2 { position: absolute; top: 0; right: 0; height: 100%; width: 48%; background: var(--gold);        opacity: .35; clip-path: polygon(20% 0%,100% 0%,100% 100%,0% 100%); }
  .hc-banner-inner { position: relative; z-index: 10; max-width: 1160px; margin: 0 auto; padding: 0 32px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
  .hc-banner h1 { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; color: #fff; letter-spacing: .04em; line-height: 1; margin-bottom: 10px; }
  .hc-crumb { display: flex; align-items: center; gap: 8px; }
  .hc-crumb a { color: rgba(255,255,255,.5); font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; text-decoration: none; transition: color .2s; }
  .hc-crumb a:hover { color: #fff; }
  .hc-crumb .sep { color: rgba(255,255,255,.2); }
  .hc-crumb .cur { color: var(--gold-bright); font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }

  /* SHARED */
  .hc-wrap { max-width: 1160px; margin: 0 auto; padding: 0 32px; }

  /* INFO CARDS — 3 cols */
  .hc-cards-section { padding: 72px 32px 0; max-width: 1160px; margin: 0 auto; }
  .hc-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; }
  @media(max-width:760px){ .hc-cards-grid { grid-template-columns: 1fr; } }

  .hc-card {
    background: var(--white); border: 1px solid var(--gray-200);
    padding: 40px 24px 36px; display: flex; flex-direction: column; align-items: center; text-align: center;
    position: relative; overflow: hidden; transition: border-color .3s, box-shadow .3s, transform .3s; cursor: default;
  }
  .hc-card::after {
    content:''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: var(--gold-bright); transform: scaleX(0); transform-origin: left; transition: transform .35s;
  }
  .hc-card:hover { border-color: var(--gold-bright); box-shadow: var(--shadow-gold); transform: translateY(-5px); }
  .hc-card:hover::after { transform: scaleX(1); }
  .hc-card-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(92,46,0,.06); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: var(--brown-mid); transition: background .3s, color .3s; }
  .hc-card:hover .hc-card-icon { background: var(--brown-mid); color: #fff; }
  .hc-card-title { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--brown-mid); margin-bottom: 14px; }
  .hc-card-line { font-size: 13px; color: var(--gray-500); font-weight: 500; line-height: 2.1; }
  .hc-card-line a { color: var(--gray-500); text-decoration: none; transition: color .2s; }
  .hc-card-line a:hover { color: var(--brown-mid); }

  /* RULE */
  .hc-rule { max-width: 1160px; margin: 64px auto 0; padding: 0 32px; }
  .hc-rule hr { border: none; height: 1px; background: linear-gradient(to right, transparent, var(--gray-200) 20%, var(--gray-200) 80%, transparent); }

  /* SOCIAL */
  .hc-social-section { padding: 56px 32px 0; display: flex; flex-direction: column; align-items: center; }
  .hc-social-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: var(--brown-mid); margin-bottom: 28px; }
  .hc-social-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
  .hc-soc-btn { height: 50px; padding: 0 28px; border: none; border-radius: 2px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: transform .25s, box-shadow .25s; box-shadow: 0 2px 12px rgba(61,26,0,.06); text-decoration: none; }
  .hc-soc-btn:hover { transform: translateY(-3px); box-shadow: var(--shadow-gold); }
  .hc-soc-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
  .hc-soc-btn.ig { background: var(--gold-bright); color: var(--brown); }
  .hc-soc-btn.fb { background: var(--brown-mid); color: var(--gold-bright); }
  .hc-soc-btn.yt { background: var(--gold-bright); color: var(--brown); }
  .hc-soc-btn.tt { background: var(--brown); color: var(--gold-bright); }

  /* MAP */
  .hc-map-section { padding: 60px 32px 72px; max-width: 1160px; margin: 0 auto; }
  .hc-map-frame { position: relative; height: 440px; border: 1px solid var(--gray-200); overflow: hidden; box-shadow: var(--shadow-soft); }
  .hc-map-frame iframe { width: 100%; height: 100%; border: 0; display: block; }
  .hc-map-badge { position: absolute; bottom: 20px; left: 20px; z-index: 10; background: var(--white); border-left: 3px solid var(--gold-bright); padding: 14px 18px; box-shadow: 0 4px 20px rgba(61,26,0,.12); }
  .hc-map-badge strong { display: block; font-size: 13px; font-weight: 700; color: var(--brown); margin-bottom: 4px; }
  .hc-map-badge span { font-size: 12px; color: var(--gray-500); font-weight: 500; line-height: 1.7; }

  /* FAQ */
  .hc-faq-section { background: var(--white); padding: 72px 32px 80px; }
  .hc-faq-header { text-align: center; margin-bottom: 48px; }
  .hc-faq-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
  .hc-faq-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 900; color: var(--brown); margin-bottom: 14px; }
  .hc-faq-bar { width: 44px; height: 3px; background: var(--gold-bright); margin: 0 auto; }
  
  /* FIXED: Added width: 100% and increased max-width for desktop */
  .hc-faq-list { width: 100%; max-width: 950px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
  
  .hc-faq-item { border: 1px solid var(--gray-200); background: var(--cream); overflow: hidden; transition: border-color .25s, box-shadow .25s, background .25s; }
  .hc-faq-item.open { border-color: var(--gold-bright); background: var(--white); box-shadow: 0 4px 20px rgba(212,160,23,.1); }
  .hc-faq-btn { background: none; border: none; cursor: pointer; transition: background .2s; }
  .hc-faq-q { font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--gray-700); transition: color .2s; line-height: 1.4; }
  .hc-faq-item.open .hc-faq-q { color: var(--brown-mid); }
  .hc-faq-icon { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; background: var(--gray-100); color: var(--gold); display: flex; align-items: center; justify-content: center; transition: background .25s, transform .3s; font-size: 22px; font-weight: 300; line-height: 1; }
  .hc-faq-item.open .hc-faq-icon { background: var(--gold-bright); color: var(--brown); transform: rotate(45deg); }
  .hc-faq-body { padding: 0 24px; max-height: 0; overflow: hidden; transition: max-height .38s ease, padding .38s ease; }
  .hc-faq-item.open .hc-faq-body { max-height: 240px; padding-bottom: 20px; }
  .hc-faq-body p { font-size: 14px; color: var(--gray-500); line-height: 1.85; font-weight: 400; border-top: 1px solid var(--gray-200); padding-top: 16px; }
`;

function StyleInjector() {
    return <style dangerouslySetInnerHTML={{ __html: globalStyles }} />;
}

/* ICONS */
const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={26} height={26}>
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
const MailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={26} height={26}>
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={26} height={26}>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const IgIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);
const FbIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
const YtIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
);
const TtIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

/* ── BANNER ── */
function PageBanner() {
    return (
        <div className="hc-banner">
            <div className="hc-banner-bg" />
            <div className="hc-banner-gold2" />
            <div className="hc-banner-gold" />
            <div className="hc-banner-inner">
                <h1>Contact</h1>
                <nav className="hc-crumb" aria-label="Fil d'Ariane">
                    <Link to="/">Accueil</Link>
                    <span className="sep">›</span>
                    <span className="cur">Contact</span>
                </nav>
            </div>
        </div>
    );
}

/* ── INFO CARDS — now 3: phone, email, hours ── */
function InfoCards() {
    const cards = [
        {
            icon: <PhoneIcon />,
            title: "Contact Direct",
            lines: [
                <a key="tel" href="tel:+212665448023">Tél: 06 65 44 80 23</a>,
                <a key="wa" href="https://wa.me/212665448023" target="_blank" rel="noreferrer">WhatsApp: 06 65 44 80 23</a>,
            ],
        },
        {
            icon: <MailIcon />,
            title: "Contact E-mail",
            lines: [
                <a key="email" href="mailto:contact@hermado.com">contact@hermado.com</a>,
            ],
        },
        {
            icon: <ClockIcon />,
            title: "Heures d'Ouverture",
            lines: ["Lun – Dim : 09:30 – 19:30"],
        },
    ];

    return (
        <div className="hc-cards-section">
            <div className="hc-cards-grid">
                {cards.map(({ icon, title, lines }) => (
                    <div key={title} className="hc-card">
                        <div className="hc-card-icon">{icon}</div>
                        <div className="hc-card-title">{title}</div>
                        {lines.map((l, i) => <div key={i} className="hc-card-line">{l}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── SOCIAL ── */
function SocialLinks() {
    const socials = [
        { label: "Instagram", cls: "ig", Icon: IgIcon, href: "https://instagram.com/hermado.shoes" },
        { label: "Facebook", cls: "fb", Icon: FbIcon, href: "https://facebook.com/hermadoshoes" },
        { label: "YouTube", cls: "yt", Icon: YtIcon, href: "https://youtube.com/@hermadoshoes" },
        { label: "TikTok", cls: "tt", Icon: TtIcon, href: "https://tiktok.com/@hermado.shoes" },
    ];
    return (
        <>
            <div className="hc-rule"><div className="hc-wrap"><hr /></div></div>
            <div className="hc-social-section">
                <p className="hc-social-eyebrow">Rejoignez la communauté</p>
                <div className="hc-social-row">
                    {socials.map(({ label, cls, Icon, href }) => (
                        <a key={label} href={href} target="_blank" rel="noreferrer" className={`hc-soc-btn ${cls}`} aria-label={label}>
                            <Icon /><span>{label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}

/* ── MAP ── */
function MapSection() {
    return (
        <div className="hc-map-section">
            <div className="hc-map-frame">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.1383562397327!2d-7.5539429!3d33.5757568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd0007ada383%3A0x97ed9141fe00c69c!2sHermado%20shoes!5e0!3m2!1sen!2sma!4v1773750890888!5m2!1sen!2sma"
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Emplacement Hermado Store"
                />
                <div className="hc-map-badge">
                    <strong>Hermado Shoes — Casablanca</strong>
                    <span>Av. Saïd Abou Jemaa<br />Casablanca 20250, Maroc</span>
                </div>
            </div>
        </div>
    );
}

/* ── FAQ ── */
function FAQ() {
    const [open, setOpen] = useState(null);
    const faqs = [
        { q: "Quels sont les délais et les frais de livraison ?", a: "La livraison est 100% gratuite partout au Maroc ! Votre commande est expédiée rapidement et arrivera à votre porte dans un délai maximum de 24 à 48 heures." },
        { q: "Quels sont les modes de paiement acceptés ?", a: "Pour votre confort et votre sécurité, nous privilégions le paiement à la livraison (Cash on Delivery). Vous ne payez votre commande qu'une fois que vous l'avez reçue et vérifiée entre vos mains." },
        { q: "En quelle matière sont fabriquées vos chaussures ?", a: "Toutes les chaussures HERMADO sont confectionnées à partir de cuir véritable de première qualité. Nous allions le savoir-faire artisanal à un design moderne pour vous garantir élégance, robustesse et confort absolu." },
        { q: "Comment puis-je passer une commande ?", a: "C'est très simple ! Vous pouvez ajouter le modèle de votre choix au panier et remplir le formulaire, ou bien cliquer directement sur le bouton 'Commander sur WhatsApp' pour finaliser votre achat avec l'un de nos conseillers en un instant." },
        { q: "Comment être sûr de choisir la bonne pointure ?", a: "Nos modèles taillent de manière standard. Nous vous conseillons de choisir votre pointure habituelle. Si vous hésitez entre deux tailles, n'hésitez pas à nous contacter sur WhatsApp, notre équipe se fera un plaisir de vous conseiller !" },
    ];
    return (
        <div className="hc-faq-section">
            <div className="hc-wrap">
                <div className="hc-faq-header">
                    <p className="hc-faq-eyebrow">Questions</p>
                    <h2 className="hc-faq-title">Fréquentes</h2>
                    <div className="hc-faq-bar" />
                </div>
                {/* FIXED: Removed conflicting Tailwind width classes */}
                <div className="hc-faq-list">
                    {faqs.map((f, i) => (
                        <div key={i} className={`hc-faq-item${open === i ? " open" : ""}`}>
                            <button className="hc-faq-btn w-full flex justify-between items-center gap-3 p-4 md:p-6" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                                <span className="hc-faq-q flex-1 text-left text-sm md:text-base leading-relaxed">{f.q}</span>
                                <span className="hc-faq-icon shrink-0" aria-hidden="true">+</span>
                            </button>
                            <div className="hc-faq-body"><p>{f.a}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── PAGE ── */
export default function Contact() {
    return (
        <div className="hc">
            <StyleInjector />
            <PageBanner />
            <InfoCards />
            <SocialLinks />
            <MapSection />
            <FAQ />
        </div>
    );
}