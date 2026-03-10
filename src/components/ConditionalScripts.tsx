'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { hasMarketingConsent } from '@/lib/consent';

/**
 * Component that conditionally loads ad scripts based on user consent
 */
export default function ConditionalScripts() {
  const [shouldLoadAds, setShouldLoadAds] = useState(false);

  useEffect(() => {
    // Check consent on mount
    setShouldLoadAds(hasMarketingConsent());

    // Listen for consent changes
    const handleConsentChange = (event: CustomEvent) => {
      const preferences = event.detail;
      setShouldLoadAds(preferences?.marketing ?? false);
    };

    window.addEventListener('consentChanged', handleConsentChange as EventListener);

    return () => {
      window.removeEventListener('consentChanged', handleConsentChange as EventListener);
    };
  }, []);

  if (!shouldLoadAds) {
    return null;
  }

  return (
    <>
      {/* Ad Network Scripts - Only loaded with marketing consent */}
      <Script 
        src="https://5gvci.com/act/files/tag.min.js?z=10691679" 
        data-cfasync="false" 
        strategy="afterInteractive"
      />
      <Script 
        id="vignette-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10691682',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
      <Script 
        id="tag-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10691683',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
    </>
  );
}
