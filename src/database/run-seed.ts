import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { InitialData1709123456790 } from './seeds/1709123456790-InitialData';

// Load environment variables
config({ path: '.env.development' });

const dataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  // entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Running seed...');

    const seed = new InitialData1709123456790();

    if (process.argv[2] === 'up') {
      await seed.up(dataSource.createQueryRunner());
    } else if (process.argv[2] === 'down') {
      await seed.down(dataSource.createQueryRunner());
    } else {
      throw new Error('Invalid argument. Use "up" or "down".');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
}

runSeed();
