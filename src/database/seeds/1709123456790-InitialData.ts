import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class InitialData1709123456790 implements MigrationInterface {
  name = 'InitialData1709123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await queryRunner.query(`
      INSERT INTO \`users\` (\`id\`, \`firstName\`, \`lastName\`, \`email\`, \`password\`, \`role\`)
      VALUES (UUID(), 'Admin', 'User', 'admin@example.com', '${adminPassword}', 'admin')
    `);

    // Create doctors
    const doctors = [
      {
        name: 'Dr. John Smith',
        specialty: 'Cardiology',
        bio: 'Experienced cardiologist with over 15 years of practice.',
      },
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'Pediatrics',
        bio: 'Pediatrician specializing in child development and care.',
      },
      {
        name: 'Dr. Michael Brown',
        specialty: 'Orthopedics',
        bio: 'Orthopedic surgeon with expertise in sports injuries.',
      },
    ];

    for (const doctor of doctors) {
      await queryRunner.query(`
        INSERT INTO \`doctors\` (\`id\`, \`name\`, \`specialty\`, \`bio\`)
        VALUES (UUID(), '${doctor.name}', '${doctor.specialty}', '${doctor.bio}')
      `);
    }

    // Create patients
    const patients = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@example.com',
      },
      {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol@example.com',
      },
    ];

    const patientPassword = await bcrypt.hash('patient123', 10);
    for (const patient of patients) {
      await queryRunner.query(`
        INSERT INTO \`users\` (\`id\`, \`firstName\`, \`lastName\`, \`email\`, \`password\`, \`role\`)
        VALUES (UUID(), '${patient.firstName}', '${patient.lastName}', '${patient.email}', '${patientPassword}', 'patient')
      `);
    }

    // Create availability for next 7 days
    const doctorIds = await queryRunner.query(`SELECT \`id\` FROM \`doctors\``);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      for (const doctor of doctorIds) {
        // Morning slots (9 AM to 12 PM)
        await queryRunner.query(`
          INSERT INTO \`availability\` (\`id\`, \`doctorId\`, \`date\`, \`startTime\`, \`endTime\`, \`isAvailable\`)
          VALUES (UUID(), '${doctor.id}', '${dateStr}', '09:00:00', '12:00:00', true)
        `);

        // Afternoon slots (2 PM to 5 PM)
        await queryRunner.query(`
          INSERT INTO \`availability\` (\`id\`, \`doctorId\`, \`date\`, \`startTime\`, \`endTime\`, \`isAvailable\`)
          VALUES (UUID(), '${doctor.id}', '${dateStr}', '14:00:00', '17:00:00', true)
        `);
      }
    }

    // Create some sample appointments for tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const patientIds = await queryRunner.query(`
      SELECT \`id\` FROM \`users\` WHERE \`role\` = 'patient' LIMIT 3
    `);

    for (let i = 0; i < 3; i++) {
      const doctor = doctorIds[i];
      const patient = patientIds[i];

      await queryRunner.query(`
        INSERT INTO \`appointments\` (
          \`id\`, \`doctorId\`, \`patientId\`, \`startTime\`, \`endTime\`, \`status\`, \`notes\`
        )
        VALUES (
          UUID(),
          '${doctor.id}',
          '${patient.id}',
          '${tomorrowStr} 09:00:00',
          '${tomorrowStr} 09:30:00',
          'scheduled',
          'Regular checkup'
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`appointments\``);
    await queryRunner.query(`DELETE FROM \`availability\``);
    await queryRunner.query(`DELETE FROM \`doctors\``);
    await queryRunner.query(
      `DELETE FROM \`users\` WHERE \`role\` IN ('doctor', 'patient')`,
    );
    await queryRunner.query(`DELETE FROM \`users\` WHERE \`role\` = 'admin'`);
  }
}
