import { useEffect } from 'react';

/**
 * Lazily applies a background image to the given element once it enters the viewport.
 * Helps avoid unnecessary network requests and layout shifts for background images.
 */
export function useLazyBackgroundImage(
  elementRef: React.RefObject<HTMLElement>,
  imageUrl: string,
  options: IntersectionObserverInit = { rootMargin: '200px' }
) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;

    const applyBackground = () => {
      // Only set once
      if (el.style.backgroundImage && el.style.backgroundImage.includes(imageUrl)) return;
      el.style.backgroundImage = `url(${imageUrl})`;
      // Optional: ensure cover/center if not set by classes
      el.style.backgroundSize = el.style.backgroundSize || 'cover';
      el.style.backgroundPosition = el.style.backgroundPosition || 'center';
    };

    // If the element is already visible, apply immediately
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      applyBackground();
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          applyBackground();
          if (observer) observer.disconnect();
        }
      });
    }, options);

    observer.observe(el);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [elementRef, imageUrl, options]);
}