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
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';
import { AvailabilityCreatedEvent } from '../../domain/events/availability-created.event';
import { AvailabilityUpdatedEvent } from '../../domain/events/availability-updated.event';
import { AvailabilityDeletedEvent } from '../../domain/events/availability-deleted.event';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('availability')
export class Availability extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn()
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Domain methods
  create() {
    this.apply(new AvailabilityCreatedEvent(this));
  }

  update() {
    this.apply(new AvailabilityUpdatedEvent(this));
  }

  delete() {
    this.apply(new AvailabilityDeletedEvent(this));
  }

  markAsUnavailable() {
    this.isAvailable = false;
  }
}
