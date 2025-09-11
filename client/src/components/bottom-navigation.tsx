
import { Home, Calendar, Star } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Favorites', href: '/favorites', icon: Star },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <button
              key={item.name}
              onClick={() => setLocation(item.href)}
              className={cn(
                "flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors duration-200",
                active 
                  ? "text-accent" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", active && "text-accent")} />
              <span className="text-[10px]">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
