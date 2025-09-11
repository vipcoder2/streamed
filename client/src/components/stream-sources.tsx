import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Match, Stream, MatchSource } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  Languages,
  Tv,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StreamSourcesProps {
  match: Match;
}

interface SourceStreams {
  source: string;
  sourceId: string;
  streams: Stream[];
  error?: string;
}

export function StreamSources({ match }: StreamSourcesProps) {
  const [, setLocation] = useLocation();
  const [sourceStreams, setSourceStreams] = useState<SourceStreams[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const fetchAllStreams = async () => {
      setLoading(true);
      console.log(
        "Fetching streams for match:",
        match.id,
        "with sources:",
        match.sources,
      );

      const promises = match.sources.map(async (source: MatchSource) => {
        try {
          console.log(
            `Fetching streams for source: ${source.source}, id: ${source.id}`,
          );
          const streams = await api.getStream(source.source, source.id);
          console.log(
            `Got ${streams?.length || 0} streams for ${source.source}`,
          );
          return {
            source: source.source,
            sourceId: source.id,
            streams: streams || [],
          };
        } catch (error) {
          console.error(`Error fetching streams for ${source.source}:`, error);
          return {
            source: source.source,
            sourceId: source.id,
            streams: [],
            error: "Failed to load streams",
          };
        }
      });

      const results = await Promise.all(promises);
      console.log("All stream results:", results);
      setSourceStreams(results);
      setLoading(false);
    };

    if (match.sources && match.sources.length > 0) {
      fetchAllStreams();
    } else {
      console.log("No sources available for match:", match.id);
      setLoading(false);
    }
  }, [match.sources]);

  const parseTeams = (title: string) => {
    const parts = title.split(" vs ");
    if (parts.length === 2) {
      return { home: parts[0].trim(), away: parts[1].trim() };
    }
    return { home: title, away: "" };
  };

  const teams = parseTeams(match.title);
  const totalStreams = sourceStreams.reduce(
    (total, source) => total + source.streams.length,
    0,
  );

  const handleStreamClick = (source: SourceStreams, stream: Stream) => {
    setLocation(`/stream/${match.id}/${source.source}/${stream.streamNo}`);
  };

  const getSourceDescription = (source: string) => {
    const descriptions: { [key: string]: string } = {
      alpha: "Most reliable (720p 30fps)",
      bravo: "Good backup (poor quality occasionally)",
      charlie: "Standard quality",
      delta: "HD Quality",
      echo: "Various quality",
    };
    return descriptions[source] || "Various quality";
  };

  const toggleSourceExpanded = (source: string) => {
    const newExpanded = new Set(expandedSources);
    if (newExpanded.has(source)) {
      newExpanded.delete(source);
    } else {
      newExpanded.add(source);
    }
    setExpandedSources(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen px-3 sm:px-4 py-4">
        {/* Mobile Header */}
        <div className="text-center mb-6">
          <div className="skeleton h-6 sm:h-8 w-3/4 mx-auto rounded mb-3"></div>
          <div className="skeleton h-4 w-24 mx-auto rounded mb-4"></div>
          <div className="skeleton h-3 w-full max-w-md mx-auto rounded"></div>
        </div>

        <div className="skeleton h-8 w-20 rounded mb-4"></div>
        <div className="skeleton h-4 w-48 rounded mb-6"></div>
        <div className="skeleton h-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 max-w-4xl mx-auto">
      {/* Mobile-Optimized Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
          Live {teams.away ? `${teams.home} vs ${teams.away}` : match.title}
        </h1>
        <h2 className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4">
          Stream Links
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
          To watch {teams.away ? `${teams.home} vs ${teams.away}` : match.title}{" "}
          streams, scroll down and choose a stream link of your choice. If there
          is no links or buttons, please wait for the timer to countdown until
          the event is live.
        </p>
      </div>

      {/* Compact Back Button */}
      <Button
        variant="ghost"
        onClick={() => setLocation(`/match/${match.id}`)}
        className="mb-4 sm:mb-6 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        data-testid="back-button"
      >
        <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Back</span>
        <span className="sm:hidden">BCK</span>
      </Button>

      {/* Compact Summary */}
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Showing top quality sources • {sourceStreams.length} of{" "}
          {match.sources.length} sources
        </p>
      </div>

      {/* Stream Sources */}
      {sourceStreams.length === 0 ? (
        <Alert className="glassmorphism border-border">
          <AlertDescription className="text-sm">
            No stream sources available for this match. Please check back later.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sourceStreams.map((source) => (
            <Card key={source.source} className="glassmorphism border-border">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-lg capitalize text-primary truncate">
                      {source.source}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5 hidden sm:inline-flex"
                    >
                      ⚡ {getSourceDescription(source.source)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {source.streams.length} stream
                      {source.streams.length !== 1 ? "s" : ""}
                    </Badge>
                    {source.streams.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleSourceExpanded(source.source)}
                      >
                        {expandedSources.has(source.source) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {/* Mobile quality badge */}
                <div className="sm:hidden">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    ⚡ {getSourceDescription(source.source)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {source.error ? (
                  <Alert className="border-destructive">
                    <AlertDescription className="text-sm">
                      {source.error}
                    </AlertDescription>
                  </Alert>
                ) : source.streams.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No streams available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {source.streams
                      .slice(
                        0,
                        expandedSources.has(source.source) ? undefined : 3,
                      )
                      .map((stream) => (
                        <Button
                          key={stream.streamNo}
                          variant="outline"
                          className="w-full justify-between glassmorphism border-border h-auto py-2 sm:py-3"
                          onClick={() => handleStreamClick(source, stream)}
                          data-testid={`stream-${source.source}-${stream.streamNo}`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <Badge
                                variant={
                                  stream.hd ? "destructive" : "secondary"
                                }
                                className="text-xs px-1.5 py-0.5 flex-shrink-0"
                              >
                                {stream.hd ? "HD" : "SD"}
                              </Badge>
                              <span className="text-xs sm:text-sm font-medium truncate">
                                Stream {stream.streamNo}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <div className="hidden sm:flex items-center space-x-1">
                              <Languages className="h-3 w-3" />
                              <span className="text-xs">{stream.language}</span>
                            </div>
                            <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                        </Button>
                      ))}

                    {/* Show more streams button for mobile */}
                    {source.streams.length > 6 &&
                      !expandedSources.has(source.source) && (
                        <Button
                          variant="ghost"
                          className="w-full text-xs text-muted-foreground h-8"
                          onClick={() => toggleSourceExpanded(source.source)}
                        >
                          Show {source.streams.length - 6} more streams
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
