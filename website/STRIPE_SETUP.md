# Stripe Integration Setup

This document describes how to set up Stripe integration for the payment processing in your Soloist application.

## Prerequisites

1. A Stripe account - [Sign up here](https://dashboard.stripe.com/register)
2. Node.js and npm installed

## Setup Steps

### 1. Stripe Account Setup

1. Create a Stripe account or log in to your existing account
2. Switch to test mode (toggle in the top right of the Stripe dashboard)
3. Navigate to Developers > API Keys to get your API keys

### 2. Create Products and Prices

1. In your Stripe dashboard, go to Products > Add Product
2. Create a product called "Soloist Pro"
3. Add two prices:
   - Monthly subscription: $9/month
   - Annual subscription: $89/year
4. Note the Price IDs for both (they start with "price_")

### 3. Set up Webhooks for Local Development

For local testing, you need to expose your local server to the internet so Stripe can send webhook events:

1. Install ngrok: `brew install ngrok` (macOS) or visit https://ngrok.com/download
2. Set up your ngrok auth token: `ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN`
3. Start your development environment with: `pnpm run dev:stripe`
4. Look for the ngrok forwarding URL in the terminal (e.g., `https://abc123.ngrok.io`)
5. In your Stripe dashboard, go to Developers > Webhooks > Add endpoint
6. Set the endpoint URL to `https://[your-ngrok-url]/api/webhooks/stripe`
7. Select these events to track:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
8. After creating the webhook, reveal and copy the Signing Secret

> **Note:** Each time you restart ngrok, you'll get a new URL. You'll need to update the webhook endpoint URL in your Stripe dashboard.

### 4. Configure Environment Variables

Create a `.env.local` file in the website directory with the following variables:

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...YOUR_STRIPE_SECRET_KEY...
STRIPE_PUBLISHABLE_KEY=pk_test_...YOUR_STRIPE_PUBLISHABLE_KEY...
STRIPE_WEBHOOK_SECRET=whsec_...YOUR_STRIPE_WEBHOOK_SECRET...

# Public Env Vars (accessible from browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...YOUR_STRIPE_PUBLISHABLE_KEY...
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...YOUR_MONTHLY_PRICE_ID...
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...YOUR_YEARLY_PRICE_ID...
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 5. Install Dependencies

Run the following command to install the necessary dependencies:

```bash
pnpm install
```

## Testing the Integration

1. Start your development server with Stripe support: `pnpm run dev:stripe`
2. Open your application at http://localhost:3001
3. Navigate to the pricing page
4. Click on the "Get Pro" button
5. You should be redirected to the Stripe Checkout page
6. Use these test card details for testing:
   - Card number: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
7. Complete the test payment

The webhook system will receive events from Stripe, and you can monitor these in your terminal logs and in the Stripe dashboard (Developers > Webhooks > Select your webhook > Recent events).

## Integrating with Convex

The webhook handler in `website/src/app/api/webhooks/stripe/route.ts` contains placeholder functions that you should replace with actual Convex mutations:

- `updateSubscriptionStatus`: Update user subscription status when checkout is completed
- `processSubscriptionChange`: Handle subscription updates
- `processSuccessfulPayment`: Record successful payments

Implement these functions using Convex mutations to update your database.

## Going to Production

When you're ready to go live:

1. Switch to live mode in your Stripe dashboard
2. Update your environment variables with the live API keys
3. Create production products and prices in the Stripe dashboard
4. Update your webhook endpoint URL to your production domain
5. Update the price IDs in your environment variables

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/checkout)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Convex Documentation](https://docs.convex.dev)
- [ngrok Documentation](https://ngrok.com/docs/) 