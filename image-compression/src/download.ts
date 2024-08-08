import fs from 'node:fs';
import path from 'node:path';

// download sample image
export default async function download() {
  const url =
    'https://images.unsplash.com/photo-1655484704419-58277e774968?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb';
  const filePath = path.resolve(__dirname, '../public/sample.jpg');
  if (fs.existsSync(filePath)) return;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  console.log('sample image downloaded');
}
