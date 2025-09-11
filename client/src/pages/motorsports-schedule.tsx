
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { MatchCard } from '@/components/match-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const MATCHES_PER_PAGE = 25;
const MOBILE_MATCHES_PER_LOAD = 16;

export default function MotorsportsSchedule() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(MOBILE_MATCHES_PER_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: motorsportsMatches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/motor-sports'],
    queryFn: () => api.getMotorsportsMatches(),
    enabled: true,
  });

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  // Desktop/Tablet pagination
  const totalPages = Math.ceil(motorsportsMatches.length / MATCHES_PER_PAGE);
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  const currentMatches = motorsportsMatches.slice(startIndex, endIndex);

  // Mobile infinite scroll
  const mobileMatches = motorsportsMatches.slice(0, mobileDisplayCount);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMoreMobile = useCallback(() => {
    if (isLoadingMore || mobileDisplayCount >= motorsportsMatches.length) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setMobileDisplayCount(prev => Math.min(prev + MOBILE_MATCHES_PER_LOAD, motorsportsMatches.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, mobileDisplayCount, motorsportsMatches.length]);

  // Infinite scroll for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) return; // Only on mobile
      
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoadingMore && mobileDisplayCount < motorsportsMatches.length) {
        loadMoreMobile();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreMobile, isLoadingMore, mobileDisplayCount, motorsportsMatches.length]);

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Motorsports Schedule</h1>
          <p className="text-muted-foreground">All racing and motorsports events</p>
        </div>

        {motorsportsMatches.length === 0 ? (
          <div className="glassmorphism p-8 rounded-lg text-center">
            <p className="text-muted-foreground">No motorsports matches available</p>
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
                Showing {startIndex + 1}-{Math.min(endIndex, motorsportsMatches.length)} of {motorsportsMatches.length} matches
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
                Showing {mobileMatches.length} of {motorsportsMatches.length} matches
                {mobileDisplayCount < motorsportsMatches.length && (
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
