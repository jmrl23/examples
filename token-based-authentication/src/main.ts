import express from 'express';
import routes from './routes';

async function main() {
  const app = express();
  const port = parseInt(process.env.NODE_ENV ?? '3001');

  app.use(express.json());

  await routes(app);

  app.listen(port, function () {
    console.log('Listening on port', port);
  });
}

void main();
