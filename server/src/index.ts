import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { scheduleScans, runScan } from './services/scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? '3001', 10);

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve built client in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🔍 eBay Misspelling Hunter`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   API:    http://localhost:${PORT}/api\n`);

  if (!process.env.EBAY_APP_ID) {
    console.warn('⚠️  EBAY_APP_ID not set. Add it to .env file to start scanning.\n');
  } else {
    // Run initial scan on startup, then schedule
    console.log('🚀 Starting initial scan...');
    runScan().catch(console.error);
    scheduleScans();
  }
});
