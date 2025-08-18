import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('warehouse')
export class Warehouse {
  @PrimaryColumn({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'section_no', length: 32, nullable: true })
  sectionNo: string;

  @Column({ name: 'rack_no', length: 32, nullable: true })
  rackNo: string;

  @Column({ name: 'timestamp_arrived', type: 'timestamptz', nullable: true })
  timestampArrived: Date;

  @Column({ name: 'timestamp_departed', type: 'timestamptz', nullable: true })
  timestampDeparted: Date;
}
