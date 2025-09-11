
import { useState, useEffect } from 'react';
import { Match } from '@/types/api';

const FAVORITES_KEY = 'streamed_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        setFavorites([]);
      }
    }
  }, []);

  const addFavorite = (matchId: string) => {
    const newFavorites = [...favorites, matchId];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const removeFavorite = (matchId: string) => {
    const newFavorites = favorites.filter(id => id !== matchId);
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const toggleFavorite = (matchId: string) => {
    if (favorites.includes(matchId)) {
      removeFavorite(matchId);
    } else {
      addFavorite(matchId);
    }
  };

  const isFavorite = (matchId: string) => favorites.includes(matchId);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
