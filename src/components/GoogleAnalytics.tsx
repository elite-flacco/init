'use client';

import { useEffect } from 'react';
import { initGA, GA_MEASUREMENT_ID } from '../lib/analytics';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Only initialize GA on client side and if measurement ID is configured
    if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
      initGA();
    }
  }, []);

  // Render the GA script tags for server-side rendering
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}