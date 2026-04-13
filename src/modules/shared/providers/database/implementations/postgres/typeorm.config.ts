import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../../../../entities/user.entity';
import { Phone } from '../../../../entities/phone.entity';
import { Address } from '../../../../entities/address.entity';
import { UserAddress } from '../../../../entities/user-address.entity';
import { migrations } from '../../migrations/index';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_POSTGRES_PORT || '5432', 10),
  username: process.env.DATABASE_POSTGRES_USER || 'postgres',
  password: process.env.DATABASE_POSTGRES_PASSWORD || 'postgres1234',
  database: process.env.DATABASE_POSTGRES_NAME || 'backend_database_postgres',
  entities: [User, Phone, Address, UserAddress],
  migrations: migrations,
  synchronize: false,
  logging: true,
});
