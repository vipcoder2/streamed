import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Sport } from '@/types/api';

interface SportsCategoriesProps {
  selectedSport: string;
  onSportSelect: (sport: string) => void;
  hideOnMobile?: boolean;
}

export function SportsCategories({ selectedSport, onSportSelect, hideOnMobile = false }: SportsCategoriesProps) {
  const { data: sports = [], isLoading } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: () => api.getSports(),
    enabled: true,
  });

  if (isLoading) {
    return (
      <section className={`mb-8 mt-8 ${hideOnMobile ? 'hidden sm:block' : ''}`}>
        <div className="flex items-center space-x-3 overflow-auto scroll-container pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glassmorphism flex-shrink-0 px-6 py-3 rounded-full border-2 border-border">
              <div className="skeleton h-4 w-16 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`mt-8 mb-8 ${hideOnMobile ? 'hidden sm:block' : ''}`}>
      <div className="flex items-center space-x-3 overflow-auto scroll-container pb-4">
        {sports.map((sport: Sport) => {
          const isSelected = selectedSport === sport.id;

          return (
            <button
              key={sport.id}
              onClick={() => window.location.href = `/sport/${sport.id}`}
              className={`glassmorphism flex-shrink-0 px-6 py-3 rounded-full hover:bg-accent/10 transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted-foreground hover:border-accent/50'
              }`}
              data-testid={`sport-${sport.id}`}
            >
              <span className={`text-sm font-medium whitespace-nowrap ${
                isSelected ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {sport.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}