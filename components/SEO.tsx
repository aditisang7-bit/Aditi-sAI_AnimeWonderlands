import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title = "Aditi's AI - Anime Art, Ludo & Creative Tools", 
  description = "The #1 AI Platform in India. Generate Anime Art, play Ludo, and analyze documents. Free tools based in Pune.",
  keywords
}) => {
  const location = useLocation();

  useEffect(() => {
    // Update Title
    document.title = title;

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Update Keywords (AEO optimization)
    if (keywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', keywords);
        }
    }

    // Trigger Social Preview update simulation (for internal tracking if needed)
    // In a real SSR app, we'd use Helmet, but for SPA this helps browser history/tabs
  }, [title, description, keywords, location]);

  return null;
};