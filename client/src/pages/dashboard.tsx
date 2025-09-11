import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Calendar, CreditCard, Settings, LogOut, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser, resetPassword } from '../lib/auth';
import { SUBSCRIPTION_PLANS, getPlanById } from '../lib/subscription-plans';
import { getUserSubscription, UserSubscription, getSubscriptionExpiryDate, isSubscriptionExpired, cancelSubscription, deactivateSubscription } from '../lib/subscription'; // Import deactivateSubscription

// Assume these functions exist and are correctly implemented in their respective files
// import { saveSubscriptionDetails, getSubscriptionDetails, checkSubscriptionStatus } from '../lib/firestore';


const DashboardPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  // Fetch real subscription data from Firestore
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;

      setLoadingSubscription(true);
      try {
        console.log('📊 Loading subscription for dashboard...');
        const userSub = await getUserSubscription(user.uid);
        console.log('📋 Dashboard subscription data:', userSub);
        setSubscription(userSub);

        if (userSub && isSubscriptionExpired(userSub)) {
          console.log('⏰ Subscription expired, deactivating...');
          await deactivateSubscription(user.uid); // Use the imported function
          setSubscription({ ...userSub, active: false }); // Update state to reflect deactivation
        }
      } catch (error) {
        console.error('❌ Error fetching subscription:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load subscription information.'
        });
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleLogout = async () => {
    setLoadingAction('logout');
    try {
      await logoutUser();
      setLocation('/');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setLoadingAction('reset-password');
    try {
      await resetPassword(user.email);
      setResetEmailSent(true);
      setMessage({ type: 'success', text: 'Password reset email sent successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleContactSupport = () => {
    // For now, just redirect to a contact form or email
    window.open('mailto:support@streamedlive.com?subject=Subscription%20Cancellation%20Request', '_blank');
    setMessage({
      type: 'success',
      text: 'Please contact our support team to cancel your subscription. We\'ll process your request as soon as possible.'
    });
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    setLoadingAction('cancel-subscription');
    try {
      await cancelSubscription(user.uid);
      // Refresh subscription data
      const updatedSub = await getUserSubscription(user.uid);
      setSubscription(updatedSub);
      setMessage({
        type: 'success',
        text: 'Subscription canceled successfully. You can still access content until it expires.'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to cancel subscription. Please contact support.'
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Unknown</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#011412'}}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{background: '#011412'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-400">{user.username || 'User'}</span>
          </h1>
          <p className="text-gray-300">
            Manage your account and subscriptions from your dashboard
          </p>
        </div>

        {/* Messages */}
        {message && (
          <Alert className={`mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/20 border-green-500/30'
              : 'bg-red-500/20 border-red-500/30'
          }`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-100' : 'text-red-100'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-400" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="text-white">{user.username}</p>
                  </div>
                </div>

                <Separator className="border-white/10" />

                <div className="space-y-2">
                  <Button
                    onClick={handleResetPassword}
                    disabled={loadingAction === 'reset-password' || resetEmailSent}
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {loadingAction === 'reset-password' ? 'Sending...' : resetEmailSent ? 'Email Sent' : 'Reset Password'}
                  </Button>

                  <Button
                    onClick={handleLogout}
                    disabled={loadingAction === 'logout'}
                    variant="outline"
                    className="w-full border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loadingAction === 'logout' ? 'Signing Out...' : 'Sign Out'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setLocation('/pricing')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Upgrade Plan
                </Button>

                <Button
                  onClick={() => setLocation('/favorites')}
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  View Favorites
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-400" />
                  Active Subscriptions
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your premium streaming subscriptions
                </CardDescription>
              </CardHeader>

              <CardContent>
                {loadingSubscription ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading subscription...</p>
                  </div>
                ) : !subscription ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Active Subscriptions</h3>
                    <p className="text-gray-400 mb-6">
                      Subscribe to a premium plan to enjoy unlimited sports streaming
                    </p>
                    <Button
                      onClick={() => setLocation('/pricing')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      View Plans
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black/20 border border-white/10 rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {subscription.plan || subscription.planName || 'Unknown Plan'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {subscription.durationDays} day{subscription.durationDays !== 1 ? 's' : ''} plan
                          </p>
                        </div>
                        {getStatusBadge(subscription.active && !isSubscriptionExpired(subscription) ? 'active' : isSubscriptionExpired(subscription) ? 'expired' : 'inactive')}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-400">Start Date:</span>
                          <span className="text-white ml-2">
                            {new Date(subscription.subscribedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expires:</span>
                          <span className="text-white ml-2">
                            {getSubscriptionExpiryDate(subscription).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} at {getSubscriptionExpiryDate(subscription).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400">Price:</span>
                          <span className="text-white ml-2">
                            ${subscription.price?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {subscription.active && !isSubscriptionExpired(subscription) && (
                          <Button
                            onClick={handleCancelSubscription}
                            disabled={loadingAction === 'cancel-subscription'}
                            variant="outline"
                            className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          >
                            {loadingAction === 'cancel-subscription' ? 'Canceling...' : 'Cancel Subscription'}
                          </Button>
                        )}

                        <Button
                          onClick={() => setLocation('/pricing')}
                          variant="outline"
                          className="border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                        >
                          View All Plans
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;