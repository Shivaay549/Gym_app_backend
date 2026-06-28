import axios from 'axios';

// Render automatically defines process.env.RENDER_EXTERNAL_URL on your web service
const appUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

if (appUrl) {
  const pingUrl = `${appUrl}/api/ping`;
  const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

  console.log(`[Self-Ping] Initialized self-ping service targeting: ${pingUrl}`);

  setInterval(async () => {
    try {
      console.log(`[Self-Ping] Sending keep-alive request to: ${pingUrl}`);
      const response = await axios.get(pingUrl);
      console.log(`[Self-Ping] Keep-alive successful: status = ${response.data.status}`);
    } catch (error: any) {
      console.error(`[Self-Ping] Keep-alive failed: ${error.message}`);
    }
  }, PING_INTERVAL);
} else {
  console.log('[Self-Ping] No RENDER_EXTERNAL_URL or APP_URL defined. Self-ping is disabled (Development mode).');
}
