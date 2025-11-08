import React from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
  schemaData?: any;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://ingenieria-software-2025.vercel.app/logo192.png',
  ogType = 'website',
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
  schemaData
}) => {
  const fullTitle = `${title} | TalentTrace`;
  const fullCanonicalUrl = canonicalUrl || window.location.href;

  React.useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'TalentTrace');
    updateMetaTag('robots', 'index, follow');

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', fullCanonicalUrl, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:site_name', 'TalentTrace', 'property');

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', fullTitle, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', ogImage, 'name');

    // Article meta tags (if it's an article)
    if (ogType === 'article') {
      if (articlePublishedTime) {
        updateMetaTag('article:published_time', articlePublishedTime, 'property');
      }
      if (articleModifiedTime) {
        updateMetaTag('article:modified_time', articleModifiedTime, 'property');
      }
      if (articleAuthor) {
        updateMetaTag('article:author', articleAuthor, 'property');
      }
      if (articleSection) {
        updateMetaTag('article:section', articleSection, 'property');
      }
      if (articleTags && articleTags.length > 0) {
        // Remove existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
        // Add new ones
        articleTags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.content = tag;
          document.head.appendChild(meta);
        });
      }
    }

    // Canonical URL
    updateCanonicalLink(fullCanonicalUrl);

    // Schema.org structured data
    if (schemaData) {
      updateSchemaScript(schemaData);
    }

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, articlePublishedTime, articleModifiedTime, articleAuthor, articleSection, articleTags, schemaData, fullTitle, fullCanonicalUrl]);

  return null; // This component doesn't render anything
};

// Helper function to update or create meta tags
const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
};

// Helper function to update canonical link
const updateCanonicalLink = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  
  link.href = url;
};

// Helper function to update schema.org structured data
const updateSchemaScript = (schemaData: any) => {
  // Remove existing schema script if any
  const existingScript = document.querySelector('script[data-schema="dynamic"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create new schema script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema', 'dynamic');
  script.textContent = JSON.stringify(schemaData);
  document.head.appendChild(script);
};

export default SEO;
