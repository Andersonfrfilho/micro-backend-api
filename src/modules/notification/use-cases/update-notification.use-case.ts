import { Inject, Injectable } from '@nestjs/common';

import type { NotificationRepositoryInterface } from '@modules/notification/notification.interface';
import { NOTIFICATION_REPOSITORY_PROVIDE } from '@modules/notification/notification.token';

import type {
  UpdateNotificationUseCaseInterface,
  UpdateNotificationUseCaseParams,
  UpdateNotificationUseCaseResponse,
} from '../interfaces/notification.interfaces';

@Injectable()
export class UpdateNotificationUseCase implements UpdateNotificationUseCaseInterface {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_PROVIDE)
    private readonly notificationRepository: NotificationRepositoryInterface,
  ) {}

  execute(params: UpdateNotificationUseCaseParams): Promise<UpdateNotificationUseCaseResponse> {
    const { id, ...updateData } = params;
    return this.notificationRepository.update(id, updateData);
  }
}
