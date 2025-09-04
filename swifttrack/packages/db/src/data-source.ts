import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables
config();

import { User } from './entities/user.entity';
import { Driver } from './entities/driver.entity';
import { UserSession } from './entities/user-session.entity';
import { Order } from './entities/order.entity';
import { OngoingOrder } from './entities/ongoing-order.entity';
import { CurrentDriverPlan } from './entities/current-driver-plan.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseDetails } from './entities/warehouse-details.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Outbox } from './entities/outbox.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'swifttrack',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Driver,
    UserSession,
    Order,
    OngoingOrder,
    CurrentDriverPlan,
    Warehouse,
    WarehouseDetails,
    AuditLog,
    Outbox,
  ],
  migrations: ['dist/migrations/*.js'],
  subscribers: ['dist/subscribers/*.js'],
});

export default AppDataSource;
