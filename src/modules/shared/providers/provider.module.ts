import { Module } from '@nestjs/common';

import { SharedProviderDatabaseModule } from './database/database.module';
import { SharedProviderQueueModule } from './queue/queue.module';

@Module({
  imports: [SharedProviderDatabaseModule, SharedProviderQueueModule],
  exports: [SharedProviderDatabaseModule, SharedProviderQueueModule],
})
export class SharedProviderModule {}
