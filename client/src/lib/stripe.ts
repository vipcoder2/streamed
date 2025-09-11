
// Direct Stripe Checkout URLs configuration
export const STRIPE_CHECKOUT_URLS = {
  daily: 'https://buy.stripe.com/test_7sYdRb4Ard7C0Rm304cAo05',
  weekly: 'https://buy.stripe.com/test_5kQfZjgj9gjO2Zu0RWcAo06',
  monthly: 'https://buy.stripe.com/test_14A9AV2sjgjO0Rm304cAo07',
  sixmonth: 'https://buy.stripe.com/test_6oU7sN8QH5Fa57C58ccAo04'
};

export const PLAN_CONFIG = {
  daily: { name: 'Daily Pass', days: 1, price: 1.99 },
  weekly: { name: 'Weekly Plan', days: 7, price: 4.99 },
  monthly: { name: 'Monthly Plan', days: 30, price: 12.99 },
  sixmonth: { name: '6-Month Plan', days: 180, price: 39.99 }
};

// Get Stripe checkout URL with success/cancel redirect parameters
export const getStripeCheckoutUrl = (planId: string): string => {
  const baseUrl = STRIPE_CHECKOUT_URLS[planId as keyof typeof STRIPE_CHECKOUT_URLS];
  const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
  
  if (!baseUrl || !planConfig) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const currentDomain = window.location.origin;
  // Include session_id and plan_id in success URL for verification
  const successUrl = `${currentDomain}/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}`;
  const cancelUrl = `${currentDomain}/cancel`;

  return `${baseUrl}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
};
