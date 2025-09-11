
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { MatchSection } from '@/components/match-section';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CricketSchedule() {
  const [, setLocation] = useLocation();

  const { data: cricketMatches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/cricket'],
    queryFn: () => api.getCricketMatches(),
    enabled: true,
  });

  const handleMatchClick = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
  };

  return (
    <div>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Cricket Schedule</h1>
          <p className="text-muted-foreground">All cricket matches and tournaments</p>
        </div>

        <MatchSection
          title="All Cricket Events"
          matches={cricketMatches}
          isLoading={isLoading}
          onMatchClick={handleMatchClick}
        />
      </main>
    </div>
  );
}
