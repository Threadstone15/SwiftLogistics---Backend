import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1692000000000 implements MigrationInterface {
    name = 'InitialSchema1692000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enums
        await queryRunner.query(`
            CREATE TYPE "user_type" AS ENUM('client', 'admin');
        `);
        
        await queryRunner.query(`
            CREATE TYPE "order_size" AS ENUM('small', 'medium', 'large');
        `);
        
        await queryRunner.query(`
            CREATE TYPE "order_weight" AS ENUM('light', 'medium', 'heavy');
        `);
        
        await queryRunner.query(`
            CREATE TYPE "order_status" AS ENUM(
                'placed', 'at_warehouse', 'picked', 'in_transit', 
                'delivered', 'confirmed', 'failed'
            );
        `);
        
        await queryRunner.query(`
            CREATE TYPE "actor_type" AS ENUM('user', 'driver', 'system');
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "user_id" SERIAL PRIMARY KEY,
                "email" VARCHAR(100) UNIQUE NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "user_type" "user_type" NOT NULL DEFAULT 'client',
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "last_login" TIMESTAMPTZ,
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create drivers table
        await queryRunner.query(`
            CREATE TABLE "drivers" (
                "driver_id" SERIAL PRIMARY KEY,
                "email" VARCHAR(100) UNIQUE NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "nic" VARCHAR(20) UNIQUE,
                "vehicle_reg" VARCHAR(32),
                "mobile" VARCHAR(20),
                "address" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "last_login" TIMESTAMPTZ,
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create user_sessions table
        await queryRunner.query(`
            CREATE TABLE "user_sessions" (
                "session_id" VARCHAR(255) PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
                "ip_address" VARCHAR(45),
                "user_agent" TEXT,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "expires_at" TIMESTAMPTZ NOT NULL
            );
        `);

        // Create orders table
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "order_id" BIGSERIAL PRIMARY KEY,
                "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
                "order_size" "order_size" NOT NULL,
                "order_weight" "order_weight" NOT NULL,
                "order_type" VARCHAR(50) NOT NULL,
                "status" "order_status" NOT NULL DEFAULT 'placed',
                "failed_reason" TEXT,
                "priority" BOOLEAN NOT NULL DEFAULT FALSE,
                "amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
                "address" TEXT NOT NULL,
                "location_origin_lng" NUMERIC(9,6),
                "location_origin_lat" NUMERIC(9,6),
                "location_destination_lng" NUMERIC(9,6),
                "location_destination_lat" NUMERIC(9,6),
                "locations" JSONB DEFAULT '[]',
                "special_instructions" TEXT,
                "proof_of_delivery_url" TEXT,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create ongoing_orders table
        await queryRunner.query(`
            CREATE TABLE "ongoing_orders" (
                "order_id" BIGINT PRIMARY KEY REFERENCES "orders"("order_id") ON DELETE CASCADE,
                "driver_id" INTEGER NOT NULL REFERENCES "drivers"("driver_id"),
                "location_origin_temp" JSONB,
                "location_destination_temp" JSONB,
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create current_driver_plan table
        await queryRunner.query(`
            CREATE TABLE "current_driver_plan" (
                "driver_id" INTEGER PRIMARY KEY REFERENCES "drivers"("driver_id") ON DELETE CASCADE,
                "order_ids" BIGINT[] NOT NULL DEFAULT '{}',
                "generated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create warehouse table
        await queryRunner.query(`
            CREATE TABLE "warehouse" (
                "order_id" BIGINT PRIMARY KEY REFERENCES "orders"("order_id") ON DELETE CASCADE,
                "section_no" VARCHAR(32),
                "rack_no" VARCHAR(32),
                "timestamp_arrived" TIMESTAMPTZ,
                "timestamp_departed" TIMESTAMPTZ
            );
        `);

        // Create warehouse_details table
        await queryRunner.query(`
            CREATE TABLE "warehouse_details" (
                "warehouse_id" SERIAL PRIMARY KEY,
                "location" TEXT NOT NULL,
                "no_of_items" INTEGER NOT NULL DEFAULT 0,
                "order_ids" BIGINT[] NOT NULL DEFAULT '{}',
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create audit_log table
        await queryRunner.query(`
            CREATE TABLE "audit_log" (
                "id" BIGSERIAL PRIMARY KEY,
                "actor_type" "actor_type" NOT NULL,
                "actor_id" BIGINT,
                "action" VARCHAR(64) NOT NULL,
                "entity" VARCHAR(64) NOT NULL,
                "entity_id" BIGINT,
                "details" JSONB,
                "at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create outbox table
        await queryRunner.query(`
            CREATE TABLE "outbox" (
                "id" BIGSERIAL PRIMARY KEY,
                "event_id" VARCHAR UNIQUE NOT NULL,
                "event_type" VARCHAR(100) NOT NULL,
                "aggregate_id" VARCHAR(100) NOT NULL,
                "aggregate_type" VARCHAR(50) NOT NULL,
                "payload" JSONB NOT NULL,
                "processed" BOOLEAN NOT NULL DEFAULT FALSE,
                "processed_at" TIMESTAMPTZ,
                "retry_count" INTEGER NOT NULL DEFAULT 0,
                "next_retry_at" TIMESTAMPTZ,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email");`);
        await queryRunner.query(`CREATE INDEX "idx_drivers_email" ON "drivers"("email");`);
        await queryRunner.query(`CREATE INDEX "idx_drivers_nic" ON "drivers"("nic");`);
        await queryRunner.query(`CREATE INDEX "idx_orders_user_id" ON "orders"("user_id");`);
        await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("status");`);
        await queryRunner.query(`CREATE INDEX "idx_orders_priority" ON "orders"("priority");`);
        await queryRunner.query(`CREATE INDEX "idx_warehouse_details_location" ON "warehouse_details"("location");`);
        await queryRunner.query(`CREATE INDEX "idx_outbox_processed" ON "outbox"("processed");`);
        await queryRunner.query(`CREATE INDEX "idx_outbox_event_type" ON "outbox"("event_type");`);
        await queryRunner.query(`CREATE INDEX "idx_audit_log_entity" ON "audit_log"("entity", "entity_id");`);
        await queryRunner.query(`CREATE INDEX "idx_audit_log_actor" ON "audit_log"("actor_type", "actor_id");`);

        // Create update trigger for updated_at columns
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_users_updated_at 
                BEFORE UPDATE ON "users" 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_drivers_updated_at 
                BEFORE UPDATE ON "drivers" 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_orders_updated_at 
                BEFORE UPDATE ON "orders" 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_ongoing_orders_updated_at 
                BEFORE UPDATE ON "ongoing_orders" 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_warehouse_details_updated_at 
                BEFORE UPDATE ON "warehouse_details" 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_warehouse_details_updated_at ON "warehouse_details";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_ongoing_orders_updated_at ON "ongoing_orders";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_orders_updated_at ON "orders";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_drivers_updated_at ON "drivers";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON "users";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "outbox";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "audit_log";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "warehouse_details";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "warehouse";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "current_driver_plan";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ongoing_orders";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "drivers";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users";`);

        // Drop types
        await queryRunner.query(`DROP TYPE IF EXISTS "actor_type";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "order_status";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "order_weight";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "order_size";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_type";`);
    }
}
