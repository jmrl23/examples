import http from 'node:http';
import path from 'node:path';
import staticHandler from './staticHandler';

const server = http.createServer(function handler(request, response) {
  staticHandler(request, response, {
    staticDir: path.resolve(__dirname, '../public'),
  });
});

export default server;
