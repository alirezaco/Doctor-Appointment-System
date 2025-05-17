import { DataSourceOptions, DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  url: process.env.DATABASE_URL_WITHOUT_DB,
  synchronize: false,
  migrationsRun: false,
};

export default async function globalSetup() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  // If the database doesn't exist, create it
  await dataSource.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`,
  );
  await dataSource.destroy();
}
