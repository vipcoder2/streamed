import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Stream } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Play } from 'lucide-react';

interface StreamPlayerProps {
  matchId: string;
  source: string;
}

export function StreamPlayer({ matchId, source }: StreamPlayerProps) {
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: streams = [], isLoading, error } = useQuery({
    queryKey: ['/api/stream', source, matchId],
    queryFn: () => api.getStream(source, matchId),
    enabled: !!matchId && !!source,
  });

  useEffect(() => {
    if (streams.length > 0 && !selectedStream) {
      // Select the first available stream
      setSelectedStream(streams[0]);
    }
  }, [streams, selectedStream]);

  if (isLoading) {
    return (
      <div className="glassmorphism p-8 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading stream...</span>
        </div>
      </div>
    );
  }

  if (error || streams.length === 0) {
    return (
      <Alert className="glassmorphism border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error 
            ? 'Failed to load streams. Please try again later.' 
            : 'No streams available for this match.'}
        </AlertDescription>
      </Alert>
    );
  }

  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (!document.fullscreenElement) {
        // For mobile devices, try different approaches
        if (isMobile) {
          // Try to enter fullscreen on the iframe container first
          const container = iframe.parentElement;
          if (container) {
            if (container.requestFullscreen) {
              container.requestFullscreen().catch(() => {
                // Fallback to iframe fullscreen
                tryIframeFullscreen(iframe);
              });
            } else {
              tryIframeFullscreen(iframe);
            }
          } else {
            tryIframeFullscreen(iframe);
          }
        } else {
          // Desktop behavior
          tryIframeFullscreen(iframe);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      // Fallback: try to make iframe cover the viewport
      if (iframe) {
        toggleMobileFullscreen(iframe);
      }
    }
  };

  const tryIframeFullscreen = (iframe: HTMLIFrameElement) => {
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if ((iframe as any).webkitRequestFullscreen) {
      (iframe as any).webkitRequestFullscreen();
    } else if ((iframe as any).webkitEnterFullscreen) {
      // iOS Safari specific
      (iframe as any).webkitEnterFullscreen();
    } else if ((iframe as any).mozRequestFullScreen) {
      (iframe as any).mozRequestFullScreen();
    } else if ((iframe as any).msRequestFullscreen) {
      (iframe as any).msRequestFullscreen();
    } else {
      // Last resort: CSS-based fullscreen
      toggleMobileFullscreen(iframe);
    }
  };

  const toggleMobileFullscreen = (iframe: HTMLIFrameElement) => {
    const isCurrentlyFullscreen = iframe.classList.contains('mobile-fullscreen');

    if (!isCurrentlyFullscreen) {
      // Enter mobile fullscreen
      iframe.classList.add('mobile-fullscreen');
      document.body.style.overflow = 'hidden';

      // Add CSS for mobile fullscreen
      const style = document.createElement('style');
      style.id = 'mobile-fullscreen-style';
      style.textContent = `
        .mobile-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background: black !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      // Exit mobile fullscreen
      iframe.classList.remove('mobile-fullscreen');
      document.body.style.overflow = '';

      // Remove CSS
      const style = document.getElementById('mobile-fullscreen-style');
      if (style) {
        style.remove();
      }
    }
  };


  const renderPlayer = () => {
    if (!selectedStream) return null;

    return (
      <div className="relative">
        <iframe
          ref={iframeRef}
          src={selectedStream.embedUrl}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
          onError={() => setPlayerError('Failed to load stream')}
          data-testid="stream-iframe"
        />
        {/* Custom Fullscreen Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 text-white bg-black bg-opacity-50 rounded-full p-2"
          onClick={handleFullscreen}
          aria-label="Toggle fullscreen"
        >
          <Play className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  return (
    <div className="glassmorphism p-6 rounded-lg">
      {/* Stream Quality Selector */}
      {streams.length > 1 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Stream Quality</h4>
          <div className="flex space-x-2">
            {streams.map((stream, index) => (
              <Button
                key={index}
                variant={selectedStream?.id === stream.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStream(stream)}
                data-testid={`stream-quality-${stream.hd ? 'hd' : 'sd'}`}
              >
                {stream.hd ? 'HD' : 'SD'} - {stream.source}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Player Error */}
      {playerError && (
        <Alert className="mb-4 border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{playerError}</AlertDescription>
        </Alert>
      )}

      {/* Video Player */}
      {renderPlayer()}

      {/* Stream Info */}
      {selectedStream && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Source: {selectedStream.source} | Quality: {selectedStream.hd ? 'HD' : 'SD'} | Language: {selectedStream.language}</p>
        </div>
      )}
    </div>
  );
}