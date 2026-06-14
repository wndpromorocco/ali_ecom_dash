import React from 'react';

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  eager?: boolean;
  /** Optional aspect ratio to reserve layout space and avoid CLS, e.g. '1 / 1' or '16 / 9' */
  aspectRatio?: string;
};

/**
 * LazyImage adds sensible defaults for lazy loading and responsive behavior.
 * - Uses native `loading="lazy"` and `decoding="async"` where appropriate
 * - Provides default `sizes` and `srcSet` if not supplied
 * - Optionally reserves space via `aspectRatio` to prevent layout shifts
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  eager,
  aspectRatio,
  sizes,
  srcSet,
  loading,
  decoding,
  style,
  src,
  alt,
  ...rest
}) => {
  const computedLoading: 'lazy' | 'eager' | undefined = eager ? 'eager' : (loading ?? 'lazy');
  const computedDecoding: 'sync' | 'async' | 'auto' | undefined = decoding ?? 'async';

  // Provide a conservative default sizes value; callers should override where layout is known.
  const computedSizes = sizes ?? '100vw';
  // Fallback srcSet uses the same source for 1x/2x for compatibility when multiple resolutions aren't available.
  const computedSrcSet = srcSet ?? (src ? `${src} 1x, ${src} 2x` : undefined);

  const styleWithAspect = aspectRatio ? { ...(style || {}), aspectRatio } : style;

  return (
    <img
      src={src}
      alt={alt}
      loading={computedLoading}
      decoding={computedDecoding}
      sizes={computedSizes}
      srcSet={computedSrcSet}
      style={styleWithAspect}
      {...rest}
    />
  );
};

export default LazyImage;