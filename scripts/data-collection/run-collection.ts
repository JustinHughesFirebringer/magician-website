import { spawn } from 'child_process';
import path from 'path';

async function runScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn('npx', ['ts-node', scriptPath], {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const scriptsDir = __dirname;
  
  try {
    console.log('Starting data collection process...');
    
    // Run the scraper
    console.log('\nRunning directory scraper...');
    await runScript(path.join(scriptsDir, 'directory-scraper.ts'));
    
    // Run the processor
    console.log('\nProcessing collected data...');
    await runScript(path.join(scriptsDir, 'data-processor.ts'));
    
    console.log('\nData collection and processing completed successfully!');
  } catch (error) {
    console.error('Error in data collection process:', error);
    process.exit(1);
  }
}

main();
