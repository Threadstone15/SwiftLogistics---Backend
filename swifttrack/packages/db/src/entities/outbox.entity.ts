import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('outbox')
@Index(['processed'])
@Index(['eventType'])
export class Outbox {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'event_id', unique: true })
  eventId: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column({ name: 'aggregate_id', length: 100 })
  aggregateId: string;

  @Column({ name: 'aggregate_type', length: 50 })
  aggregateType: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'next_retry_at', type: 'timestamptz', nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
