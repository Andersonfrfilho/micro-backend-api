import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from '@modules/shared/entities/notification.entity';
import { SharedProviderDatabaseImplementationsMongoModule } from '@modules/shared/providers/database/implementations/mongo/mongo.module';

import { CONNECTIONS_NAMES } from '@modules/shared/providers/database/database.constant';
import { SharedModule } from '@modules/shared/shared.module';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_CREATE_USE_CASE_PROVIDE,
  NOTIFICATION_DELETE_USE_CASE_PROVIDE,
  NOTIFICATION_GET_ALL_USE_CASE_PROVIDE,
  NOTIFICATION_GET_USE_CASE_PROVIDE,
  NOTIFICATION_MARK_ALL_AS_READ_USE_CASE_PROVIDE,
  NOTIFICATION_MARK_AS_READ_USE_CASE_PROVIDE,
  NOTIFICATION_REPOSITORY_PROVIDE,
  NOTIFICATION_SERVICE_PROVIDE,
  NOTIFICATION_UPDATE_USE_CASE_PROVIDE,
} from './notification.token';
import { NotificationRepository } from './repositories/notification.repository';
import { CreateNotificationUseCase } from './use-cases/create-notification.use-case';
import { DeleteNotificationUseCase } from './use-cases/delete-notification.use-case';
import { GetAllNotificationsUseCase } from './use-cases/get-all-notifications.use-case';
import { GetNotificationUseCase } from './use-cases/get-notification.use-case';
import { MarkAllAsReadUseCase } from './use-cases/mark-all-as-read.use-case';
import { MarkAsReadUseCase } from './use-cases/mark-as-read.use-case';
import { UpdateNotificationUseCase } from './use-cases/update-notification.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification], CONNECTIONS_NAMES.MONGO),
    SharedModule,
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY_PROVIDE,
      useClass: NotificationRepository,
    },
    {
      provide: NOTIFICATION_CREATE_USE_CASE_PROVIDE,
      useClass: CreateNotificationUseCase,
    },
    {
      provide: NOTIFICATION_GET_USE_CASE_PROVIDE,
      useClass: GetNotificationUseCase,
    },
    {
      provide: NOTIFICATION_GET_ALL_USE_CASE_PROVIDE,
      useClass: GetAllNotificationsUseCase,
    },
    {
      provide: NOTIFICATION_UPDATE_USE_CASE_PROVIDE,
      useClass: UpdateNotificationUseCase,
    },
    {
      provide: NOTIFICATION_DELETE_USE_CASE_PROVIDE,
      useClass: DeleteNotificationUseCase,
    },
    {
      provide: NOTIFICATION_MARK_AS_READ_USE_CASE_PROVIDE,
      useClass: MarkAsReadUseCase,
    },
    {
      provide: NOTIFICATION_MARK_ALL_AS_READ_USE_CASE_PROVIDE,
      useClass: MarkAllAsReadUseCase,
    },
    {
      provide: NOTIFICATION_SERVICE_PROVIDE,
      useClass: NotificationService,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY_PROVIDE, NOTIFICATION_SERVICE_PROVIDE],
})
export class NotificationModule {}
