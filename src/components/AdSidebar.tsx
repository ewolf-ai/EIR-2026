'use client';

import { useEffect, useRef } from 'react';

interface AdSidebarProps {
  className?: string;
}

export default function AdSidebar({ className = '' }: AdSidebarProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (adRef.current && !scriptLoadedRef.current && typeof window !== 'undefined') {
      scriptLoadedRef.current = true;
      
      try {
        // Create container for the ad
        const adContainer = document.createElement('div');
        adContainer.id = `ad-sidebar-${Date.now()}`;
        
        // Create and append the script
        const adScript = document.createElement('script');
        adScript.type = 'text/javascript';
        adScript.async = true;
        adScript.setAttribute('data-cfasync', 'false');
        adScript.src = 'https://pl28853919.effectivegatecpm.com/de/f6/46/def646c778819384e9f60709b2fa20e6.js';
        
        adRef.current.appendChild(adContainer);
        adRef.current.appendChild(adScript);
      } catch (error) {
        console.error('Error loading sidebar ad:', error);
      }
    }
  }, []);

  return (
    <div className={`${className}`}>
      <div 
        ref={adRef}
        className="sticky top-4 min-h-[250px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        {/* Ad will be inserted here */}
      </div>
    </div>
  );
}
