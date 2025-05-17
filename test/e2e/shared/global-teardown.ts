import { DataSourceOptions, DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
dotenv.config({ path: '.env.test' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrationsRun: false,
};

export default async function globalTeardown() {
  const { database, ...tempOptions } = dataSourceOptions;
  const mysqlOptions = tempOptions as MysqlConnectionOptions;
  const tempDataSource = new DataSource(mysqlOptions);
  await tempDataSource.initialize();

  // Drop the test database
  await tempDataSource.query(`DROP DATABASE IF EXISTS ${database}`);
  await tempDataSource.destroy();
}
