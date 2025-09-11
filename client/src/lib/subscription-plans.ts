import type { SubscriptionPlan } from '../../../shared/schema';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'daily',
    name: 'Daily Pass',
    price: 1.99,
    interval: 'day',
    intervalCount: 1,
    description: 'Perfect for single match viewing',
    features: [
      'Access to all live sports streams',
      'HD quality streaming',
      'Mobile & desktop access',
      '24/7 customer support'
    ]
  },
  {
    id: 'weekly',
    name: 'Weekly Plan',
    price: 4.99,
    interval: 'week',
    intervalCount: 1,
    description: 'Great for sports enthusiasts',
    features: [
      'Access to all live sports streams',
      'HD & Full HD quality streaming',
      'Mobile, tablet & desktop access',
      'Save favorite matches',
      'Premium customer support'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 12.99,
    interval: 'month',
    intervalCount: 1,
    description: 'Most popular choice',
    features: [
      'Access to all live sports streams',
      'HD, Full HD & 4K quality streaming',
      'All devices supported',
      'Save unlimited favorites',
      'Replay previous matches',
      'Priority customer support'
    ]
  },
  {
    id: 'sixmonth',
    name: '6-Month Plan',
    price: 39.99,
    interval: 'month',
    intervalCount: 6,
    description: 'Best value for serious fans',
    features: [
      'Access to all live sports streams',
      'HD, Full HD & 4K quality streaming',
      'All devices supported',
      'Save unlimited favorites',
      'Full match replays & highlights',
      'Early access to new features',
      'VIP customer support',
      '70% savings vs monthly'
    ]
  }
];

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};