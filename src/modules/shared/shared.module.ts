import { Module } from '@nestjs/common';

import { SharedProviderModule } from './providers/provider.module';

@Module({
  imports: [SharedProviderModule],
  exports: [SharedProviderModule],
})
export class SharedModule {}
