import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Driver } from '../entities/driver.entity';
import { Order } from '../entities/order.entity';
import { WarehouseDetails } from '../entities/warehouse-details.entity';
import { UserType, OrderSize, OrderWeight, OrderStatus } from '@swifttrack/shared';
import { PasswordService } from '@swifttrack/security';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const passwordService = new PasswordService();

    // Clear existing data (development only)
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.query('TRUNCATE TABLE "orders", "users", "drivers", "warehouse_details" RESTART IDENTITY CASCADE');
      console.log('🧹 Cleared existing data');
    }

    // Seed Users
    console.log('👥 Seeding users...');
    const users = [];
    
    // Admin user
    const adminUser = new User();
    adminUser.email = 'admin@swifttrack.com';
    adminUser.passwordHash = await passwordService.hash('Admin123!');
    adminUser.userType = UserType.ADMIN;
    users.push(adminUser);

    // Test clients
    for (let i = 1; i <= 5; i++) {
      const client = new User();
      client.email = `client${i}@example.com`;
      client.passwordHash = await passwordService.hash('Client123!');
      client.userType = UserType.CLIENT;
      users.push(client);
    }

    await AppDataSource.manager.save(User, users);
    console.log(`✅ Created ${users.length} users`);

    // Seed Drivers
    console.log('🚛 Seeding drivers...');
    const drivers = [];
    
    const driverData = [
      { email: 'driver1@swifttrack.com', nic: '199012345678', vehicleReg: 'CAA-1234', mobile: '+94712345678' },
      { email: 'driver2@swifttrack.com', nic: '199112345679', vehicleReg: 'CAB-5678', mobile: '+94712345679' },
      { email: 'driver3@swifttrack.com', nic: '199212345680', vehicleReg: 'CAC-9012', mobile: '+94712345680' },
    ];

    for (const data of driverData) {
      const driver = new Driver();
      driver.email = data.email;
      driver.passwordHash = await passwordService.hash('Driver123!');
      driver.nic = data.nic;
      driver.vehicleReg = data.vehicleReg;
      driver.mobile = data.mobile;
      driver.address = `${Math.floor(Math.random() * 100)} Driver Street, Colombo ${Math.floor(Math.random() * 15) + 1}`;
      drivers.push(driver);
    }

    await AppDataSource.manager.save(Driver, drivers);
    console.log(`✅ Created ${drivers.length} drivers`);

    // Seed Sample Orders
    console.log('📦 Seeding orders...');
    const orders = [];
    const savedUsers = await AppDataSource.manager.find(User, { where: { userType: UserType.CLIENT } });
    
    const orderTypes = ['standard_delivery', 'express_delivery', 'fragile_handling', 'cold_chain'];
    const addresses = [
      '123 Galle Road, Colombo 03',
      '456 Kandy Road, Kandy',
      '789 Negombo Road, Negombo',
      '321 Matara Road, Galle',
      '654 Jaffna Road, Jaffna',
    ];

    const locations = [
      { lng: 79.8612, lat: 6.9271 }, // Colombo
      { lng: 80.6337, lat: 7.2906 }, // Kandy
      { lng: 79.8358, lat: 7.2084 }, // Negombo
      { lng: 80.2170, lat: 6.0535 }, // Galle
      { lng: 80.0142, lat: 9.6615 }, // Jaffna
    ];

    for (let i = 0; i < 20; i++) {
      const order = new Order();
      order.user = savedUsers[i % savedUsers.length];
      order.orderSize = Object.values(OrderSize)[i % 3];
      order.orderWeight = Object.values(OrderWeight)[i % 3];
      order.orderType = orderTypes[i % orderTypes.length];
      order.priority = i % 5 === 0; // Every 5th order is priority
      order.amount = Math.floor(Math.random() * 500) + 100; // 100-600
      order.address = addresses[i % addresses.length];
      
      // Set origin (warehouse) and destination
      order.locationOriginLng = 79.8612; // Warehouse in Colombo
      order.locationOriginLat = 6.9271;
      order.locationDestinationLng = locations[i % locations.length].lng;
      order.locationDestinationLat = locations[i % locations.length].lat;
      
      order.specialInstructions = i % 3 === 0 ? 'Handle with care' : null;
      
      // Vary order status for testing
      const statuses = [OrderStatus.PLACED, OrderStatus.AT_WAREHOUSE, OrderStatus.PICKED, OrderStatus.IN_TRANSIT];
      order.status = statuses[i % statuses.length];
      
      orders.push(order);
    }

    await AppDataSource.manager.save(Order, orders);
    console.log(`✅ Created ${orders.length} orders`);

    // Seed Warehouse Details
    console.log('🏭 Seeding warehouse details...');
    const warehouses = [];
    
    const warehouseLocations = [
      'Colombo Central Warehouse',
      'Kandy Regional Hub',
      'Galle Distribution Center',
      'Negombo Sorting Facility',
    ];

    for (let i = 0; i < warehouseLocations.length; i++) {
      const warehouse = new WarehouseDetails();
      warehouse.location = warehouseLocations[i];
      warehouse.noOfItems = Math.floor(Math.random() * 100) + 50; // 50-150 items
      warehouse.orderIds = orders
        .filter((_, index) => index % warehouseLocations.length === i)
        .map(order => order.orderId)
        .slice(0, 10); // First 10 orders per warehouse
      warehouses.push(warehouse);
    }

    await AppDataSource.manager.save(WarehouseDetails, warehouses);
    console.log(`✅ Created ${warehouses.length} warehouse records`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length} (1 admin, ${users.length - 1} clients)`);
    console.log(`   Drivers: ${drivers.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Warehouses: ${warehouses.length}`);
    console.log('\n🔐 Default Credentials:');
    console.log('   Admin: admin@swifttrack.com / Admin123!');
    console.log('   Client: client1@example.com / Client123!');
    console.log('   Driver: driver1@swifttrack.com / Driver123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seed().catch(error => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
}

export default seed;
