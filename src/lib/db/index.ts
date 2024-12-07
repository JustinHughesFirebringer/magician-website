import { sql } from '@vercel/postgres';

// Configure Neon to use WebSocket for pooling
// neonConfig.webSocketConstructor = WebSocket;
// neonConfig.useSecureWebSocket = false;
// neonConfig.fetchConnectionCache = true;

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Create a SQL connection
// const sql = neon(process.env.DATABASE_URL);

export { sql };
