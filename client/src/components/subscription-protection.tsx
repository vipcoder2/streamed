
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { checkSubscriptionAccess, UserSubscription } from '../lib/subscription';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Lock, Clock } from 'lucide-react';

interface SubscriptionProtectionProps {
  children: React.ReactNode;
  requiredFor?: string; // Description of what requires subscription
}

export const SubscriptionProtection: React.FC<SubscriptionProtectionProps> = ({ 
  children, 
  requiredFor = "this content" 
}) => {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [accessReason, setAccessReason] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasAccess(false);
        setAccessReason('Please log in to access this content');
        setChecking(false);
        return;
      }

      console.log('🔒 Checking subscription access for:', user.uid);
      
      try {
        const accessResult = await checkSubscriptionAccess(user.uid);
        console.log('🔐 Access result:', accessResult);
        
        setHasAccess(accessResult.hasAccess);
        setSubscription(accessResult.subscription);
        setAccessReason(accessResult.reason || '');
        
        if (!accessResult.hasAccess) {
          console.log('❌ Access denied:', accessResult.reason);
        } else {
          console.log('✅ Access granted');
        }
      } catch (error) {
        console.error('🚨 Error checking subscription access:', error);
        setHasAccess(false);
        setAccessReason('Error checking subscription status');
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Checking access...</h2>
              <p className="text-gray-300">Verifying your subscription status.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-yellow-400 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              Login Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-300 mb-6">
                You need to be logged in to access {requiredFor}.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation('/login')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/register')} 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    const isExpired = subscription && subscription.active === false;
    
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-red-400 flex items-center justify-center gap-2">
              {isExpired ? <Clock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
              {isExpired ? 'Subscription Expired' : 'Subscription Required'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-300 mb-2">
                {isExpired 
                  ? `Your subscription has expired and you need an active subscription to access ${requiredFor}.`
                  : `You need an active subscription to access ${requiredFor}.`
                }
              </p>
              {accessReason && (
                <p className="text-gray-400 text-sm mb-6">
                  {accessReason}
                </p>
              )}
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation('/pricing')} 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {isExpired ? 'Renew Subscription' : 'Get Subscription'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/dashboard')} 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has access, render the protected content
  return <>{children}</>;
};
