import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature') || '';

    if (!webhookSecret) {
      console.warn('Webhook secret not configured');
      return NextResponse.json(
        { message: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the event came from Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json(
        { message: `Webhook signature verification failed` },
        { status: 400 }
      );
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);
        
        // Here you would update your database, activate subscriptions, etc.
        // For example, update the user's subscription status in Convex
        await updateSubscriptionStatus(session);
        
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}: ${subscription.id}`);
        
        // Process subscription updates
        await processSubscriptionChange(subscription);
        
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        
        // Process successful payments
        if (invoice.subscription) {
          await processSuccessfulPayment(invoice);
        }
        
        break;
        
      // Add other webhook events as needed
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error('Webhook handler error:', error);
    
    return NextResponse.json(
      { message: 'Webhook handler error', error: error.message },
      { status: 500 }
    );
  }
}

// These are placeholder functions that you would replace with real implementations
// to integrate with your Convex database

async function updateSubscriptionStatus(session: Stripe.Checkout.Session) {
  // Example implementation:
  // 1. Extract customer details from session
  // 2. Update user subscription status in your database
  console.log('Would update subscription status for session:', session.id);
  
  // In a real implementation, you would use Convex to update the user data
  // Example pseudocode:
  // const { customerId, subscriptionId, metadata } = session;
  // await convex.mutation('users:updateSubscription', { 
  //   userId: metadata.userId,
  //   subscriptionId,
  //   status: 'active',
  //   plan: metadata.plan
  // });
}

async function processSubscriptionChange(subscription: Stripe.Subscription) {
  // Example implementation:
  // 1. Extract subscription details
  // 2. Update subscription status in your database
  console.log('Would process subscription change:', subscription.id, subscription.status);
  
  // In a real implementation, you would use Convex to update the subscription
  // Example pseudocode:
  // await convex.mutation('subscriptions:update', {
  //   subscriptionId: subscription.id,
  //   status: subscription.status,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  // });
}

async function processSuccessfulPayment(invoice: Stripe.Invoice) {
  // Example implementation:
  // 1. Extract invoice details
  // 2. Update payment records in your database
  console.log('Would process successful payment for invoice:', invoice.id);
  
  // In a real implementation, you would use Convex to record the payment
  // Example pseudocode:
  // await convex.mutation('payments:record', {
  //   invoiceId: invoice.id,
  //   subscriptionId: invoice.subscription,
  //   amount: invoice.amount_paid,
  //   status: 'paid',
  //   paidAt: new Date()
  // });
} 