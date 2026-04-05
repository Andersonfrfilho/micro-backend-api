import { Module } from '@nestjs/common';

import { SharedProviderQueueProducerImplementationsModule } from './implementations/queue.producer.implementation.module';

@Module({
  imports: [SharedProviderQueueProducerImplementationsModule],
  exports: [SharedProviderQueueProducerImplementationsModule],
})
export class SharedProviderQueueProducerModule {}
