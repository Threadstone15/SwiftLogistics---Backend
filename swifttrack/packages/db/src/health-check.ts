import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Driver } from './entities/driver.entity';
import { Order } from './entities/order.entity';
import { WarehouseDetails } from './entities/warehouse-details.entity';

async function healthCheck() {
  console.log('🏥 Checking database health...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'swifttrack',
    synchronize: false,
    logging: false,
    entities: [User, Driver, Order, WarehouseDetails],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection successful');

    // Check if tables exist and have data
    const userCount = await dataSource.manager.count(User);
    const driverCount = await dataSource.manager.count(Driver);
    const orderCount = await dataSource.manager.count(Order);
    const warehouseCount = await dataSource.manager.count(WarehouseDetails);

    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Drivers: ${driverCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Warehouses: ${warehouseCount}`);

    if (userCount === 0) {
      console.log('⚠️  No users found. Consider running: pnpm db:seed');
    } else {
      console.log('✅ Database appears to be properly seeded');
    }

  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run health check if called directly
if (require.main === module) {
  healthCheck().catch(error => {
    console.error('Health check script failed:', error);
    process.exit(1);
  });
}

export default healthCheck;
