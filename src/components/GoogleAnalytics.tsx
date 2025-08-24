'use client';

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '../lib/analytics';

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              debug_mode: true
            });
            
            // Test that GA loaded properly
            setTimeout(() => {
              gtag('get', '${GA_MEASUREMENT_ID}', 'client_id', (cid) => {
                console.log('✅ GA4 loaded successfully, client_id:', cid);
              });
            }, 2000);
          `,
        }}
      />
    </>
  );
}