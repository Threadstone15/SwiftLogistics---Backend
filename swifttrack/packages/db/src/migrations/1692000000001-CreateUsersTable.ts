import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1692000000001 implements MigrationInterface {
    name = 'CreateUsersTable1692000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table if it doesn't exist
        const hasUsersTable = await queryRunner.hasTable('users');
        if (!hasUsersTable) {
            await queryRunner.createTable(
                new Table({
                    name: 'users',
                    columns: [
                        {
                            name: 'id',
                            type: 'uuid',
                            isPrimary: true,
                            generationStrategy: 'uuid',
                            default: 'uuid_generate_v4()',
                        },
                        {
                            name: 'email',
                            type: 'varchar',
                            length: '255',
                            isUnique: true,
                        },
                        {
                            name: 'name',
                            type: 'varchar',
                            length: '255',
                        },
                        {
                            name: 'password',
                            type: 'varchar',
                            length: '255',
                        },
                        {
                            name: 'role',
                            type: 'enum',
                            enum: ['admin', 'customer', 'driver', 'warehouse_manager'],
                            default: "'customer'",
                        },
                        {
                            name: 'phone',
                            type: 'varchar',
                            length: '20',
                            isNullable: true,
                        },
                        {
                            name: 'address',
                            type: 'text',
                            isNullable: true,
                        },
                        {
                            name: 'isActive',
                            type: 'boolean',
                            default: true,
                        },
                        {
                            name: 'emailVerified',
                            type: 'boolean',
                            default: false,
                        },
                        {
                            name: 'createdAt',
                            type: 'timestamp',
                            default: 'CURRENT_TIMESTAMP',
                        },
                        {
                            name: 'updatedAt',
                            type: 'timestamp',
                            default: 'CURRENT_TIMESTAMP',
                        },
                    ],
                }),
                true,
            );
        }

        // Ensure UUID extension is enabled
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users', true);
    }
}