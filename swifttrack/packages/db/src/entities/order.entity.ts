import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderSize, OrderWeight, OrderStatus } from '@swifttrack/shared';
import { User } from './user.entity';

@Entity('orders')
@Index(['userId'])
@Index(['status'])
@Index(['priority'])
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'order_size',
    type: 'enum',
    enum: OrderSize,
  })
  orderSize: OrderSize;

  @Column({
    name: 'order_weight',
    type: 'enum',
    enum: OrderWeight,
  })
  orderWeight: OrderWeight;

  @Column({ name: 'order_type', length: 50 })
  orderType: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PLACED,
  })
  status: OrderStatus;

  @Column({ name: 'failed_reason', type: 'text', nullable: true })
  failedReason: string;

  @Column({ default: false })
  priority: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'location_origin_lng', type: 'decimal', precision: 9, scale: 6, nullable: true })
  locationOriginLng: number;

  @Column({ name: 'location_origin_lat', type: 'decimal', precision: 9, scale: 6, nullable: true })
  locationOriginLat: number;

  @Column({ name: 'location_destination_lng', type: 'decimal', precision: 9, scale: 6, nullable: true })
  locationDestinationLng: number;

  @Column({ name: 'location_destination_lat', type: 'decimal', precision: 9, scale: 6, nullable: true })
  locationDestinationLat: number;

  @Column({ type: 'jsonb', default: '[]' })
  locations: any[];

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ name: 'proof_of_delivery_url', type: 'text', nullable: true })
  proofOfDeliveryUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
