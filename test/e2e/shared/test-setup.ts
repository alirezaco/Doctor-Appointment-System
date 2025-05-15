import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';

// Set test environment
process.env.NODE_ENV = 'test';

export async function createTestingApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const dataSource = moduleFixture.get<DataSource>(DataSource);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return { app, dataSource };
}

export async function cleanupDatabase(
  dataSource: DataSource,
  entity: string,
): Promise<void> {
  const repository = dataSource.getRepository(entity);
  await repository.clear();
}
