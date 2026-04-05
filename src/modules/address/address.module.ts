import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Address } from '../shared/entities/address.entity';
import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { ADDRESS_REPOSITORY_PROVIDE } from './address.token';
import { AddressRepository } from './repositories/address.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Address], CONNECTIONS_NAMES.POSTGRES)],
  providers: [
    {
      provide: ADDRESS_REPOSITORY_PROVIDE,
      useClass: AddressRepository,
    },
  ],
  exports: [ADDRESS_REPOSITORY_PROVIDE],
})
export class AddressModule {}
