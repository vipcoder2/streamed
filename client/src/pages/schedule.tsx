import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Match, Sport } from "@/types/api";
import Navbar from "@/components/navbar";
import { MatchCard } from "@/components/match-card";
import { SectionSkeleton } from "@/components/loading-skeleton";
import { useLocation } from "wouter";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Star, Home, Calendar, Search } from "lucide-react";
import { SocialShare } from "@/components/social-share";

// Import Star icon

const MATCHES_PER_PAGE = 25;
const MOBILE_MATCHES_PER_LOAD = 16;

export default function Schedule() {
  const [, setLocation] = useLocation();
  const [selectedSport, setSelectedSport] = useState("all");
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(
    MOBILE_MATCHES_PER_LOAD,
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // SEO optimization for schedule page
  useEffect(() => {
    document.title = "Sports Schedule - Live & Upcoming Matches | Free Sports Streaming";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete sports schedule with live and upcoming matches. Watch football, basketball, cricket, tennis streams online for free. Updated real-time.');
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', 'https://streamed.pk/schedule');
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonical);
    }

    // Structured data for schedule page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Sports Schedule",
      "description": "Complete schedule of live and upcoming sports matches",
      "url": "https://streamed.pk/schedule",
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
            "name": "Schedule",
            "item": "https://streamed.pk/schedule"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'schedule-structured-data';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('schedule-structured-data');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Detect mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Local storage for favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteMatches");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const toggleFavorite = (matchId: string) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(matchId)) {
        newFavorites.delete(matchId);
      } else {
        newFavorites.add(matchId);
      }
      localStorage.setItem(
        "favoriteMatches",
        JSON.stringify(Array.from(newFavorites)),
      );
      return newFavorites;
    });
  };

  const { data: sports = [], isLoading: sportsLoading } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => api.getSports(),
    enabled: true,
  });

  const { data: allMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: [
      "/api/matches",
      selectedSport === "all" ? "all-today-popular" : selectedSport,
    ],
    queryFn: () =>
      selectedSport === "all"
        ? api.getPopularTodayMatches()
        : api.getPopularMatches(selectedSport),
    enabled: !showLiveOnly,
  });

  const { data: liveMatches = [], isLoading: liveMatchesLoading } = useQuery({
    queryKey: ["/api/matches/live-popular"],
    queryFn: () => api.getPopularLiveMatches(),
    enabled: showLiveOnly,
  });

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
    setShowLiveOnly(false);
    setCurrentPage(1);
    setMobileDisplayCount(MOBILE_MATCHES_PER_LOAD);
  };

  const handleLiveToggle = () => {
    setShowLiveOnly(!showLiveOnly);
    setSelectedSport("all");
    setCurrentPage(1);
    setMobileDisplayCount(MOBILE_MATCHES_PER_LOAD);
  };

  // Get current matches based on filter
  const currentMatchesData = showLiveOnly ? liveMatches : allMatches;
  const isCurrentlyLoading = showLiveOnly ? liveMatchesLoading : matchesLoading;

  // Desktop/Tablet pagination
  const totalPages = Math.ceil(currentMatchesData.length / MATCHES_PER_PAGE);
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  const currentMatches = currentMatchesData.slice(startIndex, endIndex);

  // Mobile infinite scroll
  const mobileMatches = currentMatchesData.slice(0, mobileDisplayCount);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadMoreMobile = useCallback(() => {
    if (isLoadingMore || mobileDisplayCount >= currentMatchesData.length)
      return;

    setIsLoadingMore(true);
    setTimeout(() => {
      setMobileDisplayCount((prev) =>
        Math.min(prev + MOBILE_MATCHES_PER_LOAD, currentMatchesData.length),
      );
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, mobileDisplayCount, currentMatchesData.length]);

  // Infinite scroll for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile) return; // Only on mobile

      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (
        scrollTop + clientHeight >= scrollHeight - 5 &&
        !isLoadingMore &&
        mobileDisplayCount < currentMatchesData.length
      ) {
        loadMoreMobile();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    loadMoreMobile,
    isLoadingMore,
    mobileDisplayCount,
    currentMatchesData.length,
    isMobile,
  ]);

  if (sportsLoading || isCurrentlyLoading) {
    return (
      <div className="min-h-screen bg-[#011412]">
        {" "}
        {/* Set background color here */}
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-48 rounded mb-6"></div>
          <SectionSkeleton />
          <SectionSkeleton />
        </main>
      </div>
    );
  }

  // Filtered matches for the favorites page
  const favoriteMatches = currentMatchesData.filter((match) =>
    favorites.has(match.id),
  );

  return (
    <div className="bg-[#011412] min-h-screen text-white">
      {" "}
      {/* Set background color here */}
      <Navbar />
      {/* Social Share Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <SocialShare />

          <h1 className="text-2xl font-bold text-foreground mb-2 py-3">
            {showLiveOnly ? "Live Matches" : "Sports Schedule"}
          </h1>
          <p className="text-muted-foreground">
            {showLiveOnly
              ? "Currently live sports matches"
              : "Upcoming and live sports matches"}
          </p>
        </div>

        {/* Sport Filter Chips */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleLiveToggle}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                showLiveOnly
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-muted text-muted-foreground hover:bg-red-600/20"
              }`}
            >
              🔴 Live
            </button>
            <button
              onClick={() => handleSportChange("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSport === "all" && !showLiveOnly
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/20"
              }`}
            >
              All Sports
            </button>
            {sports.map((sport: Sport) => (
              <button
                key={sport.id}
                onClick={() => handleSportChange(sport.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedSport === sport.id && !showLiveOnly
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/20"
                }`}
              >
                {sport.name}
              </button>
            ))}
          </div>
        </div>

        {currentMatchesData.length === 0 ? (
          <div className="glassmorphism p-8 rounded-lg text-center">
            <p className="text-muted-foreground">
              {showLiveOnly
                ? "No live matches at the moment"
                : "No matches scheduled"}
            </p>
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
                    isFavorite={
                      Array.isArray(favorites) && favorites.includes(match.id)
                    }
                    onFavoriteToggle={() => toggleFavorite(match.id)}
                    showFavorite={true}
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
                          className={
                            currentPage === page
                              ? "bg-primary"
                              : "glassmorphism"
                          }
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
                Showing {startIndex + 1}-
                {Math.min(endIndex, currentMatchesData.length)} of{" "}
                {currentMatchesData.length} matches
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
                    isFavorite={
                      Array.isArray(favorites) && favorites.includes(match.id)
                    }
                    onFavoriteToggle={() => toggleFavorite(match.id)}
                    showFavorite={true}
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
                Showing {mobileMatches.length} of {currentMatchesData.length}{" "}
                matches
                {mobileDisplayCount < currentMatchesData.length && (
                  <div className="mt-2 text-xs">Scroll down to load more</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 px-4 flex justify-around z-50">
          <button
            onClick={() => setLocation("/")}
            className="flex flex-col items-center text-muted-foreground hover:text-primary"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setLocation("/schedule")}
            className="flex flex-col items-center text-muted-foreground hover:text-primary"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Schedule</span>
          </button>
          <button
            onClick={() => setLocation("/favorites")}
            className="flex flex-col items-center text-muted-foreground hover:text-primary"
          >
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1">Favorites</span>
          </button>
        </nav>
      )}
    </div>
  );
}
