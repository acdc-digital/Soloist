import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

export async function POST(request: Request) {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail, metadata } = await request.json();

    // Validate required parameters
    if (!priceId) {
      return NextResponse.json(
        { message: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Create checkout session options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/thank-you`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionOptions.customer_email = customerEmail;
    }

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      sessionOptions.metadata = metadata;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    // Return the checkout session URL
    return NextResponse.json({ 
      sessionUrl: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    return NextResponse.json(
      { 
        message: 'Error creating checkout session', 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 