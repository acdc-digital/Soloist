// PRICING COMPONENT
// /Users/matthewsimon/Documents/Github/Soloist/website/src/components/Pricing.tsx

'use client'

import React, { useState } from "react";
import { Check } from "lucide-react";
import StripeCheckout from './StripeCheckout';

// Stripe configuration
// To use Stripe:
// 1. Sign up at stripe.com and get your publishable key
// 2. Create products and pricing plans in Stripe dashboard
// 3. Replace these values with your actual Stripe product/price IDs
const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "YOUR_PUBLISHABLE_KEY",
  prices: {
    pro: {
      month: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "price_YOUR_MONTHLY_PRICE_ID",
      year: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || "price_YOUR_YEARLY_PRICE_ID"
    }
  }
};

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText?: string;
  isPopular?: boolean;
  buttonVariant?: "default" | "primary";
  onButtonClick?: () => void;
  customButton?: React.ReactNode;
}

// Card component for pricing
const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  description, 
  price, 
  period, 
  features, 
  buttonText, 
  isPopular = false,
  buttonVariant = "default",
  onButtonClick,
  customButton
}) => {
  return (
    <div className={`border rounded-xl overflow-hidden h-full relative ${isPopular ? 'border-emerald-600 border-2' : 'border-gray-300 border-2'}`}>
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 mx-auto w-fit px-4 py-1 bg-emerald-600 text-white text-sm font-medium rounded-b-lg">
          Most Popular
        </div>
      )}
      
      <div className="p-8 flex flex-col h-full">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="mb-8">
          <div className="flex items-baseline">
            <span className="text-6xl font-bold">{price}</span>
            <span className="ml-2 text-xl text-gray-600">/{period}</span>
          </div>
        </div>
        
        <div className="flex-grow">
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="mr-3 h-5 w-5 text-black mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          {customButton ? (
            customButton
          ) : (
            <button 
              onClick={onButtonClick}
              className={`w-full py-3 font-medium rounded-full transition-colors shadow-md ${
                buttonVariant === "primary" 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg" 
                  : "border-2 border-gray-400 hover:bg-gray-50 hover:shadow-lg text-gray-700"
              }`}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

// FAQ Accordion Item
const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="border-b border-gray-200 py-5">
      <button 
        className="flex justify-between items-center w-full text-left font-medium"
        onClick={toggleOpen}
      >
        {question}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function Pricing() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [openFAQs, setOpenFAQs] = useState({
    "item-1": false,
    "item-2": false,
    "item-3": false
  });
  const [isLoading, setIsLoading] = useState(false);
  const prices = {
    monthly: "$9",
    yearly: "$89"
  };

  type FAQItemKey = "item-1" | "item-2" | "item-3";

  const toggleFAQ = (item: FAQItemKey) => {
    setOpenFAQs(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const freePlanFeatures = [
    "Basic mood tracking",
    "7-day forecasting",
    "Daily journal entries",
    "Standard mood visualization"
  ];

  const proPlanFeatures = [
    "Everything in Free",
    "30-day forecasting",
    "Advanced analytics",
    "AI-powered insight generation",
    "Priority support"
  ];

  // Handle Pro plan subscription
  const handleProPlanClick = async () => {
    // Check if using placeholder IDs
    const priceId = activeTab === 'monthly' 
      ? STRIPE_CONFIG.prices.pro.month 
      : STRIPE_CONFIG.prices.pro.year;
    
    if (priceId.includes('YOUR_') || STRIPE_CONFIG.publishableKey.includes('YOUR_')) {
      alert("This is a demo button. To enable payments, replace the placeholder Stripe credentials with your own.");
      return;
    }
    
    // Check if we're in the website context (not in Electron)
    const isWebsiteContext = typeof window !== 'undefined' &&
      (window.location.hostname !== 'localhost' ||
       window.location.port === '3001');
    
    // If we're in Electron or not in the website context, show a message
    if (!isWebsiteContext) {
      alert("Payments are available on our website. Please visit our website to subscribe.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use the StripeCheckout modal instead of redirect
      await StripeCheckout.openModalCheckout({
        priceId,
        customerData: {
          plan: activeTab === 'monthly' ? 'monthly' : 'yearly'
        },
        onSuccess: (sessionId) => {
          console.log('Payment successful!', sessionId);
          // Optionally redirect to thank you page or show a success message
          window.location.href = `/thank-you?session_id=${sessionId}`;
        },
        onCancel: () => {
          console.log('Payment cancelled');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error opening checkout:', error);
      alert("There was an error opening the checkout. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gray-50 border-y border-gray-100" id="pricing">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for your tracking and forecasting needs
            </p>
          </div>

          {/* Tabs */}
          <div className="max-w-xs mx-auto mb-12">
            <div className="grid grid-cols-2 rounded-lg overflow-hidden border">
              <button 
                className={`py-3 font-medium ${activeTab === "monthly" ? "bg-emerald-600 text-white" : "bg-white"}`}
                onClick={() => setActiveTab("monthly")}
              >
                Monthly
              </button>
              <button 
                className={`py-3 font-medium ${activeTab === "annually" ? "bg-emerald-600 text-white" : "bg-white"}`}
                onClick={() => setActiveTab("annually")}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Free Plan */}
            <PricingCard 
              title="Free"
              description="Essential tracking for individuals"
              price="$0"
              period={activeTab === "monthly" ? "month" : "year"}
              features={freePlanFeatures}
              buttonText="Get Started"
            />

            {/* Pro Plan */}
            <PricingCard 
              title="Pro"
              description="Advanced tracking and insights"
              price={activeTab === "monthly" ? prices.monthly : prices.yearly}
              period={activeTab === "monthly" ? "month" : "year"}
              features={proPlanFeatures}
              isPopular={true}
              buttonVariant="primary"
              onButtonClick={handleProPlanClick}
              buttonText={isLoading ? "Loading..." : "Get Pro"}
            />

            {/* FAQs */}
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-2">FAQs</h3>
                <p className="text-gray-600 mb-8">Common questions about our plans</p>
                
                <div className="space-y-1">
                  <FAQItem 
                    question="Can I switch between plans?"
                    answer="Yes, you can upgrade or downgrade your plan at any time. Your billing will be adjusted automatically."
                    isOpen={openFAQs["item-1"]}
                    toggleOpen={() => toggleFAQ("item-1")}
                  />
                  <FAQItem 
                    question="Is there a free trial for Pro?"
                    answer="Yes, we offer a 14-day free trial of the Pro plan so you can experience all the premium features before committing."
                    isOpen={openFAQs["item-2"]}
                    toggleOpen={() => toggleFAQ("item-2")}
                  />
                  <FAQItem 
                    question="Can I cancel anytime?"
                    answer="Absolutely. There are no long-term contracts. You can cancel your subscription at any time with no cancellation fees."
                    isOpen={openFAQs["item-3"]}
                    toggleOpen={() => toggleFAQ("item-3")}
                  />
                </div>
                
                <div className="mt-8">
                  <button className="w-full py-3 font-medium rounded-full transition-colors border-2 border-gray-400 hover:bg-gray-50 hover:shadow-lg shadow-md text-gray-700">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

