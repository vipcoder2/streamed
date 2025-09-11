import {
  Play,
  Home,
  Calendar,
  Trophy,
  Activity,
  Globe,
  Users,
  Shield,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-6">
                <Play className="text-white text-3xl mr-3" />
                <span className="text-2xl font-bold text-foreground">
                  ssports
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your premier destination for live sports streaming. Experience
                the thrill of live sports from anywhere, anytime. We offer free live
                streams for football, soccer, basketball, cricket, and more.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 text-white" />
                  <span>Global Coverage</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-white" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Home className="mr-2 h-5 w-5 text-white" />
                Navigation
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Home", href: "/" },
                  { name: "All Sports", href: "/sports" },
                  { name: "Schedule", href: "/schedule" },
                  { name: "Live Matches", href: "/?filter=live" },
                  { name: "Status", href: "/status" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                      title={`Watch ${item.name} live streams online for free`}
                      aria-label={`Browse ${item.name} live streaming matches and schedules`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sports Categories */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-white" />
                Popular Sports
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Football", href: "/schedule/football" },
                  { name: "Basketball", href: "/schedule/basketball" },
                  {
                    name: "American Football",
                    href: "/schedule/american-football",
                  },
                  { name: "Tennis", href: "/schedule/tennis" },
                  { name: "Cricket", href: "/schedule/cricket" },
                  { name: "Boxing & MMA", href: "/schedule/boxing" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                      title={`Watch ${item.name} live streams online for free`}
                      aria-label={`Browse ${item.name} live streaming matches and schedules`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Sports & Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-white" />
                More Sports
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Golf", href: "/schedule/golf" },
                  { name: "Motorsports", href: "/schedule/motorsports" },
                  { name: "Ice Hockey", href: "/schedule/hockey" },
                  { name: "Baseball", href: "/schedule/baseball" },
                  { name: "Darts", href: "/schedule/darts" },
                  { name: "Rugby", href: "/schedule/rugby" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                      title={`Watch ${item.name} live streams online for free`}
                      aria-label={`Browse ${item.name} live streaming matches and schedules`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <p className="text-sm text-muted-foreground">
                © 2024 Streamed. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <a
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                  title="View our Privacy Policy"
                  aria-label="View our Privacy Policy"
                >
                  Privacy Policy
                </a>
                <span>•</span>
                <a
                  href="/terms"
                  className="hover:text-primary transition-colors"
                  title="Read our Terms of Service"
                  aria-label="Read our Terms of Service"
                >
                  Terms of Service
                </a>
                <span>•</span>
                <a
                  href="/contact"
                  className="hover:text-primary transition-colors"
                  title="Contact us for support or inquiries"
                  aria-label="Contact us for support or inquiries"
                >
                  Contact Us
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Secure Streaming</span>
                <span className="sm:hidden">Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">All Systems Online</span>
                <span className="sm:hidden">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-specific bottom section */}
        <div className="sm:hidden border-t border-border/20 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for sports fans worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}