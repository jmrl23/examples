import etag from 'etag';
import Jimp from 'jimp';
import mime from 'mime-types';
import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';

interface HandlerOptions {
  staticDir: string;
  indexFiles?: string[];
}

export default async function staticHandler(
  request: IncomingMessage,
  response: ServerResponse,
  options: HandlerOptions,
) {
  const url = new URL(`http://localhost${request.url}`);
  let filePath = path.join(options.staticDir, url.pathname);

  const mimetype = mime.lookup(filePath);
  if (mimetype) response.setHeader('content-type', mimetype);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    for (const indexFile of options.indexFiles ?? ['index.html']) {
      const _filePath = path.resolve(filePath, indexFile);
      if (fs.existsSync(_filePath) && !fs.statSync(_filePath).isDirectory()) {
        filePath = _filePath;

        break;
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    response.statusCode = 404;
    response.end('File not found');

    return;
  }

  response.setHeader('cache-control', 'max-age=300');

  const isImage = mimetype.toString().startsWith('image');
  if (!isImage) {
    const content = fs.readFileSync(filePath);
    response.setHeader('etag', etag(content, { weak: false }));
    response.end(content);

    return;
  }

  const image = await Jimp.read(filePath);
  let width = parseInt(url.searchParams.get('width') ?? '');
  let height = parseInt(url.searchParams.get('height') ?? '');
  let quality = parseInt(url.searchParams.get('quality') ?? '');

  if (Number.isNaN(width) || width < 0) {
    width = image.getWidth();
  }

  if (Number.isNaN(height) || height < 0) {
    height = Jimp.AUTO;
  }

  if (Number.isNaN(quality) || quality < 0) {
    quality = 100;
  }

  const content = await image
    .background(0x000000)
    .contain(width, height)
    .quality(quality)
    .getBufferAsync(mimetype.toString());

  response.setHeader('content-length', content.length);
  response.setHeader('etag', etag(content, { weak: false }));
  response.end(content);
}
