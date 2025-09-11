import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../lib/subscription-plans';
import { useAuth } from '../contexts/AuthContext';
import { getStripeCheckoutUrl } from '../lib/stripe';

const PricingPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (!user) {
      setLocation('/login');
      return;
    }

    setLoadingPlanId(planId);
    
    try {
      // Get direct Stripe checkout URL with success/cancel parameters
      const checkoutUrl = getStripeCheckoutUrl(planId);
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout process. Please try again.');
      setLoadingPlanId(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'daily': return <Zap className="h-6 w-6" />;
      case 'weekly': return <Star className="h-6 w-6" />;
      case 'monthly': return <Crown className="h-6 w-6" />;
      case 'sixmonth': return <Rocket className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getPlanBadge = (planId: string) => {
    switch (planId) {
      case 'weekly': return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Popular</Badge>;
      case 'monthly': return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Most Popular</Badge>;
      case 'sixmonth': return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Best Value</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{background: '#011412'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Premium Plan</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock unlimited access to live sports streaming with crystal clear HD quality and premium features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isPopular = plan.id === 'monthly';
            const badge = getPlanBadge(plan.id);
            const isLoading = loadingPlanId === plan.id;

            return (
              <Card 
                key={plan.id} 
                className={`relative bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 ${
                  isPopular ? 'ring-2 ring-purple-500/50 scale-105' : ''
                }`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    {badge}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.id === 'daily' ? 'bg-blue-500/20 text-blue-400' :
                      plan.id === 'weekly' ? 'bg-yellow-500/20 text-yellow-400' :
                      plan.id === 'monthly' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {getPlanIcon(plan.id)}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="text-center mb-2">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400 ml-1">
                      /{plan.interval === 'day' ? 'day' : plan.interval === 'week' ? 'week' : plan.intervalCount === 6 ? '6 months' : 'month'}
                    </span>
                  </div>
                  
                  {plan.id === 'sixmonth' && (
                    <div className="text-sm text-green-400 font-medium">
                      Save 40% vs Monthly
                    </div>
                  )}
                  
                  <CardDescription className="text-gray-300 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                    className={`w-full mb-6 ${
                      isPopular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Get Started'}
                  </Button>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Why Choose Our Premium Plans?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-gray-300 text-sm">
                  Ultra-low latency streaming with instant channel switching and minimal buffering
                </p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Premium Quality</h4>
                <p className="text-gray-300 text-sm">
                  Crystal clear HD, Full HD, and 4K streaming for the ultimate viewing experience
                </p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">24/7 Support</h4>
                <p className="text-gray-300 text-sm">
                  Round-the-clock customer support to ensure you never miss a moment of action
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mt-8">
            All plans include a secure payment process, instant activation, and can be cancelled anytime.
            <br />
            Prices shown in USD. International taxes may apply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;