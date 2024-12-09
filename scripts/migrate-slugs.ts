// Register ts-node for module resolution
import { register } from 'ts-node';
register({
  project: './tsconfig.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

import addSlugField from '@/lib/db/migrations/add-slug-field';

async function main() {
  try {
    console.log('Starting slug migration...');
    await addSlugField();
    console.log('Slug migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running slug migration:', error);
    process.exit(1);
  }
}

main();
