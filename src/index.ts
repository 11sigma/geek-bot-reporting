import Dotenv from 'dotenv';

Dotenv.config();

import('./app.js')
  .then((m) => m.run())
  .then(() => console.log(`Saved in results.csv!`))
  .catch(console.error);
