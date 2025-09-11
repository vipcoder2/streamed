import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { checkSubscriptionAccess, UserSubscription } from '../lib/subscription';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        setLocation('/login');
        return;
      }

      try {
        setChecking(true);
        const result = await checkSubscriptionAccess(user.uid);
        
        setHasAccess(result.hasAccess);
        setSubscription(result.subscription);
        setReason(result.reason || '');
        
        if (!result.hasAccess && result.reason === 'Subscription has expired') {
          // Auto-redirect to pricing page after short delay for expired subscriptions
          setTimeout(() => {
            setLocation('/pricing');
          }, 3000);
        }
      } catch (error) {
        console.error('Subscription check failed:', error);
        setHasAccess(false);
        setReason('Failed to verify subscription');
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, authLoading, setLocation]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Checking subscription...</h2>
              <p className="text-gray-300">Please wait while we verify your access.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-orange-400 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Premium Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">Subscription Required</h2>
              <p className="text-gray-300 mb-2">
                {reason === 'No subscription found' 
                  ? 'You need an active subscription to watch premium streams.'
                  : reason === 'Subscription has expired'
                  ? 'Your subscription has expired. Redirecting to pricing...'
                  : reason === 'Subscription is inactive'
                  ? 'Your subscription is inactive. Please renew to continue watching.'
                  : 'Please upgrade to access this content.'
                }
              </p>
              {subscription && reason === 'Subscription has expired' && (
                <p className="text-gray-400 text-sm mb-4">
                  Your {subscription.plan} expired. Don't miss out on more great content!
                </p>
              )}
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation('/pricing')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  View Subscription Plans
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/')} 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Browse Free Content
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;