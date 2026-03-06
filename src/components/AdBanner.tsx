'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (adRef.current && !scriptLoadedRef.current && typeof window !== 'undefined') {
      scriptLoadedRef.current = true;
      
      try {
        // Create container for the ad
        const adContainer = document.createElement('div');
        adContainer.id = `ad-${Date.now()}`;
        
        // Create and append the invoke script
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.async = true;
        invokeScript.setAttribute('data-cfasync', 'false');
        invokeScript.src = '//www.highperformanceformat.com/ab7bf4e790396ec2699667b25edf831f/invoke.js';
        
        adRef.current.appendChild(adContainer);
        adRef.current.appendChild(invokeScript);
      } catch (error) {
        console.error('Error loading ad:', error);
      }
    }
  }, []);

  return (
    <div className={`flex justify-center items-center my-6 ${className}`}>
      <div 
        ref={adRef}
        className="min-h-[300px] w-full max-w-2xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        {/* Ad will be inserted here */}
      </div>
    </div>
  );
}
