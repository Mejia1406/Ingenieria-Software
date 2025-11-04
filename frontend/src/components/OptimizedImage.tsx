import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Para imágenes above-the-fold
}

/**
 * Componente de imagen optimizada con lazy loading nativo
 * - Usa loading="lazy" para imágenes que no son críticas
 * - Usa loading="eager" para imágenes above-the-fold (priority=true)
 * - Mejora el LCP (Largest Contentful Paint) y reduce el consumo de datos
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
