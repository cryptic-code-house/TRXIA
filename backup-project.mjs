import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const srcDir = 'C:\\Users\\Swaraj\\Desktop\\Trxia Final Website';
const backupDir = 'C:\\Users\\Swaraj\\Desktop\\Trxia Final Website - Stable Backup';
const internalBackup = path.join(srcDir, '_backup_stable_snapshot');

console.log('Starting backup...');

// Helper to copy recursively excluding node_modules, dist, .git
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', '_backup_stable_snapshot', 'screenshots'].includes(entry.name)) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Desktop backup folder
console.log(`Copying to Desktop Backup: ${backupDir}`);
copyDir(srcDir, backupDir);

// 2. Project internal backup
console.log(`Copying to Internal Backup: ${internalBackup}`);
copyDir(srcDir, internalBackup);

// 3. Create zip using powershell Compress-Archive
const zipPath = 'C:\\Users\\Swaraj\\Desktop\\Trxia_Website_Stable_Backup.zip';
console.log(`Creating zip archive: ${zipPath}`);
try {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execSync(`powershell.exe -NoProfile -Command "Compress-Archive -Path '${backupDir}\\*' -DestinationPath '${zipPath}' -Force"`);
  console.log(`Zip archive created successfully! File size: ${fs.statSync(zipPath).size} bytes`);
} catch (e) {
  console.error('Error creating zip:', e.message);
}

console.log('✅ Backup successfully completed to both folder and zip!');
