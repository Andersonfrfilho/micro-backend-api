import { Inject, Injectable } from '@nestjs/common';

import type { NotificationRepositoryInterface } from '@modules/notification/notification.interface';
import { NOTIFICATION_REPOSITORY_PROVIDE } from '@modules/notification/notification.token';

import type {
  GetAllNotificationsUseCaseInterface,
  GetAllNotificationsUseCaseParams,
  GetAllNotificationsUseCaseResponse,
} from '../interfaces/notification.interfaces';

@Injectable()
export class GetAllNotificationsUseCase implements GetAllNotificationsUseCaseInterface {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PROVIDE)
    private readonly notificationRepository: NotificationRepositoryInterface,
  ) {}

  execute(
    params?: GetAllNotificationsUseCaseParams,
  ): Promise<GetAllNotificationsUseCaseResponse[]> {
    if (params?.userId) {
      return this.notificationRepository.findByUserId(params.userId);
    }
    return this.notificationRepository.findAll();
  }
}
