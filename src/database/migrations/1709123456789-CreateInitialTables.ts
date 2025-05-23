import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1709123456789 implements MigrationInterface {
  name = 'CreateInitialTables1709123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`firstName\` varchar(255) NOT NULL,
        \`lastName\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`role\` enum('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`UQ_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create doctors table
    await queryRunner.query(`
      CREATE TABLE \`doctors\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`specialty\` varchar(255) NOT NULL,
        \`bio\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create availability table
    await queryRunner.query(`
      CREATE TABLE \`availability\` (
        \`id\` varchar(36) NOT NULL,
        \`doctorId\` varchar(36) NOT NULL,
        \`date\` date NOT NULL,
        \`startTime\` time NOT NULL,
        \`endTime\` time NOT NULL,
        \`isAvailable\` boolean NOT NULL DEFAULT true,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`FK_availability_doctor\` (\`doctorId\`),
        CONSTRAINT \`FK_availability_doctor\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    // Create appointments table
    await queryRunner.query(`
      CREATE TABLE \`appointments\` (
        \`id\` varchar(36) NOT NULL,
        \`doctorId\` varchar(36) NOT NULL,
        \`patientId\` varchar(36) NOT NULL,
        \`availabilityId\` varchar(36) NOT NULL,
        \`status\` enum('scheduled', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled',
        \`notes\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`FK_appointments_doctor\` (\`doctorId\`),
        KEY \`FK_appointments_patient\` (\`patientId\`),
        KEY \`FK_appointments_availability\` (\`availabilityId\`),
        CONSTRAINT \`FK_appointments_doctor\` FOREIGN KEY (\`doctorId\`) REFERENCES \`doctors\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_appointments_patient\` FOREIGN KEY (\`patientId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_appointments_availability\` FOREIGN KEY (\`availabilityId\`) REFERENCES \`availability\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`appointments\``);
    await queryRunner.query(`DROP TABLE \`availability\``);
    await queryRunner.query(`DROP TABLE \`doctors\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
