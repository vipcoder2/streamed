import { Sport, Match, Stream } from '@/types/api';

const API_BASE = '/api';

class StreamedAPI {
  private async fetchAPI<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      
      if (!response.ok) {
        console.warn(`API Warning for ${endpoint}: HTTP ${response.status} - ${response.statusText}`);
        return [] as T; // Return empty array for failed requests
      }
      
      const data = await response.json();
      console.log(`API Success for ${endpoint}:`, Array.isArray(data) ? `${data.length} items` : 'data received');
      return data || [] as T;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return [] as T; // Return empty array instead of throwing
    }
  }

  async getSports(): Promise<Sport[]> {
    return this.fetchAPI<Sport[]>('/sports');
  }

  async getMatches(sport: string): Promise<Match[]> {
    return this.fetchAPI<Match[]>(`/matches/${sport}`);
  }

  // Sport-specific matches
  async getBasketballMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/basketball');
  }

  async getFootballMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/football');
  }

  async getAmericanFootballMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/american-football');
  }

  async getBoxingMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/fight');
  }

  async getTennisMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/tennis');
  }

  async getCricketMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/cricket');
  }

  async getGolfMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/golf');
  }

  async getMotorsportsMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/motor-sports');
  }

  // All matches
  async getAllMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/all');
  }

  async getAllPopularMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/all/popular');
  }

  // Today's matches
  async getAllTodayMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/all-today');
  }

  async getPopularTodayMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/all-today/popular');
  }

  // Live matches
  async getLiveMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/live');
  }

  async getPopularLiveMatches(): Promise<Match[]> {
    return this.fetchAPI<Match[]>('/matches/live/popular');
  }

  async getPopularMatches(sport: string): Promise<Match[]> {
    return this.fetchAPI<Match[]>(`/matches/${sport}/popular`);
  }

  async getStream(source: string, id: string): Promise<Stream[]> {
    return this.fetchAPI<Stream[]>(`/stream/${source}/${id}`);
  }

  async getTeamImage(teamOrEvent: string): Promise<string> {
    return `/api/images/badge/${teamOrEvent}.webp`;
  }

  async getPosterImage(badge1: string, badge2: string): Promise<string> {
    return `/api/images/poster/${badge1}/${badge2}.webp`;
  }

  async getProxyImage(poster: string): Promise<string> {
    return `/api/images/proxy/${poster}.webp`;
  }

  async checkStatus(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE}/sports`);
      return {
        status: response.ok ? 'online' : 'offline',
        timestamp: new Date().toISOString()
      };
    } catch {
      return {
        status: 'offline',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const api = new StreamedAPI();
