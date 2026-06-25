import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const workspaceRoot = '/Users/anicetreglat/Documents/GitHub/instaContextWinnerPicker';
const extensionDir = path.join(workspaceRoot, 'extension');
const downloadsDir = path.join(workspaceRoot, 'public', 'downloads');
const tempChromeDir = path.join(downloadsDir, 'chrome');
const tempFirefoxDir = path.join(downloadsDir, 'firefox');

// Ensure downloads directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Clean up previous folders/zips
const cleanDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
};

cleanDir(tempChromeDir);
cleanDir(tempFirefoxDir);

// List of extension files to copy
const filesToCopy = [
  'content.js',
  'content-app.js',
  'background.js',
  'popup/popup.html',
  'popup/popup.js'
];

// Helper to copy files
const copyExtensionFiles = (destDir) => {
  // Ensure popup subfolder exists
  fs.mkdirSync(path.join(destDir, 'popup'), { recursive: true });
  
  for (const file of filesToCopy) {
    const src = path.join(extensionDir, file);
    const dest = path.join(destDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
};

// 1. Package Chrome Extension
copyExtensionFiles(tempChromeDir);
fs.copyFileSync(
  path.join(extensionDir, 'manifest.json'),
  path.join(tempChromeDir, 'manifest.json')
);

// 2. Package Firefox Extension
copyExtensionFiles(tempFirefoxDir);
const manifestContent = fs.readFileSync(path.join(extensionDir, 'manifest.json'), 'utf8');
const manifest = JSON.parse(manifestContent);

// Adjust background settings for Firefox Manifest V3 compliance
if (manifest.background && manifest.background.service_worker) {
  const serviceWorkerFile = manifest.background.service_worker;
  delete manifest.background.service_worker;
  manifest.background.scripts = [serviceWorkerFile];
}

fs.writeFileSync(
  path.join(tempFirefoxDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Zip the directories using native macOS zip command
try {
  console.log("Zipping Chrome extension...");
  execSync(`zip -r ../extension-chrome.zip .`, { cwd: tempChromeDir });
  
  console.log("Zipping Firefox extension...");
  execSync(`zip -r ../extension-firefox.zip .`, { cwd: tempFirefoxDir });
  
  console.log("Packaging successful!");
} catch (error) {
  console.error("Error during zipping:", error);
} finally {
  // Clean up temporary folders
  fs.rmSync(tempChromeDir, { recursive: true, force: true });
  fs.rmSync(tempFirefoxDir, { recursive: true, force: true });
}
