import { ReportHandler } from 'web-vitals';

/**
 * Reporta las métricas de Web Vitals a la consola (desarrollo)
 * y potencialmente a un servicio de analytics (producción)
 * 
 * Métricas importantes para PageSpeed:
 * - LCP (Largest Contentful Paint): < 2.5s es bueno
 * - FID (First Input Delay): < 100ms es bueno  
 * - CLS (Cumulative Layout Shift): < 0.1 es bueno
 * - FCP (First Contentful Paint): < 1.8s es bueno
 * - TTFB (Time to First Byte): < 800ms es bueno
 */
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Helper para enviar a Google Analytics (opcional)
export const sendToAnalytics = ({ name, delta, value, id }: any) => {
  // En producción, podrías enviar a GA4 o similar
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, {
      delta,
      value,
      id,
      rating: getRating(name, value)
    });
  }
  
  // Ejemplo para Google Analytics 4:
  // if (window.gtag) {
  //   window.gtag('event', name, {
  //     value: Math.round(name === 'CLS' ? delta * 1000 : delta),
  //     event_category: 'Web Vitals',
  //     event_label: id,
  //     non_interaction: true,
  //   });
  // }
};

// Helper para determinar si la métrica es buena, necesita mejora o es pobre
function getRating(metric: string, value: number): string {
  const thresholds: Record<string, [number, number]> = {
    'LCP': [2500, 4000],
    'FID': [100, 300],
    'CLS': [0.1, 0.25],
    'FCP': [1800, 3000],
    'TTFB': [800, 1800],
  };
  
  const [good, poor] = thresholds[metric] || [0, 0];
  
  if (value <= good) return '✅ Bueno';
  if (value <= poor) return '⚠️ Necesita mejora';
  return '❌ Pobre';
}

export default reportWebVitals;
