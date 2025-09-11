
export const generateMetaTitle = (sport: string, isLive = false) => {
  const liveText = isLive ? "Live" : "";
  const sportName = sport.charAt(0).toUpperCase() + sport.slice(1);
  return `${liveText} ${sportName} Streaming - Free ${sportName} Streams Online | StreamSport`.trim();
};

export const generateMetaDescription = (sport: string, isLive = false) => {
  const liveText = isLive ? "live" : "";
  const sportName = sport.toLowerCase();
  return `Watch free ${liveText} ${sportName} streaming online. HD quality ${sportName} streams with real-time chat. All major ${sportName} leagues and tournaments available 24/7.`;
};

export const generateStructuredData = (pageType: string, data: any) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": `https://streamed.pk${data.url || ''}`,
    "inLanguage": "en-US",
    "isAccessibleForFree": true
  };

  switch (pageType) {
    case 'sport':
      return {
        ...baseStructuredData,
        "name": `${data.sport} Live Streaming`,
        "description": `Free ${data.sport} live streams and matches`,
        "specialty": `${data.sport} Streaming`,
        "audience": `${data.sport} fans`
      };
    
    case 'match':
      return {
        ...baseStructuredData,
        "@type": "VideoObject",
        "name": data.title,
        "description": `Live stream of ${data.title}`,
        "thumbnailUrl": data.thumbnail,
        "isLiveBroadcast": true,
        "sport": data.sport
      };
    
    case 'schedule':
      return {
        ...baseStructuredData,
        "name": "Sports Schedule",
        "description": "Complete schedule of live and upcoming sports matches",
        "mainContentOfPage": "Sports Schedule"
      };
    
    default:
      return baseStructuredData;
  }
};

export const generateKeywords = (sport: string, additional: string[] = []) => {
  const baseKeywords = [
    `${sport} streaming`,
    `${sport} live streams`,
    `free ${sport} streams`,
    `${sport} online`,
    `watch ${sport} live`,
    `${sport} matches today`,
    `${sport} streaming free`,
    `live ${sport} streaming`,
    `${sport} stream online`
  ];
  
  return [...baseKeywords, ...additional].join(', ');
};

export const addBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://streamed.pk${crumb.url}`
    }))
  };
};
