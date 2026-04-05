import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { HEALTH_CHECK_SERVICE_PROVIDER } from './health.token';
import { HealthCheckService } from './services/health.check.service';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [
    {
      provide: HEALTH_CHECK_SERVICE_PROVIDER,
      useClass: HealthCheckService,
    },
  ],
  exports: [HEALTH_CHECK_SERVICE_PROVIDER],
})
export class HealthModule {}
