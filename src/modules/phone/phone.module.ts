import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PHONE_REPOSITORY_PROVIDE } from '@modules/phone/phone.token';
import { PhoneRepository } from '@modules/phone/repositories/phone.repository';

import { CONNECTIONS_NAMES } from '../shared/providers/database/database.constant';

import { Phone } from './entities/phone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Phone], CONNECTIONS_NAMES.POSTGRES)],
  providers: [
    {
      provide: PHONE_REPOSITORY_PROVIDE,
      useClass: PhoneRepository,
    },
  ],
  exports: [PHONE_REPOSITORY_PROVIDE],
})
export class PhoneModule {}
