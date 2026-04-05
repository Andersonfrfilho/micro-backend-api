import { Module } from '@nestjs/common';

import { SharedProviderQueueProducerModule } from './producer/producer.module';

@Module({
  imports: [SharedProviderQueueProducerModule],
  exports: [SharedProviderQueueProducerModule],
})
export class SharedProviderQueueModule {}
