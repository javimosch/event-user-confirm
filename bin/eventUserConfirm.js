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
      'public',
      'locales',
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

    // Install dependencies
    console.log('🔍 Installing dependencies...');
    await runCommand('npm', ['install'], targetDir);

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
