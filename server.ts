// Backend API server using Hono
import { config } from 'dotenv';
import { Hono } from 'hono';

// Load .env.local for environment variables
config({ path: '.env.local' });
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import aiRoutes from './api/ai';

const app = new Hono();

// Enable CORS for frontend
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Mount AI routes
app.route('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

const port = 3001;
console.log(`Backend API server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
