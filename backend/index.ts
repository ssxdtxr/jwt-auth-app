import 'reflect-metadata';
import { app } from './app';
import { config } from './config/env';
import { initDb } from './db/data-source';

initDb()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server started on http://localhost:${config.port}`);
    });
  })
  .catch((err: Error) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });
