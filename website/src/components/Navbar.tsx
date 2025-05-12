"use client"

import React from "react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        <div className="flex items-center space-x-4">
          <h2 className="text-1xl md:text-3xl font-bold">Soloist.</h2>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-md">
          <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-gray-600 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-gray-600 transition-colors">FAQs</a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <button className="font-medium rounded-full transition-colors px-4 py-2 bg-white text-black hover:bg-gray-100 border border-black dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:border-gray-600">
            Login / Signup
          </button>
          <button className="font-medium rounded-full transition-colors px-4 py-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Get App
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 