
import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TELEGRAM_BANNER_KEY = 'telegram_banner_shown';
const TELEGRAM_CHANNEL_URL = 'https://t.me/+Zo7CoigxqRczMjRk';

export function TelegramBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkShouldShow = () => {
      const stored = localStorage.getItem(TELEGRAM_BANNER_KEY);
      const today = new Date().toDateString();
      
      if (!stored) {
        // First time - show banner
        setIsVisible(true);
        localStorage.setItem(TELEGRAM_BANNER_KEY, JSON.stringify({
          date: today,
          count: 1
        }));
      } else {
        try {
          const data = JSON.parse(stored);
          if (data.date !== today) {
            // New day - reset count and show banner
            setIsVisible(true);
            localStorage.setItem(TELEGRAM_BANNER_KEY, JSON.stringify({
              date: today,
              count: 1
            }));
          } else if (data.count < 2) {
            // Same day, but less than 2 times shown
            setIsVisible(true);
            localStorage.setItem(TELEGRAM_BANNER_KEY, JSON.stringify({
              date: today,
              count: data.count + 1
            }));
          }
        } catch (error) {
          // Invalid stored data - reset
          setIsVisible(true);
          localStorage.setItem(TELEGRAM_BANNER_KEY, JSON.stringify({
            date: today,
            count: 1
          }));
        }
      }
    };

    // Show banner after a short delay when component mounts
    const timer = setTimeout(checkShouldShow, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleJoinChannel = () => {
    window.open(TELEGRAM_CHANNEL_URL, '_blank');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-sm w-full mx-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="relative p-6 text-center">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">
            Join Our Telegram!
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            Get instant updates on live matches, exclusive streams, and never miss your favorite sports events!
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={handleJoinChannel}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Join Channel
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
