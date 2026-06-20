import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Address } from '../../modules/shared/entities/address.entity';
import { Phone } from '../../modules/shared/entities/phone.entity';
import { UserAddress } from '../../modules/shared/entities/user-address.entity';
import { User } from '../../modules/shared/entities/user.entity';
import { migrations } from '../../modules/shared/providers/database/migrations/index';
import { seedAddresses } from './seeders/address.seeder';
import { seedPhones } from './seeders/phone.seeder';
import { seedUserAddresses } from './seeders/user-address.seeder';
import { seedUsers } from './seeders/user.seeder';

// ─── Connection ──────────────────────────────────────────────────────────────

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_POSTGRES_PORT ?? '5432', 10),
  username: process.env.DATABASE_POSTGRES_USER ?? 'postgres',
  password: process.env.DATABASE_POSTGRES_PASSWORD ?? 'postgres1234',
  database: process.env.DATABASE_POSTGRES_NAME ?? 'backend_database_postgres',
  entities: [User, Phone, Address, UserAddress],
  migrations,
  synchronize: false,
  logging: false,
});

// ─── Guards ──────────────────────────────────────────────────────────────────

const REQUIRED_TABLES = ['users', 'phones', 'addresses', 'user_addresses'];

async function checkRequiredTables(ds: DataSource): Promise<void> {
  const queryRunner = ds.createQueryRunner();
  const missing: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const exists = await queryRunner.hasTable(table);
    if (!exists) missing.push(table);
  }

  await queryRunner.release();

  if (missing.length > 0) {
    console.error('\n❌ Missing tables detected. Run migrations first:\n');
    console.error('   npm run migration:run\n');
    console.error(`   Missing: ${missing.join(', ')}\n`);
    process.exit(1);
  }
}

async function checkEnumType(ds: DataSource): Promise<void> {
  const result = await ds.query(`
    SELECT 1 FROM pg_type WHERE typname = 'address_type_enum'
  `);

  if (!result.length) {
    console.error('\n❌ Enum type "address_type_enum" not found. Run migrations first:\n');
    console.error('   npm run migration:run\n');
    process.exit(1);
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log('\n🌱 Starting seed process...\n');

  await dataSource.initialize();
  console.log('✅ Database connected\n');

  console.log('🔍 Checking required tables and types...');
  await checkRequiredTables(dataSource);
  await checkEnumType(dataSource);
  console.log('✅ All checks passed\n');

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const seededUsers = await seedUsers(dataSource);
  const userIds = seededUsers.map((u) => u.id);
  console.log(`   → ${seededUsers.length} users processed\n`);

  // ── Addresses ──────────────────────────────────────────────────────────────
  console.log('🏠 Seeding addresses...');
  const addresses = await seedAddresses(dataSource);
  console.log(`   → ${addresses.length} addresses processed\n`);

  // ── Phones ─────────────────────────────────────────────────────────────────
  console.log('📱 Seeding phones...');
  const phones = await seedPhones(dataSource, userIds);
  console.log(`   → ${phones.length} phones processed\n`);

  // ── User ↔ Address links ───────────────────────────────────────────────────
  console.log('🔗 Seeding user-address links...');
  const userAddresses = await seedUserAddresses(dataSource, userIds, addresses);
  console.log(`   → ${userAddresses.length} links processed\n`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('✅ Seed completed!\n');
  console.log('📋 Credentials for manual testing:');
  console.log('   Password (all users): Test@1234');
  console.log('   Note: stored as SHA-256 hash in password_hash column\n');
  console.log('👤 Users created:');
  seededUsers.forEach((u) => console.log(`   • ${u.email}  (id: ${u.id})`));
  console.log('─'.repeat(60));

  await dataSource.destroy();
}

run().catch((err) => {
  console.error('\n💥 Seed failed:', err.message ?? err);
  process.exit(1);
});
