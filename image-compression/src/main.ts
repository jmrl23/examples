import server from './server';
import download from './download';

async function main() {
  const port = parseInt(process.env.PORT ?? '3001');

  await download();

  server.listen(port, function () {
    console.log('listening on port', port);
  });
}

void main();
