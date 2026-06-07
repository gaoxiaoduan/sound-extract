import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDest = path.join(projectRoot, 'public', 'ffmpeg');

const srcCore = path.join(projectRoot, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const srcCoreMt = path.join(projectRoot, 'node_modules', '@ffmpeg', 'core-mt', 'dist', 'esm');

function copyDir(src, dest) {
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
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${entry.name} to ${destPath}`);
    }
  }
}

console.log('Copying FFmpeg WebAssembly core files...');
copyDir(srcCore, path.join(publicDest, 'core'));
copyDir(srcCoreMt, path.join(publicDest, 'core-mt'));
console.log('FFmpeg files copied successfully.');
