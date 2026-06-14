import React from 'react';
import { LazyImage } from '@/components/ui/LazyImage';

type Slide = {
  image: string;
  headline: string;
  headlineClassName?: string;
  tagline?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
};

interface HeroCarouselProps {
  slides: Slide[];
  autoAdvanceMs?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, autoAdvanceMs = 6000 }) => {
  const [index, setIndex] = React.useState(0);
  const count = slides.length;

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, autoAdvanceMs);
    return () => clearInterval(id);
  }, [count, autoAdvanceMs]);



  return (
    <div className="relative w-full h-full overflow-hidden rounded-none">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'} bg-black`}
        >
          {/* Background image */}
          <LazyImage
            src={slide.image}
            alt={slide.headline}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
            eager={i === index}
          />





          {/* Content area */}
          <div className="relative z-10 mx-auto w-full max-w-[1440px] h-full px-4 sm:px-6 lg:px-8 flex items-center">

          </div>
        </div>
      ))}


    </div>
  );
};

export default HeroCarousel;
