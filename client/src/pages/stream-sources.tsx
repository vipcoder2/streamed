import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Match } from '@/types/api';
import Navbar from '@/components/navbar';
import { StreamSources } from '@/components/stream-sources';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SubscriptionGuard from '@/components/subscription-guard';

export default function StreamSourcesPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/match/:id/streams');

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['/api/matches/all'],
    queryFn: () => api.getAllMatches(),
    enabled: !!params?.id,
  });

  // Find the specific match
  const currentMatch = matches.find((m: Match) => m.id === params?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar hideSearchOnMobile />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-32 rounded mb-6"></div>
          <div className="skeleton h-96 rounded-lg"></div>
        </main>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen">
        <Navbar hideSearchOnMobile />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="glassmorphism border-border">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">Match Not Found</h2>
              <p className="text-muted-foreground">The requested match could not be found.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <SubscriptionGuard>
      <div>
        <Navbar hideSearchOnMobile />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StreamSources match={currentMatch} />
        </main>
      </div>
    </SubscriptionGuard>
  );
}