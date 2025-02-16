#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to run a command and pipe its output
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    // Create target directory if it doesn't exist
    const targetDir = process.cwd();
    const packageDir = path.join(__dirname, '..');
    
    console.log('📦 Setting up Event User Confirm in:', targetDir);

    // Copy necessary files if they don't exist
    const filesToCopy = [
      'models',
      'views',
      'server.js',
      'tailwind.config.js'
    ];

    for (const file of filesToCopy) {
      const source = path.join(packageDir, file);
      const target = path.join(targetDir, file);
      
      if (!fs.existsSync(target)) {
        console.log(`📝 Creating ${file}...`);
        if (fs.statSync(source).isDirectory()) {
          fs.cpSync(source, target, { recursive: true });
        } else {
          fs.copyFileSync(source, target);
        }
      }
    }

    // Copy public files
    const publicPath = path.join(targetDir, 'public');
    if (!fs.existsSync(publicPath)) {
      console.log('📂 Creating public directory...');
      fs.mkdirSync(publicPath);
      fs.mkdirSync(path.join(publicPath, 'css'));
      fs.copyFileSync(
        path.join(__dirname, '../public/css/style.css'),
        path.join(publicPath, 'css/style.css')
      );
      fs.copyFileSync(
        path.join(__dirname, '../public/icon.svg'),
        path.join(publicPath, 'icon.svg')
      );
      // Generate favicon
      require('../scripts/generate-favicon.js');
    }

    // Copy locales
    const localesPath = path.join(targetDir, 'locales');
    if (!fs.existsSync(localesPath)) {
      console.log('📂 Creating locales directory...');
      fs.mkdirSync(localesPath);
      fs.cpSync(path.join(packageDir, 'locales'), localesPath, { recursive: true });
    }

    // Create .env file if it doesn't exist
    const envPath = path.join(targetDir, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file...');
      const envContent = `
MONGO_URI=mongodb://localhost:27017/eventDB
PORT=3000
PAGE_TITLE=EUC
      `.trim();
      fs.writeFileSync(envPath, envContent);
    }

    // Create package.json if it doesn't exist
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('📝 Creating package.json...');
      const packageJson = {
        name: 'event-user-confirm-instance',
        version: '1.0.0',
        private: true,
        dependencies: {
          "cookie-parser": "^1.4.6",
          "dotenv": "^16.3.1",
          "ejs": "^3.1.9",
          "express": "^4.18.2",
          "express-session": "^1.17.3",
          "i18n": "^0.15.1",
          "mongoose": "^8.0.3",
          "tailwindcss": "^3.4.0"
        }
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Install dependencies only if node_modules doesn't exist
    const nodeModulesPath = path.join(targetDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('🔍 Installing dependencies...');
      await runCommand('npm', ['install'], targetDir);
    } else {
      console.log('✅ Dependencies already installed');
    }

    // Build Tailwind CSS
    console.log('🎨 Building CSS...');
    await runCommand('npx', ['tailwindcss', '-i', './public/css/style.css', '-o', './public/css/output.css'], targetDir);

    // Start the server
    console.log('🚀 Starting server...');
    await runCommand('node', ['server.js'], targetDir);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
