import { Match } from '@/types/api';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export const MatchCard = memo(function MatchCard({ 
  match, 
  onClick, 
  showFavorite = false, 
  isFavorite: propIsFavorite, 
  onFavoriteToggle 
}: MatchCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const isMobile = useIsMobile();
  const isMatchFavorite = propIsFavorite !== undefined ? propIsFavorite : isFavorite(match.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle();
    } else {
      toggleFavorite(match.id);
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch {
      return 'TBD';
    }
  };

  const getMatchImageUrl = (match: Match) => {
    // First priority: Use poster images with team badges (home/away format)
    if (match.teams?.home?.badge && match.teams?.away?.badge) {
      const homeBadge = match.teams.home.badge;
      const awayBadge = match.teams.away.badge;
      return `/api/images/poster/${homeBadge}/${awayBadge}.webp`;
    }

    // Second priority: Use direct poster if available  
    if (match.poster) {
      return `/api/images/proxy/${match.poster}.webp`;
    }

    // Third priority: Use single team badge as badge image
    if (match.teams?.home?.badge) {
      return `/api/images/badge/${match.teams.home.badge}.webp`;
    }

    // Fourth priority: Use away team badge if available
    if (match.teams?.away?.badge) {
      return `/api/images/badge/${match.teams.away.badge}.webp`;
    }

    // Final fallback: Use match id as poster proxy (for events without team badges)
    if (match.id) {
      return `/api/images/proxy/${match.id}.webp`;
    }

    return null;
  };

  const isLive = () => {
    const now = Date.now();
    const matchTime = match.date;
    // Consider a match live if it's within 3 hours of start time
    return Math.abs(now - matchTime) < 3 * 60 * 60 * 1000 && now >= matchTime;
  };

  const matchIsLive = isLive();
  const imageUrl = getMatchImageUrl(match);

  return (
    <div className="flex-shrink-0 w-48 cursor-pointer" onClick={() => onClick?.(match)}>
      {/* Match Card with Background Image */}
      <div
        className="relative h-28 rounded-lg overflow-hidden group hover:scale-105 transition-all duration-200 match-card-enhanced bg-card backdrop-blur-sm"
      >
        {/* Background Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${match.title} live stream - Watch free sports streaming online`}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            width="192"
            height="112"
            loading="lazy"
            decoding="async"
            title={`Watch ${match.title} live stream for free`}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Try fallback strategies on error
              if (img.src.includes('/poster/') && match.teams?.home?.badge) {
                // If poster failed, try home team badge
                img.src = `/api/images/badge/${match.teams.home.badge}.webp`;
                img.alt = `Sports match poster - ${match.title} live streaming`;
              } else if (img.src.includes('/badge/') && match.teams?.away?.badge) {
                // If home badge failed, try away team badge
                img.src = `/api/images/badge/${match.teams.away.badge}.webp`;
                img.alt = `Sports match poster - ${match.title} live streaming`;
              } else {
                // All attempts failed, hide image
                img.style.display = 'none';
              }
            }}
          />
        )}

        {/* Top overlay with time and live indicator */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <span className={`text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm border shadow-lg ${
            matchIsLive 
              ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-red-900/50' 
              : 'bg-primary/90 text-white border-accent/40'
          }`}>
            {matchIsLive ? 'LIVE' : formatTime(match.date)}
          </span>

          {matchIsLive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-900/50" />
            </div>
          )}
        </div>

        {/* Favorite Button - Mobile Only */}
        {(isMobile || showFavorite) && (
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border",
              isMatchFavorite
                ? "bg-accent text-accent-foreground border-accent/30"
                : "bg-card/80 text-foreground hover:bg-accent/20 border-accent/20 hover:border-accent/40"
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                isMatchFavorite && "fill-current"
              )}
            />
          </button>
        )}

      </div>

      {/* Event Title and Category - Below the card */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
          {match.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          {match.category}
        </p>
      </div>
    </div>
  );
});