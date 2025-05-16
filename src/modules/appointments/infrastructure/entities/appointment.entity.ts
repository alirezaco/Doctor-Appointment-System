import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AggregateRoot } from '@nestjs/cqrs';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { AppointmentCreatedEvent } from '../../domain/events/appointment-created.event';
import { AppointmentCancelledEvent } from '../../domain/events/appointment-cancelled.event';
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('appointments')
export class Appointment extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'The ID of the appointment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn()
  @ApiProperty({
    description: 'The doctor associated with the appointment',
    example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'John Doe' },
  })
  doctor: Doctor;

  @ManyToOne(() => User)
  @JoinColumn()
  @ApiProperty({
    description: 'The patient associated with the appointment',
    example: { id: '123e4567-e89b-12d3-a456-426614174000', name: 'John Doe' },
  })
  patient: User;

  @Column({ type: 'timestamp' })
  @ApiProperty({
    description: 'The start time of the appointment',
    example: '2025-01-01T00:00:00.000Z',
  })
  startTime: Date;

  @Column({ type: 'timestamp' })
  @ApiProperty({
    description: 'The end time of the appointment',
    example: '2025-01-01T00:00:00.000Z',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  @ApiProperty({
    description: 'The status of the appointment',
    example: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'The notes of the appointment',
    example: 'This is a note',
  })
  notes: string;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The creation date of the appointment',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The last update date of the appointment',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  // Domain methods
  create() {
    this.apply(new AppointmentCreatedEvent(this));
  }

  cancel() {
    this.status = AppointmentStatus.CANCELLED;
    this.apply(new AppointmentCancelledEvent(this));
  }
}
