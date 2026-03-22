import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { connectDB } from './db';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jiraRoutes = require('./routes/jiraRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/jira', jiraRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Workstream Express API is running' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

export default app;
