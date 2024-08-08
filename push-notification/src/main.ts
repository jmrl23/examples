import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import path from 'node:path';
import webhook from './webhook';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const port = parseInt(process.env.PORT ?? '3001');
  const app = fastify();

  await app.register(webhook, { prefix: '/webhook' });

  await app.register(fastifyStatic, {
    root: path.resolve(__dirname, '../public'),
  });

  app.listen({ host: '0.0.0.0', port }, function () {
    console.log('listening on port', port);
  });
}

void main();
