import { Global, Module } from '@nestjs/common';

import { SharedProviderModule } from './providers/provider.module';

@Global()
@Module({
  imports: [SharedProviderModule],
  exports: [SharedProviderModule],
})
export class SharedModule {}
