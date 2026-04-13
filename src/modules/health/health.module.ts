import { Module } from '@nestjs/common';

import { SharedModule } from '@modules/shared/shared.module';

import { HealthController } from './health.controller';
import { HEALTH_CHECK_SERVICE_PROVIDER } from './health.token';
import { HealthCheckService } from './services/health.check.service';
import { HealthUseCasesModule } from './use-cases/health-use-cases.module';

@Module({
  imports: [HealthUseCasesModule, SharedModule],
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
