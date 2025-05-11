import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
              frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com;
              img-src 'self' data: https://*.stripe.com;
              connect-src 'self' https://api.stripe.com;
              style-src 'self' 'unsafe-inline' https://checkout.stripe.com;
              frame-ancestors 'self' http://localhost http://localhost:* https://localhost:* http://dev.soloist.local:* https://dev.soloist.local:*;
            `.replace(/\s+/g, ' ').trim()
          }
        ],
      },
    ];
  },
  
  // No rewrites needed for Stripe - it's handled directly via their JS libraries
  async rewrites() {
    return [];
  }
};

export default nextConfig;
