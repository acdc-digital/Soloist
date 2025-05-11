'use client'

import { loadStripe } from '@stripe/stripe-js';

interface StripeCheckoutProps {
  priceId: string;
  email?: string;
  customerData?: {
    [key: string]: string;
  };
  onSuccess?: (sessionId: string) => void;
  onCancel?: () => void;
}

// Load Stripe outside of component render to avoid recreating it on every render
// Only load in browser environment to avoid Electron issues
const stripePromise = typeof window !== 'undefined'
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
  : null;

/**
 * StripeCheckout utilities for handling Stripe Checkout integration
 */
const StripeCheckout = {
  /**
   * Opens a modal checkout with Stripe Elements
   */
  openModalCheckout: async ({
    priceId,
    email,
    customerData = {},
    onSuccess,
    onCancel
  }: StripeCheckoutProps) => {
    try {
      // First, create a payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail: email,
          metadata: customerData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Create a modal element and mount it to the body
      const modalRoot = document.createElement('div');
      modalRoot.id = 'stripe-modal-root';
      document.body.appendChild(modalRoot);

      // We would typically use React's createPortal here,
      // but for simplicity in this utility function, we'll use a simpler approach
      const modalContainer = document.createElement('div');
      modalRoot.appendChild(modalContainer);

      // In a real implementation, you would use React's createPortal or a modal component library
      // This simplified version just shows how you'd approach it
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 flex items-center justify-center z-50';

      // Create a backdrop div for the blur effect and clicking outside to close
      const backdrop = document.createElement('div');
      backdrop.className = 'absolute inset-0 bg-black/30 backdrop-blur-sm';
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          modalRoot.remove();
          onCancel?.();
        }
      });
      modal.appendChild(backdrop);

      // Create the content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'bg-white p-8 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative z-10';
      contentContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Complete Your Purchase</h2>
        <div id="stripe-payment-element"></div>
        <div id="payment-message" class="text-red-500 mt-4 hidden"></div>
        <button id="payment-submit" class="w-full py-3 font-medium rounded-full transition-colors shadow-md bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 mt-4">
          Pay Now
        </button>
        <button id="payment-cancel" class="w-full mt-2 py-2 text-gray-600 hover:text-gray-800">
          Cancel
        </button>
      `;
      modal.appendChild(contentContainer);
      modalContainer.appendChild(modal);

      // Initialize Stripe Elements
      const stripe = await stripePromise;
      const elements = stripe?.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      });

      // Mount payment element
      const paymentElement = elements?.create('payment');
      paymentElement?.mount('#stripe-payment-element');

      // Handle payment submission
      const submitButton = document.getElementById('payment-submit');
      const messageDiv = document.getElementById('payment-message');
      const cancelButton = document.getElementById('payment-cancel');

      // Add click event listeners for closing the modal
      cancelButton?.addEventListener('click', () => {
        modalRoot.remove();
        onCancel?.();
      });

      if (submitButton && stripe && elements) {
        submitButton.addEventListener('click', async () => {
          // TypeScript safe check
          if (submitButton instanceof HTMLButtonElement) {
            submitButton.disabled = true;
          }
          submitButton.textContent = 'Processing...';

          const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/thank-you`,
            },
            redirect: 'if_required',
          });

          if (error) {
            if (messageDiv) {
              messageDiv.textContent = error.message || 'An error occurred';
              messageDiv.classList.remove('hidden');
            }
            if (submitButton instanceof HTMLButtonElement) {
              submitButton.disabled = false;
            }
            submitButton.textContent = 'Pay Now';
          } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            modalRoot.remove();
            onSuccess?.(paymentIntent.id);
          }
        });
      }

      return () => {
        modalRoot.remove();
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Legacy redirect method - redirects to Stripe Checkout page
   */
  redirectToCheckout: async ({
    priceId,
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
          successUrl: `${window.location.origin}/thank-you`,
          cancelUrl: window.location.href,
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