
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { MatchCard } from '@/components/match-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebouncedScroll } from '@/hooks/use-debounced-scroll';

const MATCHES_PER_PAGE = 25;
const MOBILE_MATCHES_PER_LOAD = 16;

export default function FootballSchedule() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(MOBILE_MATCHES_PER_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: footballMatches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/football'],
    queryFn: () => api.getFootballMatches(),
    enabled: true,
  });

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  // Desktop/Tablet pagination
  const totalPages = Math.ceil(footballMatches.length / MATCHES_PER_PAGE);
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  const currentMatches = footballMatches.slice(startIndex, endIndex);

  // Mobile infinite scroll
  const mobileMatches = footballMatches.slice(0, mobileDisplayCount);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMoreMobile = useCallback(() => {
    if (isLoadingMore || mobileDisplayCount >= footballMatches.length) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setMobileDisplayCount(prev => Math.min(prev + MOBILE_MATCHES_PER_LOAD, footballMatches.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, mobileDisplayCount, footballMatches.length]);

  // Infinite scroll for mobile - optimized with debouncing
  useDebouncedScroll(
    () => {
      if (!isLoadingMore && mobileDisplayCount < footballMatches.length) {
        loadMoreMobile();
      }
    },
    true,
    { delay: 150, threshold: 5 }
  );

  // SEO optimization for football page
  useEffect(() => {
    document.title = "Football Live Streaming - Free Soccer Streams Online | StreamSport";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Watch free football live streams online. Premier League, La Liga, Champions League, World Cup and all soccer matches available in HD quality with real-time chat.');
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'football streaming, soccer streams, Premier League streams, Champions League live, La Liga streaming, free football streams, live soccer online, football matches today');
    }

    // Structured data for football page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Football Live Streaming",
      "description": "Watch free football and soccer live streams online",
      "url": "https://streamed.pk/football",
      "specialty": "Football/Soccer Streaming",
      "audience": "Football fans worldwide",
      "inLanguage": "en-US",
      "keywords": ["football streaming", "soccer streams", "Premier League", "Champions League", "La Liga"],
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://streamed.pk"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Football Streaming",
            "item": "https://streamed.pk/football"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'football-structured-data';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('football-structured-data');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar hideSearchOnMobile />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-32 rounded mb-6"></div>
          <div className="skeleton h-8 w-48 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar hideSearchOnMobile />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Football Live Streaming - Free Soccer Streams Online</h1>
          <p className="text-muted-foreground">Watch all football matches and soccer events live for free. Premier League, Champions League, La Liga, World Cup and more.</p>
          
          {/* Internal linking for SEO */}
          <div className="mt-4 text-sm text-muted-foreground">
            <span>Popular: </span>
            <a href="/premier-league" className="text-primary hover:underline mr-3" title="Premier League live streams">Premier League</a>
            <a href="/champions-league" className="text-primary hover:underline mr-3" title="Champions League streaming">Champions League</a>
            <a href="/la-liga" className="text-primary hover:underline mr-3" title="La Liga live streams">La Liga</a>
            <a href="/world-cup" className="text-primary hover:underline" title="World Cup streaming">World Cup</a>
          </div>
        </div>

        {footballMatches.length === 0 ? (
          <div className="glassmorphism p-8 rounded-lg text-center">
            <p className="text-muted-foreground">No football matches available</p>
          </div>
        ) : (
          <>
            {/* Desktop/Tablet Grid (5 columns) */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 gap-4 mb-8">
                {currentMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => handleMatchClick(match)} 
                  />
                ))}
              </div>

              {/* Desktop Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="glassmorphism"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className={currentPage === page ? "bg-primary" : "glassmorphism"}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="glassmorphism"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Results Info */}
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, footballMatches.length)} of {footballMatches.length} matches
              </div>
            </div>

            {/* Mobile Grid (2 columns) with Infinite Scroll */}
            <div className="block md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {mobileMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => handleMatchClick(match)} 
                  />
                ))}
              </div>

              {/* Mobile Loading More */}
              {isLoadingMore && (
                <div className="flex justify-center mt-6">
                  <div className="skeleton h-12 w-32 rounded"></div>
                </div>
              )}

              {/* Mobile Results Info */}
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing {mobileMatches.length} of {footballMatches.length} matches
                {mobileDisplayCount < footballMatches.length && (
                  <div className="mt-2 text-xs">Scroll down to load more</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
