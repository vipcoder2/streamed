export interface Sport {
  id: string;
  name: string;
}

export interface MatchSource {
  source: string;
  id: string;
}

export interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  popular: boolean;
  sources: MatchSource[];
  poster?: string;
  teams?: {
    home?: { 
      badge?: string;
      name?: string;
    };
    away?: { 
      badge?: string;
      name?: string;
    };
  };
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
