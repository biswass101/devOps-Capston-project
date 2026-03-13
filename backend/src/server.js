require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const db = require('./db');
const { runMigrations } = require('./migrate');

function createApp() {
  const app = express();
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOptions = {
    origin:
      nodeEnv === 'production'
        ? process.env.FRONTEND_URL || 'http://localhost'
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  };

  app.use(cors(corsOptions));
  app.use(bodyParser.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: nodeEnv });
  });

  app.use('/api', routes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

async function startServer() {
  const port = process.env.PORT || 3000;

  if (process.env.SKIP_DB_CHECK !== 'true') {
    await db.verifyConnection();
    await runMigrations();
  }

  const app = createApp();
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API available at: http://localhost:${port}/api`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = {
  createApp,
  startServer
};
