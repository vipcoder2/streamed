import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Match } from '@/types/api';
import { MatchCard } from './match-card';
import { LoadingSkeleton } from './loading-skeleton';
import { Button } from '@/components/ui/button';

interface MatchSectionProps {
  title: string;
  matches: Match[];
  isLoading: boolean;
  onMatchClick: (match: Match) => void;
  emptyMessage?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  showFavorites?: boolean;
}

export function MatchSection({ 
  title, 
  matches, 
  isLoading, 
  onMatchClick, 
  emptyMessage = "No matches available",
  showViewAll = false,
  onViewAll,
  showFavorites = false
}: MatchSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 200; // width of card + gap
    const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;

    scrollRef.current.scrollBy({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  // Hide section if no matches and not loading
  if (!isLoading && matches.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll('left')}
            className="p-2 glassmorphism hover:bg-primary/20"
            data-testid={`scroll-left-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll('right')}
            className="p-2 glassmorphism hover:bg-primary/20"
            data-testid={`scroll-right-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scroll-container pb-4"
        data-testid={`match-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} />)
        ) : matches.length > 0 ? (
          matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onClick={() => onMatchClick(match)}
              showFavorite={showFavorites}
            />
          ))
        ) : (
          <div className="glassmorphism flex-shrink-0 w-80 p-8 rounded-lg text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}