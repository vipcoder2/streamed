import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserSubscription {
  plan?: string; // Legacy field for backward compatibility
  planId?: string; // New secure plan ID
  planName?: string; // New secure plan name
  active: boolean;
  subscribedAt: number;
  expiresAt: number; // Exact expiry timestamp
  durationDays: number;
  price: number;
  currency: string;
  stripeSessionId?: string; // Stripe session for verification
  stripeCustomerId?: string; // Stripe customer for future reference
  stripePaymentIntentId?: string; // Payment intent for refunds
  paymentStatus: string; // completed, refunded, canceled
  createdAt: number;
  updatedAt: number;
  renewalEnabled: boolean;
  canceledAt?: number | null;
  refundedAt?: number | null;
}

// Get user subscription from Firestore
export const getUserSubscription = async (uid: string): Promise<UserSubscription | null> => {
  try {
    console.log('🔍 Fetching subscription for user:', uid);
    
    // Try to get from current subscription first
    const subscriptionRef = doc(db, `users/${uid}/subscription/current`);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    console.log('📋 Subscription document exists:', subscriptionDoc.exists());
    
    if (!subscriptionDoc.exists()) {
      console.log('❌ No current subscription document found');
      
      // Also check main user document for backup subscription data
      const userRef = doc(db, `users/${uid}`);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('👤 User data found:', userData);
        
        if (userData.hasActiveSubscription && userData.subscriptionExpiresAt) {
          // Reconstruct subscription from user data
          const backupSubscription: UserSubscription = {
            plan: userData.currentPlanName || userData.currentPlan,
            planId: userData.currentPlan,
            planName: userData.currentPlanName,
            active: userData.hasActiveSubscription,
            subscribedAt: userData.lastPaymentDate || userData.subscriptionUpdatedAt,
            expiresAt: userData.subscriptionExpiresAt,
            durationDays: Math.ceil((userData.subscriptionExpiresAt - (userData.lastPaymentDate || userData.subscriptionUpdatedAt)) / (24 * 60 * 60 * 1000)),
            price: 0, // Unknown from backup data
            currency: 'USD',
            paymentStatus: 'completed',
            createdAt: userData.subscriptionUpdatedAt,
            updatedAt: userData.subscriptionUpdatedAt,
            renewalEnabled: false,
            canceledAt: null,
            refundedAt: null
          };
          console.log('🔄 Reconstructed subscription from user data:', backupSubscription);
          return backupSubscription;
        }
      }
      
      return null;
    }
    
    const data = subscriptionDoc.data() as UserSubscription;
    console.log('✅ Subscription data retrieved:', {
      plan: data.planName,
      active: data.active,
      expiresAt: new Date(data.expiresAt).toISOString(),
      isExpired: Date.now() > data.expiresAt
    });
    return data;
  } catch (error) {
    console.error('❌ Error fetching subscription:', error);
    return null;
  }
};

// Check if subscription is expired
export const isSubscriptionExpired = (subscription: UserSubscription): boolean => {
  if (!subscription.active) return true;
  
  // Use exact expiry timestamp if available, otherwise calculate from subscribedAt
  const expiryTime = subscription.expiresAt || 
    (subscription.subscribedAt + subscription.durationDays * 24 * 60 * 60 * 1000);
  return Date.now() > expiryTime;
};

// Get subscription expiry date
export const getSubscriptionExpiryDate = (subscription: UserSubscription): Date => {
  // Use exact expiry timestamp if available, otherwise calculate from subscribedAt
  const expiryTime = subscription.expiresAt || 
    (subscription.subscribedAt + subscription.durationDays * 24 * 60 * 60 * 1000);
  return new Date(expiryTime);
};

// Update subscription status to inactive
export const deactivateSubscription = async (uid: string): Promise<void> => {
  try {
    const subscriptionRef = doc(db, `users/${uid}/subscription/current`);
    await updateDoc(subscriptionRef, { active: false });
    console.log('Subscription deactivated for user:', uid);
  } catch (error) {
    console.error('Error deactivating subscription:', error);
    throw error;
  }
};

// Cancel subscription (set active to false)
export const cancelSubscription = async (uid: string): Promise<void> => {
  try {
    const subscriptionRef = doc(db, `users/${uid}/subscription/current`);
    await updateDoc(subscriptionRef, { 
      active: false,
      canceledAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log('Subscription canceled for user:', uid);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

// Check subscription access for streaming pages
export const checkSubscriptionAccess = async (uid: string): Promise<{
  hasAccess: boolean;
  subscription: UserSubscription | null;
  reason?: string;
}> => {
  try {
    console.log('Checking subscription access for user:', uid);
    const subscription = await getUserSubscription(uid);
    console.log('Retrieved subscription:', subscription);
    
    if (!subscription) {
      console.log('No subscription found for user');
      return {
        hasAccess: false,
        subscription: null,
        reason: 'No subscription found'
      };
    }
    
    if (!subscription.active) {
      console.log('Subscription is inactive');
      return {
        hasAccess: false,
        subscription,
        reason: 'Subscription is inactive'
      };
    }
    
    const expired = isSubscriptionExpired(subscription);
    console.log('Subscription expired check:', expired);
    
    if (expired) {
      console.log('Subscription has expired, deactivating...');
      // Auto-deactivate expired subscription
      await deactivateSubscription(uid);
      return {
        hasAccess: false,
        subscription: { ...subscription, active: false },
        reason: 'Subscription has expired'
      };
    }
    
    console.log('Subscription is active and valid');
    return {
      hasAccess: true,
      subscription
    };
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return {
      hasAccess: false,
      subscription: null,
      reason: 'Error checking subscription'
    };
  }
};