import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Driver } from './driver.entity';

@Entity('ongoing_orders')
export class OngoingOrder {
  @PrimaryColumn({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'driver_id' })
  driverId: number;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'location_origin_temp', type: 'jsonb', nullable: true })
  locationOriginTemp: any;

  @Column({ name: 'location_destination_temp', type: 'jsonb', nullable: true })
  locationDestinationTemp: any;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
