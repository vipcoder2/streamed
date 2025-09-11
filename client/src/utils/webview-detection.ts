/**
 * Detects if the site is being viewed in a social media webview
 * to prevent right-click protection from interfering with these platforms
 */
export const isSocialMediaWebview = (): boolean => {
  try {
    const userAgent = navigator.userAgent?.toLowerCase() || '';
    const referrer = document.referrer?.toLowerCase() || '';
    
    // Check for common social media webview indicators
    const socialMediaIndicators = [
      // Twitter/X webview indicators
      'twitter',
      'twitterbot',
      'x.com',
      't.co',
      
      // Facebook webview indicators
      'facebook',
      'fb.com',
      'messenger',
      'instagram',
      'meta.com',
      'fban',
      'fbav',
      'fbsv',
      'facebookexternalhit',
      
      // Telegram webview indicators
      'telegram',
      't.me',
      'telegrambot',
      
      // LinkedIn webview indicators
      'linkedin',
      'linkedinbot',
      
      // WhatsApp webview indicators
      'whatsapp',
      'wa.me',
      
      // Discord webview indicators
      'discord',
      'discordbot',
      
      // Other social platforms
      'reddit',
      'pinterest',
      'snapchat',
      'tiktok',
      'youtube'
    ];
    
    // Check user agent for social media indicators
    const hasUserAgentIndicator = socialMediaIndicators.some(indicator => 
      userAgent.includes(indicator)
    );
    
    // Check referrer for social media domains
    const hasReferrerIndicator = socialMediaIndicators.some(indicator => 
      referrer.includes(indicator)
    );
    
    // Additional checks for common webview patterns
    const isWebview = userAgent.includes('webview') || 
                     userAgent.includes('wv') ||
                     (userAgent.includes('version/') && userAgent.includes('mobile safari') && !userAgent.includes('crios') && !userAgent.includes('fxios')) ||
                     userAgent.includes('fban') ||
                     userAgent.includes('fbav') ||
                     userAgent.includes('line/');
    
    // Check if window properties suggest a webview environment
    const hasWebviewProperties = typeof window !== 'undefined' && (
      // Check if running in iframe (but exclude Replit's own webview)
      (window.self !== window.top && !window.location.hostname.includes('replit')) ||
      // Check for specific webview APIs
      !!(window as any).TelegramWebviewProxy ||
      !!(window as any).AndroidWebView ||
      !!(window as any).webkit?.messageHandlers
    );
    
    // Check for Replit's own webview to exclude it from protection
    const isReplitWebview = window.location.hostname.includes('replit') || 
                           window.location.hostname.includes('.repl.co') ||
                           window.location.hostname.includes('replit.dev');
    
    return (hasUserAgentIndicator || hasReferrerIndicator || (isWebview && hasWebviewProperties)) && !isReplitWebview;
  } catch (error) {
    // If detection fails, be more conservative and only skip for known bots
    console.warn('Social media webview detection failed:', error);
    return false;
  }
};

/**
 * Additional check for bot/crawler detection
 */
export const isBot = (): boolean => {
  try {
    const userAgent = navigator.userAgent?.toLowerCase() || '';
    
    const botIndicators = [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'googlebot',
      'bingbot',
      'slackbot',
      'twitterbot',
      'facebookexternalhit',
      'linkedinbot',
      'whatsapp',
      'telegram',
      'discordbot',
      'pinterest',
      'reddit'
    ];
    
    return botIndicators.some(indicator => userAgent.includes(indicator));
  } catch (error) {
    return false;
  }
};