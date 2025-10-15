import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prevLocation, setPrevLocation] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    // Si la ubicación cambia, activar la transición
    if (prevLocation !== location.pathname) {
      setIsVisible(false);
      setPrevLocation(location.pathname);
      
      // Pequeño delay para permitir que la página anterior desaparezca
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [location.pathname, prevLocation]);

  return (
    <div 
      className={`page-transition-wrapper ${className} ${
        isVisible ? 'page-visible' : 'page-hidden'
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;