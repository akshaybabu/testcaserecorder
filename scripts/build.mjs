import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const distDir = path.join(buildDir, 'dist');

const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'content.css'
];

const directoriesToCopy = ['images'];
const jsFilesToObfuscate = ['background.js', 'content.js', 'popup.js'];

const obfuscationOptions = {
  compact: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: 'variable'
};

async function copyStaticAssets() {
  for (const file of filesToCopy) {
    await cp(path.join(rootDir, file), path.join(distDir, file));
  }

  for (const directory of directoriesToCopy) {
    await cp(path.join(rootDir, directory), path.join(distDir, directory), {
      recursive: true
    });
  }
}

async function obfuscateJavaScript() {
  for (const file of jsFilesToObfuscate) {
    const sourcePath = path.join(rootDir, file);
    const targetPath = path.join(distDir, file);
    const source = await readFile(sourcePath, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(source, obfuscationOptions);

    await writeFile(targetPath, result.getObfuscatedCode(), 'utf8');
  }
}

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(buildDir, { recursive: true });
  await mkdir(distDir, { recursive: true });

  await copyStaticAssets();
  await obfuscateJavaScript();

  console.log(`Obfuscated extension build created in ${distDir}`);
}

build().catch((error) => {
  console.error('Build failed.');
  console.error(error);
  process.exitCode = 1;
});
