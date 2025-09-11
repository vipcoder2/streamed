import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Sport } from '@/types/api';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dumbbell,
  Zap,
  Car,
  Trophy,
  Target,
  Gamepad2,
} from 'lucide-react';

const sportIcons: Record<string, any> = {
  basketball: Dumbbell,
  football: Zap,
  'american-football': Trophy,
  hockey: Target,
  baseball: Gamepad2,
  'motor-sports': Car,
  fighting: Trophy,
};

export default function Sports() {
  const [, setLocation] = useLocation();

  const { data: sports = [], isLoading } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: () => api.getSports(),
    enabled: true,
  });

  const handleSportClick = (sport: Sport) => {
    setLocation(`/?sport=${sport.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-48 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glassmorphism border-border">
                <CardHeader>
                  <div className="skeleton h-8 w-8 rounded mb-2"></div>
                  <div className="skeleton h-6 w-24 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="skeleton h-4 w-full rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sports Categories</h1>
          <p className="text-muted-foreground">Browse all available sports and competitions</p>
        </div>

        {sports.length === 0 ? (
          <Card className="glassmorphism border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No sports categories available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport: Sport) => {
              const Icon = sportIcons[sport.id] || Trophy;
              
              return (
                <Card 
                  key={sport.id}
                  className="glassmorphism border-border hover:bg-primary/10 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleSportClick(sport)}
                  data-testid={`sport-card-${sport.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary/80" />
                      <div>
                        <CardTitle className="text-foreground group-hover:text-primary">
                          {sport.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      View all {sport.name.toLowerCase()} matches and competitions
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
