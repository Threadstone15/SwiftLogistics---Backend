import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('warehouse_details')
@Index(['location'])
export class WarehouseDetails {
  @PrimaryGeneratedColumn({ name: 'warehouse_id' })
  warehouseId: number;

  @Column({ type: 'text' })
  location: string;

  @Column({ name: 'no_of_items', default: 0 })
  noOfItems: number;

  @Column({ name: 'order_ids', type: 'bigint', array: true, default: '{}' })
  orderIds: number[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
