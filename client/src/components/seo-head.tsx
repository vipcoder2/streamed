
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: object;
}

export function SEOHead({
  title = "StreamSport - Free Live Sports Streaming",
  description = "Watch free live sports streaming online. Football, basketball, cricket, tennis, boxing and more sports available 24/7.",
  keywords = "live sports streaming, free sports streams, football streaming, basketball streaming, cricket streaming",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  structuredData
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription) {
      metaDescription.content = description;
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    if (metaKeywords) {
      metaKeywords.content = keywords;
    }

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Update Open Graph tags
    const ogTitleMeta = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitleMeta && ogTitle) {
      ogTitleMeta.content = ogTitle;
    }

    const ogDescMeta = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDescMeta && ogDescription) {
      ogDescMeta.content = ogDescription;
    }

    const ogImageMeta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    if (ogImageMeta && ogImage) {
      ogImageMeta.content = ogImage;
    }

    // Add structured data
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      script.id = 'dynamic-structured-data';
      
      // Remove existing dynamic structured data
      const existing = document.getElementById('dynamic-structured-data');
      if (existing) {
        document.head.removeChild(existing);
      }
      
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.getElementById('dynamic-structured-data');
        if (scriptToRemove) {
          document.head.removeChild(scriptToRemove);
        }
      };
    }
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, structuredData]);

  return null;
}
