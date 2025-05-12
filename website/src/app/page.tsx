// WEBSITE
// /Users/matthewsimon/Documents/Github/Soloist/website/src/app/page.tsx

'use client'

import React from "react";
import {
  Download,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import Pricing from "@/components/Pricing";
import { Navbar } from "@/components/Navbar";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

// Button component with styling
const Button = ({ children, className, variant = "default" }: ButtonProps) => {
  const baseStyles = "font-medium rounded-full transition-colors px-4 py-2";
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-200 hover:bg-gray-50"
  };
  
  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}>
      {children}
    </button>
  );
};

type AccordionItemProps = {
  question: string;
  children: React.ReactNode;
}

// Accordion component
const AccordionItem = ({ question, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border rounded-lg p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700 mb-4">
      <button 
        className="flex justify-between items-center w-full text-left font-medium px-4 py-3 dark:text-white"
        onClick={toggleOpen}
      >
        {question}
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pt-2 pb-4 text-gray-600 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar with Theme Toggle */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 md:w-full">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  #MoodForecasting.
                </p>
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4">
                  Track. Reflect. Forecast.
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Soloist turns your everyday thoughts into color-coded insights and automated Forecasts, so you always know where you stand and you can prepare for what&apos;s coming next.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button className="h-12 flex items-center gap-2">
                  <Download size={18} />
                  Download App
                </Button>
                <Button variant="outline" className="h-12 flex items-center gap-2">
                  Try Online Free <ChevronRight size={16} />
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 pt-4">
                Emotional heatmaps visualize your mood and predict tomorrow&apos;s.
              </p>
            </div>
            
            <div className="md:w-full relative">
              <div className="w-full max-w-xl mx-auto relative p-0 rounded-xl">
                <img 
                  src="/Hero-Img.png" 
                  alt="Soloist Application" 
                  className="w-full h-auto object-contain"
                  loading="eager"
                  width={1024}
                  height={768}
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Community Section */}
        <section className="py-4 border-y bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-12 mb-6">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-400 dark:border-zinc-600 p-5 rounded-full shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 dark:text-gray-200">
                    <path d="M12 1v6a2 2 0 0 0 2 2h6" />
                    <path d="M9 21h6a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L12 4" />
                    <path d="M8 17a5 5 0 1 0 0-10" />
                    <path d="M5 19a7 7 0 0 1 0-14" />
                  </svg>
                </div>
                <p className="font-medium dark:text-white">Open Code</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Fully transparent codebase</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-400 dark:border-zinc-600 p-5 rounded-full shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 dark:text-gray-200">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="font-medium dark:text-white">Community-Driven</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Shaped by our users</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-400 dark:border-zinc-600 p-5 rounded-full shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 dark:text-gray-200">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <p className="font-medium dark:text-white">Privacy-Focused</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Your data stays yours</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border border-zinc-400 dark:border-zinc-600 p-5 rounded-full shadow-sm mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800 dark:text-gray-200">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <line x1="10" x2="8" y1="9" y2="9" />
                  </svg>
                </div>
                <p className="font-medium dark:text-white">Transparent Roadmap</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Openly planned future</p>
              </div>
            </div>
            
            <div className="text-center">
              <a 
                href="https://github.com/acdc-digital/Soloist" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-indigo-700 text-white px-6 py-3 rounded-full hover:bg-indigo-800 transition-colors mb-2 text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                View on GitHub
              </a>
            </div>

            <div>
              <p className="text-center text-xs text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-4">
                Soloist is proudly open source, embracing transparency and collaboration.
                We believe in building technology that&apos;s accountable to its users and community.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 container mx-auto px-4 mt-8">
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row gap-8 mb-24">
            <div className="md:w-1/2 space-y-4">
              <h3 className="text-2xl font-bold dark:text-white">Your Daily Well-Being at a Glance.</h3>
              <p className="text-gray-600 dark:text-gray-300">
                The color-coded heatmap turns 365 scattered journal entries into one elegant, scrollable canvas. Instantly spot winning streaks, analyze looming slumps, and forecast your mood for tomorrow.
              </p>
              <div className="pt-4">
                <button className="flex items-center gap-2 p-0 font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
              {/* Feature8 image - temporarily disabled
              <div className="mt-18">
                <img 
                  src="/Feature8.png" 
                  alt="Daily Well-Being Dashboard" 
                  className="w-full h-auto object-contain"
                  loading="lazy"
                  width={1024}
                  height={768}
                />
              </div>
              */}
            </div>
            <div className="md:w-1/2 aspect-video w-full">
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <img 
                  src="/Feature1.png" 
                  alt="Feature 1 Screenshot" 
                  className="w-[85%] h-auto object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  loading="lazy"
                  width={1024}
                  height={768}
                />
              </div>
            </div>
          </div>
          
          {/* Feature 2 & 3 (Side by side) */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 2 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold dark:text-white">Review the Past, Ready the Future.</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Soloist&apos;s Playground lets you look back to learn—and gear up for what&apos;s coming next.
              </p>
              <div className="pt-4 mb-6">

              </div>
              <div className="aspect-video w-full">
                <div className="h-full w-full flex items-center justify-left text-gray-400">
                  <img 
                    src="/Feature3.png" 
                    alt="Feature 2 Screenshot" 
                    className="w-[95%] h-auto object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    loading="lazy"
                    width={1024}
                    height={768}
                  />
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold dark:text-white">See the Patterns. Shape the Progress.</h3>
              <p className="text-gray-600 dark:text-gray-300">
              pinpoint why today felt different, watch real-time charts reveal emerging trends, and tag moments before they fade.
              </p>
              <div className="pt-4 mb-6">

              </div>
              <div className="aspect-video w-full">
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <img 
                    src="/Feature6.png" 
                    alt="Feature 3 Screenshot" 
                    className="w-[90%] h-auto object-contain rounded-lg transition-shadow"
                    loading="lazy"
                    width={1024}
                    height={768}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 dark:text-white">FAQ Section</h2>
            
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
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">CTA Heading</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
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
      <footer className="bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Company Name. All Rights Reserved.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}