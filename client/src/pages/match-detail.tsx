import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Play, Timer } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/use-favorites';
import { SocialShare } from '@/components/social-share';
import { TelegramBanner } from '@/components/telegram-banner';
import { useState, useEffect } from 'react';
import { Star, Share2, Heart } from 'lucide-react';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEventStarted, setIsEventStarted] = useState(false);

  useEffect(() => {
    const target = parseISO(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
        setIsEventStarted(false);
      } else {
        setIsEventStarted(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isEventStarted) {
    return (
      <div className="glassmorphism p-4 rounded-lg text-center border border-green-500/50 bg-green-500/5">
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <Play className="h-5 w-5" />
          <span className="font-medium">Event has started!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-4 rounded-lg">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Timer className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Event Starts In</h3>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground">Minutes</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
            <div className="text-xs text-muted-foreground">Seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/match/:id');
  const searchParams = new URLSearchParams(window.location.search);
  const source = searchParams.get('source') || 'streamed';
  const isMobile = useIsMobile();
  const { toggleFavorite, isFavorite } = useFavorites();

  const parseTeams = (title: string) => {
    const parts = title.split(' vs ');
    if (parts.length === 2) {
      return { home: parts[0].trim(), away: parts[1].trim() };
    }
    return { home: title, away: '' };
  };

  const isLive = (match: Match) => {
    const now = Date.now();
    const matchTime = match.date;
    return Math.abs(now - matchTime) < 3 * 60 * 60 * 1000 && now >= matchTime;
  };

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/all'],
    queryFn: () => api.getAllMatches(),
    enabled: !!params?.id,
  });

  // Find the specific match
  const currentMatch = matches.find((m: Match) => m.id === params?.id);
  const teams = currentMatch ? parseTeams(currentMatch.title) : null;
  const matchIsLive = currentMatch ? isLive(currentMatch) : false;
  const isMatchFavorite = currentMatch ? isFavorite(currentMatch.id) : false;

  const handleFavoriteToggle = () => {
    if (currentMatch) {
      toggleFavorite(currentMatch.id);
    }
  };

  const handleShare = () => {
    if (navigator.share && currentMatch) {
      navigator.share({
        title: `Watch ${currentMatch.title}`,
        text: `Check out this live match: ${currentMatch.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), isMobile ? 'MMM dd' : 'PPP');
    } catch {
      return 'Unknown Date';
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'p');
    } catch {
      return 'Unknown Time';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar hideSearchOnMobile />
        <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="skeleton h-6 w-20 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="skeleton h-32 sm:h-40 rounded-lg"></div>
            <div className="skeleton h-24 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar hideSearchOnMobile />
        <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4 h-8 px-2 text-sm"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </Button>

          <Card className="glassmorphism border-border">
            <CardContent className="p-4 sm:p-6 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Match Not Found</h2>
              <p className="text-sm text-muted-foreground">The requested match could not be found.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar hideSearchOnMobile />
      <TelegramBanner />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-4 h-8 px-2 text-sm hover:bg-accent"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>

        <div className="space-y-4">
          {/* Match Header */}
          <Card className="glassmorphism border-border">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={`text-xs px-2 py-0.5 ${
                        matchIsLive
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                      data-testid="match-status-badge"
                    >
                      {matchIsLive ? 'LIVE' : 'SCHEDULED'}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {currentMatch.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold leading-tight mb-1">
                    {teams?.away ? `${teams.home} vs ${teams.away}` : currentMatch.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(currentMatch.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(currentMatch.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Team Badges - Mobile: Stacked, Desktop: Side by side */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
                  {currentMatch.team?.home?.badge && (
                    <img
                      src={`https://streamed.pk/api/images/proxy/${encodeURIComponent(currentMatch.team.home.badge)}.webp`}
                      alt={`${teams?.home} Badge`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {currentMatch.team?.away?.badge && (
                    <img
                      src={`https://streamed.pk/api/images/proxy/${encodeURIComponent(currentMatch.team.away.badge)}.webp`}
                      alt={`${teams?.away} Badge`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stream Access Card */}
          <Card className="glassmorphism border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Watch Live Stream
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    Multiple sources available • {currentMatch.sources.length} sources
                  </p>
                </div>

                {/* Action Buttons - Mobile: Stacked, Desktop: Row */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-sm mx-auto">
                  <Button
                    onClick={() => setLocation(`/match/${currentMatch.id}/streams`)}
                    className="h-9 text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                    data-testid="view-streams-button"
                  >
                    <Play className="mr-2 h-3 w-3" />
                    View Sources
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/match/${currentMatch.id}/streams`)}
                    className="h-9 text-sm glassmorphism border-border flex-1"
                    data-testid="view-all-sources"
                  >
                    All {currentMatch.sources.length} Sources
                  </Button>
                </div>

                {/* Available Sources */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Sources: </span>
                  {currentMatch.sources.map((s, index) => (
                    <span key={s.source}>
                      {s.source}
                      {index < currentMatch.sources.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favorite and Share Section */}
          <Card className="glassmorphism border-border">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleFavoriteToggle}
                  className={`flex items-center space-x-2 transition-colors ${
                    isMatchFavorite 
                      ? 'bg-accent text-accent-foreground border-accent' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isMatchFavorite ? 'fill-current' : ''}`} />
                  <span>{isMatchFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Match</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Match Details - Compact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Match Info */}
            <Card className="glassmorphism border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Match Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sport</span>
                  <span className="text-foreground capitalize">{currentMatch.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{formatDate(currentMatch.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground">{formatTime(currentMatch.date)}</span>
                </div>
                {currentMatch.popular && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                      Popular
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teams Info */}
            <Card className="glassmorphism border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teams?.home && (
                  <div className="flex items-center space-x-3">
                    {currentMatch.team?.home?.badge && (
                      <img
                        src={`https://streamed.pk/api/images/proxy/${encodeURIComponent(currentMatch.team.home.badge)}.webp`}
                        alt={`${teams.home} Badge`}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{teams.home}</p>
                      <p className="text-xs text-muted-foreground">Home</p>
                    </div>
                  </div>
                )}

                {teams?.away && (
                  <>
                    {teams?.home && <div className="border-t border-border" />}
                    <div className="flex items-center space-x-3">
                      {currentMatch.team?.away?.badge && (
                        <img
                          src={`https://streamed.pk/api/images/proxy/${encodeURIComponent(currentMatch.team.away.badge)}.webp`}
                          alt={`${teams.away} Badge`}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{teams.away}</p>
                        <p className="text-xs text-muted-foreground">Away</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Match Poster - Only show if available */}
          {(currentMatch.poster || currentMatch.team?.home?.badge) && (
            <Card className="glassmorphism border-border overflow-hidden">
              <img
                src={
                  currentMatch.team?.home?.badge && currentMatch.team?.away?.badge
                    ? `https://streamed.pk/api/images/poster/${encodeURIComponent(currentMatch.team.home.badge)}/${encodeURIComponent(currentMatch.team.away.badge)}.webp`
                    : currentMatch.poster
                    ? `https://streamed.pk/api/images/proxy/${encodeURIComponent(currentMatch.poster)}.webp`
                    : currentMatch.team?.home?.badge
                    ? `https://streamed.pk/api/images/proxy/${encodeURIComponent(currentMatch.team.home.badge)}.webp`
                    : ''
                }
                alt={currentMatch.title}
                className="w-full h-40 sm:h-48 md:h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.parentElement?.style.setProperty('display', 'none');
                }}
              />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}