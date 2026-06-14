import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
    const ref = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Set visibility based on whether element is intersecting
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    return { ref, isVisible };
};
