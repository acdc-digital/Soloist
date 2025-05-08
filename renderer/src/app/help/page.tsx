// HELP PAGE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/help/page.tsx

"use client";

import { useSidebarStore } from "@/store/sidebarStore";

export default function HelpPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-gray-600">
            Welcome to the help section. Here you'll find information about using the application.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">How do I use the dashboard?</h3>
              <p className="text-gray-600 mt-1">The dashboard provides an overview of your data and quick access to key features.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Where can I find my settings?</h3>
              <p className="text-gray-600 mt-1">Settings can be accessed through the sidebar menu.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

