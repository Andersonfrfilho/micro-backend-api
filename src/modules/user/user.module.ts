import { LoggerModule } from '@adatechnology/logger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAddress } from '@modules/shared/entities/user-address.entity';
import { User } from '@modules/shared/entities/user.entity';
import { SharedModule } from '@modules/shared/shared.module';

import { AddressModule } from '../address/address.module';
import { PhoneModule } from '../phone/phone.module';
import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { UserApplicationCreateUseCase } from './use-cases/create-user.use-case';
import { UserAddressRepository } from './repositories/user-address.repository';
import { USER_ADDRESS_REPOSITORY_PROVIDE } from './user-address.token';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import {
  USER_CREATE_USE_CASE_PROVIDE,
  USER_REPOSITORY_PROVIDE,
  USER_SERVICE_PROVIDE,
} from './user.token';

@Module({
  imports: [
    LoggerModule.forRoot(),
    TypeOrmModule.forFeature([User, UserAddress], CONNECTIONS_NAMES.POSTGRES),
    SharedModule,
    PhoneModule,
    AddressModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY_PROVIDE,
      useClass: UserRepository,
    },
    {
      provide: USER_ADDRESS_REPOSITORY_PROVIDE,
      useClass: UserAddressRepository,
    },
    {
      provide: USER_CREATE_USE_CASE_PROVIDE,
      useClass: UserApplicationCreateUseCase,
    },
    {
      provide: USER_SERVICE_PROVIDE,
      useClass: UserService,
    },
  ],
  exports: [
    USER_REPOSITORY_PROVIDE,
    USER_SERVICE_PROVIDE,
    USER_CREATE_USE_CASE_PROVIDE,
    USER_ADDRESS_REPOSITORY_PROVIDE,
  ],
})
export class UserModule {}
