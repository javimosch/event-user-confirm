#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const targetDir = process.cwd();
    console.log('🚀 Setting up Event User Confirmation System...');

    // Create .env file if it doesn't exist
    const envPath = path.join(targetDir, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('📝 Ensure you set some envs...');
    }

    // Start the server
    require('../server.js');
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

main();
