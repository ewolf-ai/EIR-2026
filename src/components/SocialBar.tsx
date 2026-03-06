'use client';

import { useEffect, useRef } from 'react';

interface SocialBarProps {
  className?: string;
}

export default function SocialBar({ className = '' }: SocialBarProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (adRef.current && !scriptLoadedRef.current && typeof window !== 'undefined') {
      scriptLoadedRef.current = true;
      
      try {
        // Create container for the ad
        const adContainer = document.createElement('div');
        adContainer.id = `ad-socialbar-${Date.now()}`;
        
        // Create and append the invoke script for Social Bar
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.async = true;
        invokeScript.setAttribute('data-cfasync', 'false');
        invokeScript.src = 'https://www.highperformanceformat.com/28753420/invoke.js';
        
        adRef.current.appendChild(adContainer);
        adRef.current.appendChild(invokeScript);
      } catch (error) {
        console.error('Error loading social bar ad:', error);
      }
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={adRef}
        className="min-h-[60px] flex items-center justify-center"
      >
        {/* Social Bar ad will be inserted here */}
      </div>
    </div>
  );
}
