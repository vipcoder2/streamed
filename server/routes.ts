import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Router } from 'express';
import axios from 'axios';
import { Match, Sport, Stream } from '../shared/schema';
import Stripe from 'stripe';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK with service account for Replit
let adminDb: FirebaseFirestore.Firestore;

try {
  if (!getApps().length) {
    // Initialize with service account key for proper authentication
    const serviceAccountKey = {
      type: "service_account",
      project_id: "streamed-310f8",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    if (serviceAccountKey.private_key && serviceAccountKey.client_email) {
      initializeApp({
        credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
        projectId: "streamed-310f8"
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Fallback for development without service account
      initializeApp({
        projectId: "streamed-310f8"
      });
      console.log('Firebase Admin initialized with default credentials');
    }
  }
  adminDb = getFirestore();
  console.log('Firebase Admin initialized successfully with project:', "streamed-310f8");
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
  // Set adminDb to null for fallback handling
  adminDb = null as any;
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Plan configuration - Updated to match actual Stripe prices
const PLAN_CONFIG = {
  daily: { name: 'Daily Pass', days: 1, price: 1.99 },
  weekly: { name: 'Weekly Plan', days: 7, price: 4.99 },
  monthly: { name: 'Monthly Plan', days: 30, price: 12.99 },
  sixmonth: { name: '6-Month Plan', days: 180, price: 39.99 }
};

const STREAMED_API_BASE = 'https://streamed.pk/api';

const router = Router();
const BASE_URL = 'https://streamed.pk/api';

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy routes to Streamed API

  // Get sports categories
  app.get('/api/sports', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/sports`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching sports:', error);
      res.status(500).json({ error: 'Failed to fetch sports' });
    }
  });

  // Get matches for a specific sport
  app.get('/api/matches/:sport', async (req, res) => {
    try {
      const { sport } = req.params;
      const response = await fetch(`${STREAMED_API_BASE}/matches/${sport}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  // Get all matches
  app.get('/api/matches/all', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/matches/all`);
      if (!response.ok) {
        console.error('Streamed API error:', response.status, response.statusText);
        return res.status(response.status).json({ error: 'Failed to fetch all matches from source API' });
      }
      const data = await response.json();
      console.log('All matches fetched successfully:', data?.length || 0, 'matches');
      res.json(data);
    } catch (error) {
      console.error('Error fetching all matches:', error);
      res.status(500).json({ error: 'Failed to fetch all matches' });
    }
  });

  // Get all popular matches
  app.get('/api/matches/all/popular', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/matches/all/popular`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching all popular matches:', error);
      res.status(500).json({ error: 'Failed to fetch all popular matches' });
    }
  });

  // Get all today's matches
  app.get('/api/matches/all-today', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/matches/all-today`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching today\'s matches:', error);
      res.status(500).json({ error: 'Failed to fetch today\'s matches' });
    }
  });

  // Get popular today's matches
  app.get('/api/matches/all-today/popular', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/matches/all-today/popular`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching popular today\'s matches:', error);
      res.status(500).json({ error: 'Failed to fetch popular today\'s matches' });
    }
  });

  // Get live matches
  app.get('/api/matches/live', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/matches/live`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching live matches:', error);
      res.status(500).json({ error: 'Failed to fetch live matches' });
    }
  });

  // Get popular live matches
  app.get('/api/matches/live/popular', async (req, res) => {
    try {
      const response = await fetch(`${STREAMED_API_BASE}/matches/live/popular`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching popular live matches:', error);
      res.status(500).json({ error: 'Failed to fetch popular live matches' });
    }
  });

  // Get popular matches for a specific sport
  app.get('/api/matches/:sport/popular', async (req, res) => {
    try {
      const { sport } = req.params;
      const response = await fetch(`${STREAMED_API_BASE}/matches/${sport}/popular`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching popular matches for sport:', error);
      res.status(500).json({ error: 'Failed to fetch popular matches for sport' });
    }
  });

  // Get stream sources for a match
  app.get('/api/stream/:source/:id', async (req, res) => {
    try {
      const { source, id } = req.params;
      console.log(`Fetching streams for source: ${source}, id: ${id}`);
      const response = await fetch(`${STREAMED_API_BASE}/stream/${source}/${id}`);
      
      if (!response.ok) {
        console.error('Streamed API stream error:', response.status, response.statusText);
        return res.status(response.status).json({ error: 'Failed to fetch streams from source API' });
      }
      
      const data = await response.json();
      console.log(`Stream data for ${source}/${id}:`, Array.isArray(data) ? `${data.length} streams` : 'data received');
      res.json(data);
    } catch (error) {
      console.error('Error fetching streams:', error);
      res.status(500).json({ error: 'Failed to fetch streams' });
    }
  });

  // Image endpoints
  router.get('/api/images/badge/:id.webp', async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(`${BASE_URL}/images/badge/${id}.webp`, {
        responseType: 'stream'
      });

      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      response.data.pipe(res);
    } catch (error) {
      res.status(404).send('Image not found');
    }
  });

  router.get('/api/images/poster/:badge1/:badge2.webp', async (req, res) => {
    try {
      const { badge1, badge2 } = req.params;
      const response = await axios.get(`${BASE_URL}/images/poster/${badge1}/${badge2}.webp`, {
        responseType: 'stream'
      });

      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      response.data.pipe(res);
    } catch (error) {
      res.status(404).send('Image not found');
    }
  });

  router.get('/api/images/proxy/:poster.webp', async (req, res) => {
    try {
      const { poster } = req.params;
      const response = await axios.get(`${BASE_URL}/images/proxy/${poster}.webp`, {
        responseType: 'stream'
      });

      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      response.data.pipe(res);
    } catch (error) {
      res.status(404).send('Image not found');
    }
  });

  // Subscription verification endpoint
  app.post('/api/verify-subscription', async (req, res) => {
    try {
      console.log('Subscription verification request:', req.body);
      
      const { session_id, uid, plan_id } = req.body;

      if (!session_id || !uid || !plan_id) {
        console.error('Missing required parameters:', { session_id: !!session_id, uid: !!uid, plan_id: !!plan_id });
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Verify plan_id is valid
      const planConfig = PLAN_CONFIG[plan_id as keyof typeof PLAN_CONFIG];
      if (!planConfig) {
        console.error('Invalid plan ID:', plan_id);
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      console.log('Verifying Stripe session:', session_id);

      // Verify the Stripe session
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(session_id);
        console.log('Stripe session retrieved:', {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          customer: session.customer
        });
      } catch (stripeError) {
        console.error('Stripe session retrieval failed:', stripeError);
        return res.status(400).json({ error: 'Invalid session ID or Stripe error' });
      }
      
      if (!session) {
        console.error('Session not found');
        return res.status(400).json({ error: 'Session not found' });
      }

      if (session.payment_status !== 'paid') {
        console.error('Payment not completed, status:', session.payment_status);
        return res.status(400).json({ error: 'Payment not completed' });
      }

      // Verify the payment amount matches the plan price (security check)
      const totalAmountPaid = session.amount_total ? session.amount_total / 100 : 0;
      const expectedPrice = planConfig.price;
      
      console.log('Payment verification:', {
        sessionId: session_id,
        planId: plan_id,
        paidAmount: totalAmountPaid,
        expectedAmount: expectedPrice,
        difference: Math.abs(totalAmountPaid - expectedPrice)
      });
      
      // Allow for small rounding differences (within 1 cent)
      if (Math.abs(totalAmountPaid - expectedPrice) > 0.01) {
        console.error('Payment amount mismatch:', { 
          paid: totalAmountPaid, 
          expected: expectedPrice,
          difference: Math.abs(totalAmountPaid - expectedPrice)
        });
        return res.status(400).json({ 
          error: 'Payment amount verification failed',
          details: `Expected: $${expectedPrice}, Received: $${totalAmountPaid}`
        });
      }

      const currentTime = Date.now();
      const expiryTime = currentTime + (planConfig.days * 24 * 60 * 60 * 1000);
      
      // Create comprehensive subscription data
      const subscriptionData = {
        plan: planConfig.name,
        planId: plan_id,
        planName: planConfig.name,
        active: true,
        subscribedAt: currentTime,
        expiresAt: expiryTime,
        durationDays: planConfig.days,
        price: planConfig.price,
        currency: 'USD',
        stripeSessionId: session_id,
        stripeCustomerId: session.customer,
        stripePaymentIntentId: session.payment_intent,
        paymentStatus: 'completed',
        createdAt: currentTime,
        updatedAt: currentTime,
        renewalEnabled: true,
        canceledAt: null,
        refundedAt: null,
        userId: uid,
        // Additional tracking fields
        source: 'stripe_checkout',
        paymentMethod: 'card',
        subscriptionType: 'one_time',
        autoRenew: false
      };

      // Check if Firebase Admin is available
      if (!adminDb) {
        console.log('Firebase Admin not available, but payment was verified');
        return res.json({ 
          success: true, 
          subscription: {
            planName: planConfig.name,
            days: planConfig.days,
            expiresAt: expiryTime
          }
        });
      }

      console.log('Checking for existing subscription...');

      // Check if this session was already processed (prevent duplicate processing)
      try {
        const existingSessionDoc = await adminDb.doc(`processed_sessions/${session_id}`).get();
        if (existingSessionDoc.exists()) {
          console.log('Payment session already processed');
          return res.status(400).json({ error: 'This payment has already been processed' });
        }
      } catch (firebaseError) {
        console.error('Firebase session check error (continuing):', firebaseError);
      }

      console.log('Creating subscription in Firestore...');

      try {
        // Use a batch write for atomic operations
        const batch = adminDb.batch();

        // 1. Create/update current subscription
        const subscriptionRef = adminDb.doc(`users/${uid}/subscription/current`);
        batch.set(subscriptionRef, subscriptionData);

        // 2. Create subscription history record
        const historyRef = adminDb.doc(`users/${uid}/subscription_history/${session_id}`);
        batch.set(historyRef, {
          ...subscriptionData,
          historyType: 'purchase',
          processedAt: currentTime
        });

        // 3. Update user document with subscription status
        const userRef = adminDb.doc(`users/${uid}`);
        batch.set(userRef, {
          uid: uid,
          hasActiveSubscription: true,
          currentPlan: plan_id,
          currentPlanName: planConfig.name,
          subscriptionUpdatedAt: currentTime,
          subscriptionExpiresAt: expiryTime,
          lastPaymentDate: currentTime,
          totalPurchases: admin.firestore.FieldValue.increment(1)
        }, { merge: true });

        // 4. Mark session as processed
        const sessionRef = adminDb.doc(`processed_sessions/${session_id}`);
        batch.set(sessionRef, {
          sessionId: session_id,
          userId: uid,
          planId: plan_id,
          processedAt: currentTime,
          amount: planConfig.price
        });

        // 5. Create subscription analytics record
        const analyticsRef = adminDb.doc(`subscription_analytics/${uid}_${currentTime}`);
        batch.set(analyticsRef, {
          userId: uid,
          planId: plan_id,
          planName: planConfig.name,
          amount: planConfig.price,
          currency: 'USD',
          timestamp: currentTime,
          source: 'stripe',
          eventType: 'subscription_created'
        });

        // Execute all operations atomically
        await batch.commit();

        console.log(`✅ Subscription successfully created for user ${uid}:`, {
          plan: plan_id,
          session: session_id,
          expires: new Date(expiryTime).toISOString()
        });

      } catch (firebaseError) {
        console.error('❌ Firebase write error:', firebaseError);
        
        // Even if Firebase fails, the Stripe payment was successful
        // Return success so user isn't charged but denied access
        console.log('⚠️ Continuing despite Firebase error - payment was verified');
      }

      res.json({ 
        success: true, 
        subscription: {
          planName: planConfig.name,
          days: planConfig.days,
          expiresAt: expiryTime
        }
      });

    } catch (error) {
      console.error('Error verifying subscription:', error);
      res.status(500).json({ 
        error: 'Failed to verify subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // App routes
  app.use('/', router);

  const httpServer = createServer(app);

  return httpServer;
}