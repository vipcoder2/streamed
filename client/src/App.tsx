import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Schedule from '@/pages/schedule';
import Sports from "@/pages/sports";
import Status from "@/pages/status";
import MatchDetail from "@/pages/match-detail";
import StreamSourcesPage from "@/pages/stream-sources";
import StreamPlayerPage from "@/pages/stream-player";
import SportDetail from '@/pages/sport-detail';
import Favorites from '@/pages/favorites';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import PricingPage from '@/pages/pricing';
import DashboardPage from '@/pages/dashboard';
import SuccessPage from '@/pages/success';
import CancelPage from '@/pages/cancel';
import { Footer } from '@/components/footer';
import { BottomNavigation } from '@/components/bottom-navigation';
import BasketballSchedule from '@/pages/basketball-schedule';
import FootballSchedule from '@/pages/football-schedule';
import AmericanFootballSchedule from '@/pages/american-football-schedule';
import BoxingSchedule from '@/pages/boxing-schedule';
import TennisSchedule from '@/pages/tennis-schedule';
import CricketSchedule from '@/pages/cricket-schedule';
import GolfSchedule from '@/pages/golf-schedule';
import MotorsportsSchedule from '@/pages/motorsports-schedule';
import { useEffect } from 'react';
import { isSocialMediaWebview, isBot } from '@/utils/webview-detection';
import { AuthProvider } from '@/contexts/AuthContext';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Schedule} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/sports" component={Sports} />
      <Route path="/sport/:sportId" component={SportDetail} />
      <Route path="/schedule/basketball" component={BasketballSchedule} />
      <Route path="/schedule/football" component={FootballSchedule} />
      <Route path="/schedule/american-football" component={AmericanFootballSchedule} />
      <Route path="/schedule/boxing" component={BoxingSchedule} />
      <Route path="/schedule/tennis" component={TennisSchedule} />
      <Route path="/schedule/cricket" component={CricketSchedule} />
      <Route path="/schedule/golf" component={GolfSchedule} />
      <Route path="/schedule/motorsports" component={MotorsportsSchedule} />
      <Route path="/match/:id" component={MatchDetail} />
      <Route path="/match/:id/streams" component={StreamSourcesPage} />
      <Route path="/stream/:matchId/:source/:streamNo" component={StreamPlayerPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/success" component={SuccessPage} />
      <Route path="/cancel" component={CancelPage} />
      <Route path="/status" component={Status} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Skip right-click protection in social media webviews and for bots
    const isInWebview = isSocialMediaWebview() || isBot();
    
    if (isInWebview) {
      return;
    }

    const handleRightClick = (e: MouseEvent) => {
      // Prevent the default context menu
      e.preventDefault();
      e.stopPropagation();
      
      // Reload and redirect to homepage
      window.location.href = '/';
      return false;
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 2) { // Right mouse button
        handleRightClick(e);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 - Developer Tools
      if (e.key === 'F12') {
        e.preventDefault();
        window.location.href = '/';
        return false;
      }
      
      // Ctrl+Shift+I - Developer Tools
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        window.location.href = '/';
        return false;
      }
      
      // Ctrl+Shift+J - Console
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        window.location.href = '/';
        return false;
      }
      
      // Ctrl+U - View Source
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        window.location.href = '/';
        return false;
      }
      
      // Ctrl+Shift+C - Element Inspector
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        window.location.href = '/';
        return false;
      }
    };

    // Disable right-click context menu
    document.addEventListener('contextmenu', handleRightClick, { passive: false });
    
    // Additional protection for different context menu triggers
    document.addEventListener('auxclick', handleAuxClick, { passive: false });

    // Disable drag and drop to prevent context menu on images
    document.addEventListener('dragstart', handleContextMenu, { passive: false });

    // Disable selection context menu
    document.addEventListener('selectstart', handleContextMenu, { passive: false });

    // Keyboard shortcuts protection (Ctrl+Shift+I, F12, etc.)
    document.addEventListener('keydown', handleKeyDown, { passive: false });

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('auxclick', handleAuxClick);
      document.removeEventListener('dragstart', handleContextMenu);
      document.removeEventListener('selectstart', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="dark min-h-screen flex flex-col" style={{background: '#011412'}}>
            <div className="flex-1">
              <Router />
            </div>
            <Footer />
            <BottomNavigation />
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;