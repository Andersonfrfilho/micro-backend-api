import { Address } from '@app/modules/shared/entities/address.entity';
import { Phone } from '@app/modules/shared/entities/phone.entity';
import { UserAddress } from '@app/modules/shared/entities/user-address.entity';
import { User } from '@app/modules/shared/entities/user.entity';
import { DataSource } from 'typeorm';

import {
  BenchmarkNanoidEntity,
  BenchmarkSnowflakeEntity,
  BenchmarkUUIDv4Entity,
  BenchmarkUUIDv7Entity,
} from '@app/modules/benchmark/entities/benchmark.entities';
import { getDatabaseConfig } from '@config/database-config';

import { migrations } from '../../migrations/index';

const config = getDatabaseConfig();
const PostgresDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  logging: config.postgres.logging,
  synchronize: config.postgres.synchronize,
  entities: [
    User,
    Phone,
    Address,
    UserAddress,
    BenchmarkUUIDv7Entity,
    BenchmarkNanoidEntity,
    BenchmarkSnowflakeEntity,
    BenchmarkUUIDv4Entity,
  ],
  migrations,
  migrationsRun: true,
});

export default PostgresDataSource;
