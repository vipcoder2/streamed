
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Match, Sport } from '@/types/api';
import Navbar from '@/components/navbar';
import { MatchSection } from '@/components/match-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function SportDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/sport/:sportId');

  const { data: sports = [] } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: () => api.getSports(),
  });

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['/api/matches', params?.sportId],
    queryFn: () => api.getMatches(params?.sportId!),
    enabled: !!params?.sportId,
  });

  const currentSport = sports.find((s: Sport) => s.id === params?.sportId);

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-32 rounded mb-6"></div>
          <div className="skeleton h-96 rounded-lg"></div>
        </main>
      </div>
    );
  }

  if (!currentSport) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <Card className="glassmorphism border-border">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">Sport Not Found</h2>
              <p className="text-muted-foreground">The requested sport could not be found.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
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
          <h1 className="text-3xl font-bold text-foreground mb-2">{currentSport.name}</h1>
          <p className="text-muted-foreground">All {currentSport.name.toLowerCase()} matches and events</p>
        </div>

        <MatchSection
          title={`${currentSport.name} Events`}
          matches={matches}
          isLoading={isLoading}
          onMatchClick={handleMatchClick}
        />
      </main>
    </div>
  );
}
