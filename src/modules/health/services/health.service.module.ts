import { Module } from '@nestjs/common';

import { HEALTH_CHECK_SERVICE_PROVIDER } from '@modules/health/health.token';
import { HealthCheckService } from '@modules/health/services/health.check.service';

import { HealthUseCasesModule } from '../use-cases/health-use-cases.module';

@Module({
  imports: [HealthUseCasesModule],
  providers: [
    {
      provide: HEALTH_CHECK_SERVICE_PROVIDER,
      useClass: HealthCheckService,
    },
  ],
  exports: [HEALTH_CHECK_SERVICE_PROVIDER],
})
export class HealthInfrastructureServiceModule {}
