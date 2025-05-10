'use client'

import React from "react";
import {
  Download,
  Star,
  ChevronRight,
  ArrowRight,
  HelpCircle
} from "lucide-react";

// Button component with styling
const Button = ({ children, className, variant = "default" }) => {
  const baseStyles = "font-medium rounded-full transition-colors px-4 py-2";
  const variantStyles = {
    default: "bg-black text-white hover:bg-gray-800",
    outline: "border border-gray-200 hover:bg-gray-50"
  };
  
  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}>
      {children}
    </button>
  );
};

// Accordion component
const AccordionItem = ({ question, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border rounded-lg p-2 bg-white mb-4">
      <button 
        className="flex justify-between items-center w-full text-left font-medium px-4 py-3"
        onClick={toggleOpen}
      >
        {question}
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pt-2 pb-4 text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 w-full bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">AppName</h2>
          </div>
          
          <nav className="hidden md:flex space-x-6 text-sm">
            <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-600 transition-colors">How It Works</a>
            <a href="#why-choose" className="hover:text-gray-600 transition-colors">Why Choose Us</a>
            <a href="#reviews" className="hover:text-gray-600 transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-gray-600 transition-colors">FAQs</a>
          </nav>
          
          <Button>
            Get App
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-6 md:w-1/2">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  #1 Rated App of 2025
                </p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  High Converting Heading Comes Here
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Use a clear headline, clear pitch, and app store buttons — give them a reason to scroll or download right away.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button className="h-12 flex items-center gap-2">
                  <Download size={18} />
                  Download App
                </Button>
                <Button variant="outline" className="h-12 flex items-center gap-2">
                  Learn More <ChevronRight size={16} />
                </Button>
              </div>
              
              <p className="text-sm text-gray-500">
                200K+ Downloads
              </p>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="bg-gray-100 rounded-2xl p-4 aspect-[9/16] w-full max-w-xs mx-auto">
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  App Preview
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Logos */}
        <section className="py-12 border-y bg-gray-50">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-medium text-gray-500 mb-8">
              WE ARE PARTNERED WITH MORE THAN 50+ COMPANIES AROUND THE GLOBE
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {["Logo 1", "Logo 2", "Logo 3", "Logo 4", "Logo 5"].map((logo, index) => (
                <div key={index} className="text-gray-400 font-medium">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Features Section</h2>
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-24">
            <div className="md:w-1/2 space-y-4">
              <h3 className="text-2xl font-bold">Highlighted Feature 1</h3>
              <p className="text-gray-600">
                Focus on solving specific customer issues and using visuals and copy to quickly show how your app solves real problems.
              </p>
              <div className="pt-4">
                <button className="flex items-center gap-2 p-0 font-medium text-blue-600 hover:text-blue-800">
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-100 rounded-xl aspect-video w-full">
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                Feature 1 Screenshot
              </div>
            </div>
          </div>
          
          {/* Feature 2 & 3 (Side by side) */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 2 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Highlighted Feature 2</h3>
              <p className="text-gray-600">
                Explain the benefit clearly and concisely.
              </p>
              <div className="pt-4 mb-6">
                <button className="flex items-center gap-2 p-0 font-medium text-blue-600 hover:text-blue-800">
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
              <div className="bg-gray-100 rounded-xl aspect-video w-full">
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  Feature 2 Screenshot
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Highlighted Feature 3</h3>
              <p className="text-gray-600">
                Keep descriptions focused on user benefits.
              </p>
              <div className="pt-4 mb-6">
                <button className="flex items-center gap-2 p-0 font-medium text-blue-600 hover:text-blue-800">
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
              <div className="bg-gray-100 rounded-xl aspect-video w-full">
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  Feature 3 Screenshot
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section id="why-choose" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Why Choose Us Section</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="text-center space-y-4">
                  <div className="mx-auto bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-sm">
                    <HelpCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold">Title</h3>
                  <p className="text-gray-600">
                    Use icons, brief titles, and benefits that help explain why users should pick your app over others.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Review Section */}
        <section id="reviews" className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Review Section</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((review) => (
              <div key={review} className="bg-white p-6 rounded-xl border">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  Testimonials with names, ratings, and short quotes help build authenticity and trust.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-sm text-gray-500">Country</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">FAQ Section</h2>
            
            <div className="max-w-3xl mx-auto">
              <AccordionItem question="Is it free to start?">
                Use collapsible questions to address common concerns without overwhelming the page.
              </AccordionItem>
              <AccordionItem question="How long does setup take?">
                Use collapsible questions to address common concerns without overwhelming the page.
              </AccordionItem>
              <AccordionItem question="What devices are supported?">
                Use collapsible questions to address common concerns without overwhelming the page.
              </AccordionItem>
              <AccordionItem question="How do I get help if needed?">
                Use collapsible questions to address common concerns without overwhelming the page.
              </AccordionItem>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">CTA Heading</h2>
            <p className="text-xl text-gray-600">
              Reinforce the download offer, repeat what matters most to your users, and make it very clear what the next step is.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="h-12 flex items-center gap-2">
                <Download size={18} />
                Download App
              </Button>
              <Button variant="outline" className="h-12 flex items-center gap-2">
                Learn More <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 Company Name. All Rights Reserved.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}