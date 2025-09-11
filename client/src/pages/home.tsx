import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { SportsCategories } from '@/components/sports-categories';
import { MatchSection } from '@/components/match-section';
import { BottomNavigation } from '@/components/bottom-navigation';
import { SocialShare } from '@/components/social-share';

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedSport, setSelectedSport] = useState('football');

  // SEO optimization
  useEffect(() => {
    document.title = "StreamSport - Free Live Sports Streaming | Football, Basketball, Cricket & More";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Watch free live sports streaming online. Football, basketball, cricket, tennis, boxing and more sports available 24/7. High quality HD streams with real-time chat.');
    }

    // Add structured data for homepage
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "StreamSport",
      "description": "Free live sports streaming platform with real-time chat",
      "url": "https://streamed.pk",
      "applicationCategory": "Entertainment",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Live sports streaming",
        "Real-time chat",
        "HD quality streams", 
        "Multiple sports categories",
        "Mobile responsive"
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Live matches
  const { data: liveMatches = [], isLoading: liveLoading } = useQuery({
    queryKey: ['/api/matches/live'],
    queryFn: () => api.getLiveMatches(),
    enabled: true,
  });

  const { data: popularLiveMatches = [], isLoading: popularLiveLoading } = useQuery({
    queryKey: ['/api/matches/live/popular'],
    queryFn: () => api.getPopularLiveMatches(),
    enabled: true,
  });

  // Today's matches
  const { data: todayMatches = [], isLoading: todayLoading } = useQuery({
    queryKey: ['/api/matches/all-today'],
    queryFn: () => api.getAllTodayMatches(),
    enabled: true,
  });

  const { data: popularTodayMatches = [], isLoading: popularTodayLoading } = useQuery({
    queryKey: ['/api/matches/all-today/popular'],
    queryFn: () => api.getPopularTodayMatches(),
    enabled: true,
  });

  // Sport-specific matches
  const { data: footballMatches = [], isLoading: footballLoading } = useQuery({
    queryKey: ['/api/matches/football'],
    queryFn: () => api.getFootballMatches(),
    enabled: true,
  });

  const { data: basketballMatches = [], isLoading: basketballLoading } = useQuery({
    queryKey: ['/api/matches/basketball'],
    queryFn: () => api.getBasketballMatches(),
    enabled: true,
  });

  const { data: americanFootballMatches = [], isLoading: americanFootballLoading } = useQuery({
    queryKey: ['/api/matches/american-football'],
    queryFn: () => api.getAmericanFootballMatches(),
    enabled: true,
  });

  const { data: baseballMatches = [], isLoading: baseballLoading } = useQuery({
    queryKey: ['/api/matches/baseball'],
    queryFn: () => api.getMatches('baseball'),
    enabled: true,
  });

  const { data: hockeyMatches = [], isLoading: hockeyLoading } = useQuery({
    queryKey: ['/api/matches/hockey'],
    queryFn: () => api.getMatches('hockey'),
    enabled: true,
  });

  const { data: boxingMatches = [], isLoading: boxingLoading } = useQuery({
    queryKey: ['/api/matches/fight'],
    queryFn: () => api.getBoxingMatches(),
    enabled: true,
  });

  const { data: tennisMatches = [], isLoading: tennisLoading } = useQuery({
    queryKey: ['/api/matches/tennis'],
    queryFn: () => api.getTennisMatches(),
    enabled: true,
  });

  const { data: cricketMatches = [], isLoading: cricketLoading } = useQuery({
    queryKey: ['/api/matches/cricket'],
    queryFn: () => api.getCricketMatches(),
    enabled: true,
  });

  const { data: golfMatches = [], isLoading: golfLoading } = useQuery({
    queryKey: ['/api/matches/golf'],
    queryFn: () => api.getGolfMatches(),
    enabled: true,
  });

  const { data: motorsportsMatches = [], isLoading: motorsportsLoading } = useQuery({
    queryKey: ['/api/matches/motor-sports'],
    queryFn: () => api.getMotorsportsMatches(),
    enabled: true,
  });

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0 text-white" style={{ backgroundColor: '#011412' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sports Categories */}
        <SportsCategories 
          selectedSport={selectedSport}
          onSportSelect={setSelectedSport}
          hideOnMobile={true}
        />

        {/* Social Share Section */}
        <SocialShare />

        {/* Popular Football - Moved to top */}
        <MatchSection
          title="Popular Football"
          matches={footballMatches}
          isLoading={footballLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Live Events Section */}
        <MatchSection
          title="All Live Events"
          matches={liveMatches}
          isLoading={liveLoading}
          onMatchClick={handleMatchClick}
          emptyMessage="No live matches at the moment"
          showViewAll={true}
          onViewAll={() => setLocation('/schedule')}
          showFavorites={true}
        />

        {/* Popular Live Events */}
        <MatchSection
          title="Popular Live Events"
          matches={popularLiveMatches}
          isLoading={popularLiveLoading}
          onMatchClick={handleMatchClick}
          emptyMessage="No popular live matches"
          showFavorites={true}
        />

        {/* Today's Matches */}
        <MatchSection
          title="Today's Matches"
          matches={todayMatches}
          isLoading={todayLoading}
          onMatchClick={handleMatchClick}
          emptyMessage="No matches scheduled for today"
          showViewAll={true}
          onViewAll={() => setLocation('/schedule')}
          showFavorites={true}
        />

        {/* Popular Today's Matches */}
        <MatchSection
          title="Popular Today"
          matches={popularTodayMatches}
          isLoading={popularTodayLoading}
          onMatchClick={handleMatchClick}
          emptyMessage="No popular matches today"
          showFavorites={true}
        />

        {/* Popular Basketball */}
        <MatchSection
          title="Popular Basketball"
          matches={basketballMatches}
          isLoading={basketballLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular American Football */}
        <MatchSection
          title="Popular American Football"
          matches={americanFootballMatches}
          isLoading={americanFootballLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Baseball */}
        <MatchSection
          title="Popular Baseball"
          matches={baseballMatches}
          isLoading={baseballLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Hockey */}
        <MatchSection
          title="Popular Hockey"
          matches={hockeyMatches}
          isLoading={hockeyLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Fighting */}
        <MatchSection
          title="Popular Fighting"
          matches={boxingMatches}
          isLoading={boxingLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Tennis */}
        <MatchSection
          title="Popular Tennis"
          matches={tennisMatches}
          isLoading={tennisLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Cricket */}
        <MatchSection
          title="Popular Cricket"
          matches={cricketMatches}
          isLoading={cricketLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Golf */}
        <MatchSection
          title="Popular Golf"
          matches={golfMatches}
          isLoading={golfLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />

        {/* Popular Motorsports */}
        <MatchSection
          title="Popular Motorsports"
          matches={motorsportsMatches}
          isLoading={motorsportsLoading}
          onMatchClick={handleMatchClick}
          showFavorites={true}
        />
      </main>
      <BottomNavigation />
    </div>
  );
}