import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity';

@Entity('current_driver_plan')
export class CurrentDriverPlan {
  @PrimaryColumn({ name: 'driver_id' })
  driverId: number;

  @ManyToOne(() => Driver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'order_ids', type: 'bigint', array: true, default: '{}' })
  orderIds: number[];

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;
}
