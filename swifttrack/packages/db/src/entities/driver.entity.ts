import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('drivers')
@Index(['email'], { unique: true })
@Index(['nic'], { unique: true })
export class Driver {
  @PrimaryGeneratedColumn({ name: 'driver_id' })
  driverId: number;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 20, nullable: true, unique: true })
  nic: string;

  @Column({ name: 'vehicle_reg', length: 32, nullable: true })
  vehicleReg: string;

  @Column({ length: 20, nullable: true })
  mobile: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
