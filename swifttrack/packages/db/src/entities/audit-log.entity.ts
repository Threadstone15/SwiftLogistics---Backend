import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ActorType } from '@swifttrack/shared';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: ActorType,
  })
  actorType: ActorType;

  @Column({ name: 'actor_id', type: 'bigint', nullable: true })
  actorId: number;

  @Column({ length: 64 })
  action: string;

  @Column({ length: 64 })
  entity: string;

  @Column({ name: 'entity_id', type: 'bigint', nullable: true })
  entityId: number;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn({ name: 'at' })
  at: Date;
}
