-- Table 1: Hero section images
CREATE TABLE IF NOT EXISTS hero_slides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   TEXT NOT NULL,
  title       VARCHAR(255),
  subtitle    VARCHAR(255),
  "order"     INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Table 2: Exclusive offer / promo section
CREATE TABLE IF NOT EXISTS homepage_promo (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active       BOOLEAN DEFAULT true,
  promo_end_date  TIMESTAMP NOT NULL,
  section_title   VARCHAR(255) DEFAULT 'Offre Exclusive Finit Bientôt !',
  section_subtitle TEXT DEFAULT 'Notre plus grande démarque saisonnière à ce jour.',
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  updated_at      TIMESTAMP DEFAULT NOW()
);
