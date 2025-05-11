'use client'

interface StripeCheckoutProps {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  email?: string;
  customerData?: {
    [key: string]: string;
  };
}

/**
 * StripeCheckout utilities for handling Stripe Checkout integration
 * 
 * This exposes a function to redirect users to Stripe Checkout
 */
const StripeCheckout = {
  /**
   * Redirects the user to Stripe checkout with the specified price
   */
  redirectToCheckout: async ({
    priceId,
    successUrl,
    cancelUrl,
    email,
    customerData = {}
  }: StripeCheckoutProps) => {
    try {
      // Create checkout session - this would normally be a server API call
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: successUrl || `${window.location.origin}/thank-you`,
          cancelUrl: cancelUrl || window.location.href,
          customerEmail: email,
          metadata: customerData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionUrl } = await response.json();
      
      // Redirect to checkout
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }
};

export default StripeCheckout; 