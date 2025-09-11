
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { MatchCard } from '@/components/match-card';
import { useFavorites } from '@/hooks/use-favorites';
import { Heart, Star } from 'lucide-react';

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { favorites } = useFavorites();
  const [favoriteMatches, setFavoriteMatches] = useState<Match[]>([]);

  // Fetch all matches to filter favorites
  const { data: allMatches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/all'],
    queryFn: () => api.getAllMatches(),
    enabled: favorites.length > 0,
  });

  useEffect(() => {
    if (allMatches.length > 0 && favorites.length > 0) {
      const filtered = allMatches.filter((match: Match) => 
        favorites.includes(match.id)
      );
      setFavoriteMatches(filtered);
    } else {
      setFavoriteMatches([]);
    }
  }, [allMatches, favorites]);

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  if (isLoading && favorites.length > 0) {
    return (
      <div className="min-h-screen pb-16 md:pb-0">
        <Navbar hideSearchOnMobile={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-48 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Navbar hideSearchOnMobile={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Star className="mr-3 h-8 w-8 text-primary" />
            Favorite Matches
          </h1>
          <p className="text-muted-foreground">Your saved matches for easy access</p>
        </div>

        {favoriteMatches.length === 0 ? (
          <div className="glassmorphism p-8 rounded-lg text-center">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              Start adding matches to your favorites by tapping the star icon on match cards
            </p>
            <button
              onClick={() => setLocation('/schedule')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Matches
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Grid (2 columns) */}
            <div className="block md:hidden">
              <div className="grid grid-cols-2 gap-3">
                {favoriteMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => handleMatchClick(match)}
                    showFavorite={true}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid (5 columns) */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {favoriteMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => handleMatchClick(match)}
                    showFavorite={true}
                  />
                ))}
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-muted-foreground">
              {favoriteMatches.length} favorite{favoriteMatches.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
