import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

export async function POST(request: Request) {
  try {
    const { priceId, customerEmail, metadata } = await request.json();

    // Validate required parameters
    if (!priceId) {
      return NextResponse.json(
        { message: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Fetch the price information from Stripe
    const price = await stripe.prices.retrieve(priceId);
    
    if (!price) {
      return NextResponse.json(
        { message: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Create or retrieve a customer
    let customer;
    if (customerEmail) {
      // Check if customer already exists
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create a new customer
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata,
        });
      }
    }

    // Payment intents require an amount and currency
    // Subscription prices have these on the price object
    const amount = price.unit_amount || 1000; // default to $10.00 if not set
    const currency = price.currency || 'usd';

    // Create a payment intent for the price
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer?.id,
      metadata: {
        priceId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the client secret for the frontend
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      amount,
      currency
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        message: 'Error creating payment intent', 
        error: errorMessage
      },
      { status: 500 }
    );
  }
} 