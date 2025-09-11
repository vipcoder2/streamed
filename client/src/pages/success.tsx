import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SuccessPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    planName: string;
    days: number;
  } | null>(null);

  useEffect(() => {
    const verifyPaymentAndActivateSubscription = async () => {
      try {
        // Get query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const planId = urlParams.get('plan_id');

        if (!sessionId) {
          setError('Missing payment verification data. Please contact support.');
          setProcessing(false);
          return;
        }

        if (!planId) {
          setError('Missing plan information. Please contact support.');
          setProcessing(false);
          return;
        }

        // Wait for user authentication
        if (loading) return;

        if (!user) {
          setError('Please log in to complete your subscription.');
          setProcessing(false);
          return;
        }

        // Verify payment with server - only send session_id, uid, and plan_id
        // Server will validate everything else for security
        const response = await fetch('/api/verify-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            uid: user.uid,
            plan_id: planId
          })
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Verification failed:', data);
          const errorMessage = data.error || `Payment verification failed (${response.status})`;
          const detailsMessage = data.details ? ` Details: ${data.details}` : '';
          setError(`${errorMessage}${detailsMessage}. Please contact support if this persists.`);
          setProcessing(false);
          return;
        }

        if (!data.success) {
          console.error('Verification unsuccessful:', data);
          setError(data.error || 'Payment verification failed. Please contact support.');
          setProcessing(false);
          return;
        }

        setSubscriptionDetails(data.subscription);
        setProcessing(false);

      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(`Network error during verification: ${err instanceof Error ? err.message : 'Unknown error'}. Please contact support.`);
        setProcessing(false);
      }
    };

    verifyPaymentAndActivateSubscription();
  }, [user, loading]);

  if (loading || processing) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Verifying your payment...</h2>
              <p className="text-gray-300">Please wait while we confirm your subscription.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-red-400">Payment Verification Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation('/pricing')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/')} 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{background: '#011412'}}>
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-green-400 flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Subscription Activated!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-300 mb-2">
              Welcome to <strong className="text-white">{subscriptionDetails?.planName}</strong>!
            </p>
            <p className="text-gray-400 mb-6">
              Your subscription is active for {subscriptionDetails?.days} days.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/')} 
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                Start Watching Streams
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
};

export default SuccessPage;