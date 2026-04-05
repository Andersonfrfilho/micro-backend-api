import { Module } from '@nestjs/common';

import { SharedProviderQueueProducerImplementationsRabbitMqModule } from './rabbitmq/rabbit.module';

@Module({
  imports: [SharedProviderQueueProducerImplementationsRabbitMqModule],
  exports: [SharedProviderQueueProducerImplementationsRabbitMqModule],
})
export class SharedProviderQueueProducerImplementationsModule {}
