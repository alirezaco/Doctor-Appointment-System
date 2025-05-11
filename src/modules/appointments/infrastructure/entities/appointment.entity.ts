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

@Entity('appointments')
export class Appointment extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn()
  doctor: Doctor;

  @ManyToOne(() => User)
  @JoinColumn()
  patient: User;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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
