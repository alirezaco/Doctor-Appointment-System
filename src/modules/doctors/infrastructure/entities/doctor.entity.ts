import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AggregateRoot } from '@nestjs/cqrs';
import { DoctorCreatedEvent } from '../../domain/events/doctor-created.event';
import { DoctorUpdatedEvent } from '../../domain/events/doctor-updated.event';

@Entity('doctors')
export class Doctor extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  specialty: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Domain methods
  create() {
    this.apply(new DoctorCreatedEvent(this));
  }

  update(updates: Partial<Doctor>) {
    Object.assign(this, updates);
    this.apply(new DoctorUpdatedEvent(this));
  }
}
