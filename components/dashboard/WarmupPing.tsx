'use client';

import { useEffect } from 'react';

export default function WarmupPing() {
  useEffect(() => {
    // Ping WhatsApp server to wake it up (Render free tier goes to sleep)
    const pingWhatsAppServer = async () => {
      try {
        const whatsappServerUrl = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL;
        if (whatsappServerUrl) {
          await fetch(`${whatsappServerUrl}/ping`, {
            method: 'GET',
            mode: 'cors',
          });
          console.log('WhatsApp server pinged for warmup');
        }
      } catch (error) {
        // Silent fail - this is just a warmup ping
        console.log('WhatsApp server warmup ping failed (server may be starting)');
      }
    };

    pingWhatsAppServer();
  }, []);

  // This component doesn't render anything
  return null;
}
