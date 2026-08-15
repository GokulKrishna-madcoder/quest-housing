import React, { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClass?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

function optimizeUrl(src: string, width?: number): string {
  if (!src) return src;
  // Supabase storage: append render transforms
  if (src.includes('supabase.co/storage/')) {
    const sep = src.includes('?') ? '&' : '?';
    return `${src}${sep}width=${width || 800}&quality=75`;
  }
  // Unsplash: enforce reasonable width
  if (src.includes('unsplash.com') && width) {
    return src.replace(/w=\d+/, `w=${width}`);
  }
  return src;
}

export default function ResponsiveImage({ src, alt, className = '', placeholderClass = '', style, width, height }: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`bg-navy/5 flex items-center justify-center ${placeholderClass || className}`}>
        <span className="text-navy/20 text-xs uppercase tracking-widest font-bold">No Image</span>
      </div>
    );
  }

  const optimizedSrc = optimizeUrl(src, width);

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {!loaded && (
        <div className="absolute inset-0 bg-navy/5 animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
