import { memo, useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fallback?: string;
}

const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  fallback = '',
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return fallback ? (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-2xl">{fallback}</span>
      </div>
    ) : (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <svg className="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden bg-muted`} style={width ? { width, height } : undefined}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
});

export default OptimizedImage;