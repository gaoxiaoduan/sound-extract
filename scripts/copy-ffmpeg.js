import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDest = path.join(projectRoot, 'public', 'ffmpeg');

const srcCore = path.join(projectRoot, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const srcCoreMt = path.join(projectRoot, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'esm');

function copyAndCompressDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory not found: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyAndCompressDir(srcPath, destPath);
    } else {
      if (entry.name.endsWith('.wasm')) {
        // Gzip compress the wasm file to bypass Cloudflare Pages 25MB file size limit
        console.log(`Compressing ${entry.name} with gzip...`);
        const wasmBuffer = fs.readFileSync(srcPath);
        const compressed = zlib.gzipSync(wasmBuffer, { level: 9 });
        fs.writeFileSync(destPath, compressed);
        const originalSize = (wasmBuffer.length / 1024 / 1024).toFixed(2);
        const compressedSize = (compressed.length / 1024 / 1024).toFixed(2);
        console.log(`Gzipped: ${entry.name} (${originalSize} MB -> ${compressedSize} MB) -> ${destPath}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${entry.name} to ${destPath}`);
      }
    }
  }
}

console.log('Copying and compressing FFmpeg WebAssembly core files...');
copyAndCompressDir(srcCore, path.join(publicDest, 'core'));
copyAndCompressDir(srcCoreMt, path.join(publicDest, 'core-mt'));
console.log('FFmpeg files processed successfully.');
