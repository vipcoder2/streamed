
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { Match, Stream } from '@/types/api';
import Navbar from '@/components/navbar';
import { Chat } from '@/components/chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Languages, Monitor, Users, MessageCircle, Tv } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SubscriptionGuard from '@/components/subscription-guard';

export default function StreamPlayerPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/stream/:matchId/:source/:streamNo');
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  // Always call these hooks in the same order
  const { data: sports = [] } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: () => api.getSports(),
  });

  const { data: allMatches = [], isLoading: matchLoading } = useQuery({
    queryKey: ['/api/matches/all'],
    queryFn: async () => {
      const allSportsMatches = await Promise.all(
        sports.map(sport => api.getMatches(sport.id).catch(() => []))
      );
      return allSportsMatches.flat();
    },
    enabled: sports.length > 0,
  });

  // Use useEffect to set the current match instead of finding it in render
  useEffect(() => {
    if (allMatches.length > 0 && params?.matchId) {
      const match = allMatches.find((m: Match) => m.id === params.matchId);
      setCurrentMatch(match || null);
    }
  }, [allMatches, params?.matchId]);

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['/api/stream', params?.source, params?.matchId],
    queryFn: async () => {
      if (!params?.source || !currentMatch) return [];

      const matchSource = currentMatch.sources.find(s => s.source === params.source);
      if (!matchSource) {
        console.log('No matching source found for:', params.source, 'in sources:', currentMatch.sources);
        return [];
      }

      try {
        const result = await api.getStream(params.source, matchSource.id);
        console.log('Stream API result:', result);
        return result || [];
      } catch (error) {
        console.error('Error fetching streams:', error);
        return [];
      }
    },
    enabled: Boolean(params?.source && params?.matchId && currentMatch),
  });

  const currentStream = streams.find((s: Stream) => s.streamNo.toString() === params?.streamNo?.toString());

  const parseTeams = (title: string) => {
    const parts = title.split(' vs ');
    if (parts.length === 2) {
      return { home: parts[0].trim(), away: parts[1].trim() };
    }
    return { home: title, away: '' };
  };

  // SEO optimization for stream player
  useEffect(() => {
    if (currentMatch) {
      const teams = parseTeams(currentMatch.title);
      const title = teams.away 
        ? `Live Stream: ${teams.home} vs ${teams.away} - Free Sports Streaming`
        : `Live Stream: ${currentMatch.title} - Free Sports Streaming`;
      
      document.title = title;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        const description = teams.away
          ? `Watch ${teams.home} vs ${teams.away} live stream online for free. HD quality sports streaming with real-time chat. Multiple streaming sources available.`
          : `Watch ${currentMatch.title} live stream online for free. HD quality sports streaming with real-time chat.`;
        metaDescription.setAttribute('content', description);
      }

      // Structured data for live stream
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": teams.away ? `${teams.home} vs ${teams.away} Live Stream` : `${currentMatch.title} Live Stream`,
        "description": `Live sports streaming of ${currentMatch.title}`,
        "url": `https://streamed.pk/stream/${params?.matchId}/${params?.source}/${params?.streamNo}`,
        "thumbnailUrl": `https://streamed.pk/api/images/proxy/${currentMatch.poster}.webp`,
        "uploadDate": new Date().toISOString(),
        "duration": "PT3H",
        "isLiveBroadcast": true,
        "embedUrl": currentStream?.embedUrl
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      script.id = 'stream-structured-data';
      document.head.appendChild(script);

      return () => {
        const existingScript = document.getElementById('stream-structured-data');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [currentMatch, currentStream, params]);

  if (matchLoading || streamsLoading) {
    return (
      <div className="min-h-screen bg-[#011412]">
        <Navbar hideSearchOnMobile />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="skeleton h-8 w-32 rounded mb-6"></div>
          <div className="skeleton aspect-video rounded-lg mb-6"></div>
          <div className="skeleton h-32 rounded-lg"></div>
        </main>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen bg-[#011412]">
        <Navbar hideSearchOnMobile />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-6"
            data-testid="back-button"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Alert className="glassmorphism border-destructive">
            <AlertDescription>
              Match not found.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (!currentStream) {
    return (
      <div className="min-h-screen bg-[#011412]">
        <Navbar hideSearchOnMobile />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/match/${params?.matchId}/streams`)}
            className="mb-6"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stream Sources
          </Button>

          <Alert className="glassmorphism border-destructive">
            <AlertDescription>
              Stream not found or no longer available. Available streams: {streams.length}
              <br />
              Looking for streamNo: {params?.streamNo}
              <br />
              Available streamNos: {streams.map(s => s.streamNo).join(', ')}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const teams = parseTeams(currentMatch.title);

  const handleFullscreen = () => {
    const iframe = document.getElementById('stream-iframe') as HTMLIFrameElement;
    const container = iframe?.parentElement;

    if (!iframe || !container) return;

    try {
      // Try to request fullscreen on the container div
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        // Safari
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        // Firefox
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        // IE/Edge
        (container as any).msRequestFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen not supported or failed:', error);
      // Fallback: try to maximize the iframe size
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.zIndex = '9999';
      iframe.style.backgroundColor = 'black';

      // Add click handler to exit fullscreen
      const exitHandler = (e: MouseEvent) => {
        if (e.target === iframe) return;
        iframe.style.position = '';
        iframe.style.top = '';
        iframe.style.left = '';
        iframe.style.width = '';
        iframe.style.height = '';
        iframe.style.zIndex = '';
        iframe.style.backgroundColor = '';
        document.removeEventListener('click', exitHandler);
      };

      setTimeout(() => {
        document.addEventListener('click', exitHandler);
      }, 100);
    }
  };

  return (
    <SubscriptionGuard>
      <div className="bg-[#011412] min-h-screen">
        <Navbar hideSearchOnMobile />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2 px-2">
            Live {teams.away ? `${teams.home} vs ${teams.away}` : currentMatch.title}
            <span className="hidden sm:inline"> Stream {params?.source} {currentStream.streamNo}</span>
          </h1>
          <p className="text-sm text-muted-foreground px-4 sm:px-0">
            {teams.away ? `${teams.home} vs ${teams.away}` : currentMatch.title} live on Streamed.
            <span className="hidden sm:inline"> Join the stream and chat with others in our live chat!</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Stream Player */}
          <div className="lg:col-span-3">
            <Card className="glassmorphism border-border">
              <CardContent className="p-0">
                <div className="relative group">
                  <iframe
                    id="stream-iframe"
                    src={currentStream.embedUrl}
                    className="w-full aspect-video rounded-lg"
                    allowFullScreen
                    allow="autoplay; fullscreen; encrypted-media"
                    data-testid="stream-iframe"
                  />

                  {/* Custom Fullscreen Button */}
                  <button
                    onClick={handleFullscreen}
                    className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity duration-200 z-10"
                    title="Enter Fullscreen"
                    aria-label="Enter fullscreen mode"
                    data-testid="fullscreen-button"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Stream Info */}
            <Card className="glassmorphism border-border mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <span>Stream Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="grid grid-cols-2 gap-3 sm:space-y-3 sm:grid-cols-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {params?.source}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quality</span>
                    <Badge variant={currentStream.hd ? "destructive" : "secondary"} className="text-xs">
                      {currentStream.hd ? 'HD' : 'SD'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <div className="flex items-center space-x-1">
                      <Languages className="h-3 w-3" />
                      <span className="text-sm">{currentStream.language}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stream</span>
                    <span className="text-sm">#{currentStream.streamNo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Streams - Desktop (moved below player) */}
            <Card className="glassmorphism border-border mt-4 hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center space-x-2">
                  <Tv className="h-4 w-4" />
                  <span>Available Streams</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {streams.length} sources available
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize text-primary truncate">
                        {params?.source}
                      </span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {streams.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {streams.slice(0, 6).map((stream: Stream) => (
                        <Button
                          key={stream.streamNo}
                          variant={stream.streamNo === currentStream.streamNo ? "default" : "ghost"}
                          size="sm"
                          className="justify-between text-xs h-8"
                          onClick={() => setLocation(`/stream/${params?.matchId}/${params?.source}/${stream.streamNo}`)}
                          data-testid={`stream-option-${stream.streamNo}`}
                        >
                          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                            <Badge
                              variant={stream.hd ? "destructive" : "secondary"}
                              className="text-xs px-1 flex-shrink-0"
                            >
                              {stream.hd ? 'HD' : 'SD'}
                            </Badge>
                            <span className="truncate">#{stream.streamNo}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {stream.language}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Tabs (Available Streams & Chat) */}
            <div className="mt-4 lg:hidden">
              <Tabs defaultValue="streams" className="w-full">
                <TabsList className="grid w-full grid-cols-2 glassmorphism">
                  <TabsTrigger value="streams" className="flex items-center space-x-2">
                    <Tv className="h-4 w-4" />
                    <span>Streams</span>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="streams" className="mt-4">
                  <Card className="glassmorphism border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Tv className="h-4 w-4" />
                        <span>Available Streams</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {streams.length} sources available
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 md:tablet-grid lg:space-y-2 lg:block">
                        {streams.slice(0, 6).map((stream: Stream) => (
                          <Button
                            key={stream.streamNo}
                            variant={stream.streamNo === currentStream.streamNo ? "default" : "outline"}
                            className="w-full justify-between glassmorphism border-border hover:bg-primary/10 h-auto py-2"
                            onClick={() => setLocation(`/stream/${params?.matchId}/${params?.source}/${stream.streamNo}`)}
                            data-testid={`stream-option-${stream.streamNo}`}
                          >
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <Badge
                                variant={stream.hd ? "destructive" : "secondary"}
                                className="text-xs px-1.5 py-0.5 flex-shrink-0"
                              >
                                {stream.hd ? 'HD' : 'SD'}
                              </Badge>
                              <span className="text-sm font-medium truncate">
                                Stream {stream.streamNo}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <Languages className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground">
                                {stream.language}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="chat" className="mt-4">
                  <Chat matchId={params?.matchId || ''} className="h-[70vh] min-h-[500px]" />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Desktop Sidebar - Chat Only */}
          <div className="hidden lg:block">
            <Chat matchId={params?.matchId || ''} className="h-[700px]" />

            {/* Back to Sources */}
            <Button
              variant="outline"
              className="w-full glassmorphism text-sm mt-4"
              onClick={() => setLocation(`/match/${params?.matchId}/streams`)}
              data-testid="back-to-sources"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Sources
            </Button>
          </div>
        </div>
      </main>
      </div>
    </SubscriptionGuard>
  );
}
