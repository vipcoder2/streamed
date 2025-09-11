import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  User,
  Menu,
  X,
  Play,
  Home,
  Calendar,
  Trophy,
  Activity,
  CreditCard,
  Settings,
  LogOut,
  Crown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Match } from "@/types/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  hideSearchOnDesktop?: boolean;
  hideSearchOnMobile?: boolean;
}

function Navbar({
  hideSearchOnDesktop = false,
  hideSearchOnMobile = false,
}: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Added for the search input logic

  // Fetch matches for search
  const { data: allMatches = [] } = useQuery({
    queryKey: ["/api/matches", "football"],
    queryFn: () => api.getMatches("football"),
    enabled: searchQuery.length > 0,
  });

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Schedule", href: "/schedule" },
    { name: "Favorites", href: "/favorites" },
    ...(user ? [
      { name: "Pricing", href: "/pricing" },
      { name: "Dashboard", href: "/dashboard" },
    ] : []),
  ];

  const isActive = (href: string) => location === href;

  // Filter matches based on search query
  const filteredMatches = allMatches
    .filter(
      (match: Match) =>
        match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && filteredMatches.length > 0) {
      setLocation(`/match/${filteredMatches[0].id}?source=streamed`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleMatchSelect = (match: Match) => {
    setLocation(`/match/${match.id}?source=streamed`);
    setSearchQuery("");
    setShowSearchResults(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Added handleKeyDown for the search input on desktop
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() && filteredMatches.length > 0) {
      setLocation(`/match/${filteredMatches[0].id}?source=streamed`);
      setSearchTerm("");
      setShowSearchResults(false);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && filteredMatches.length > 0) {
      setLocation(`/match/${filteredMatches[0].id}?source=streamed`);
      setSearchQuery("");
      setShowSearchResults(false);
      setIsMobileMenuOpen(false); // Close mobile menu after search
    }
  };

  return (
    <nav className="glassmorphism sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" data-testid="logo-link" aria-label="Go to StreamSport homepage">
            <img
              src="https://i.ibb.co/ccFFsMZc/logo11.png"
              alt="StreamSport - Free Live Sports Streaming"
              className="h-6 sm:h-7 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-white"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  title={`Go to ${item.name} page - ${item.name}`}
                  aria-label={`Navigate to ${item.name} page`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search and Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="bg-muted border-border w-64 pr-10"
                  data-testid="search-input"
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
                  onFocus={() =>
                    searchQuery.length > 0 && setShowSearchResults(true)
                  }
                  title="Search for live sports matches"
                  aria-label="Search for live sports matches"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && filteredMatches.length > 0 && (
                <div className="hidden lg:block absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {filteredMatches.map((match: Match) => (
                    <div
                      key={match.id}
                      onClick={() => handleMatchSelect(match)}
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      title={`${match.title} - ${match.category} live stream`}
                      aria-label={`View details for ${match.title} in ${match.category}`}
                    >
                      <div className="text-sm font-medium text-foreground truncate">
                        {match.title}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {match.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden lg:flex text-muted-foreground hover:text-foreground"
                    title={`Welcome ${user.username || user.email}`}
                    aria-label="User account menu"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {user.username || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="hidden lg:block glassmorphism border-border"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="flex items-center">
                      <Crown className="mr-2 h-4 w-4" />
                      Pricing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/login')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setLocation('/register')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Sign Up
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden lg:flex text-muted-foreground hover:text-foreground"
                  title="Explore sports categories - Football, Basketball, Cricket and more"
                  aria-label="Explore sports categories"
                >
                  Sports
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="hidden lg:block glassmorphism border-border"
              >
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center" title="StreamSport - Free Live Sports Streaming Home" aria-label="Go to StreamSport homepage - Free live sports streaming">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule" className="flex items-center" title="Sports Schedule - Live & Upcoming Matches" aria-label="View sports schedule with live and upcoming matches">
                    <Calendar className="mr-2 h-4 w-4" />
                    All Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sports" className="flex items-center" title="All Sports Categories - Football, Basketball, Cricket & More" aria-label="Browse all sports categories including football, basketball, cricket">
                    <Trophy className="mr-2 h-4 w-4" />
                    Sports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/schedule/basketball" className="flex items-center" title="Basketball Live Streams and Schedule" aria-label="View basketball live streams and schedule">
                    Basketball Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule/football" className="flex items-center" title="Football Live Streams and Schedule" aria-label="View football live streams and schedule">
                    Football Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/schedule/american-football"
                    className="flex items-center"
                    title="NFL Live Streams and Schedule"
                    aria-label="View NFL live streams and schedule"
                  >
                    NFL Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule/boxing" className="flex items-center" title="Boxing Live Streams and Schedule" aria-label="View boxing live streams and schedule">
                    Fighting Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule/tennis" className="flex items-center" title="Tennis Live Streams and Schedule" aria-label="View tennis live streams and schedule">
                    Tennis Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule/cricket" className="flex items-center" title="Cricket Live Streams and Schedule" aria-label="View cricket live streams and schedule">
                    Cricket Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule/golf" className="flex items-center" title="Golf Live Streams and Schedule" aria-label="View golf live streams and schedule">
                    Golf Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/schedule/motorsports" className="flex items-center" title="Motorsports Live Streams and Schedule" aria-label="View motorsports live streams and schedule">
                    Motorsports Schedule
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/status" className="flex items-center" title="Check Live Stream Status" aria-label="Check live stream status">
                    <Activity className="mr-2 h-4 w-4" />
                    Status
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile/Tablet Subscribe Button + Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {(isMobile || window.innerWidth <= 1024) && (
              <Button
                onClick={() => setLocation('/pricing')}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                title="Subscribe to premium plans"
                aria-label="Subscribe to premium plans"
              >
                <Crown className="h-4 w-4 mr-1" />
                Subscribe
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-button"
              title="Toggle mobile menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-border"
          data-testid="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium ${
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                title={`Go to ${item.name} page - ${item.name}`}
                aria-label={`Navigate to ${item.name} page`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 pb-3 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Welcome, {user.username || user.email}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="inline-block mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Crown className="inline-block mr-2 h-4 w-4" />
                    Pricing
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="inline-block mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocation('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    data-testid="mobile-login-button"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setLocation('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    data-testid="mobile-register-button"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Bar - Below header, full width */}
      {!hideSearchOnMobile && (
        <div className="md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 border-b border-border">
          <div className="relative">
            <form onSubmit={handleMobileSearch}>
              <Input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="bg-muted border-border w-full pr-10"
                data-testid="mobile-header-search"
                title="Search for live sports matches"
                aria-label="Search for live sports matches"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>

            {/* Mobile Header Search Results */}
            {showSearchResults && filteredMatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredMatches.map((match: Match) => (
                  <div
                    key={match.id}
                    onClick={() => handleMatchSelect(match)}
                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    title={`${match.title} - ${match.category} live stream`}
                    aria-label={`View details for ${match.title} in ${match.category}`}
                  >
                    <div className="text-sm font-medium text-foreground truncate">
                      {match.title}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {match.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;