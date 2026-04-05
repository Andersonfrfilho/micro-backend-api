import { Module } from '@nestjs/common';

import { HEALTH_CHECK_USE_CASE_PROVIDER } from '@modules/health/health.token';
import { HealthCheckUseCase } from '@modules/health/use-cases/health.get.use-case';

@Module({
  providers: [
    {
      provide: HEALTH_CHECK_USE_CASE_PROVIDER,
      useClass: HealthCheckUseCase,
    },
  ],
  exports: [HEALTH_CHECK_USE_CASE_PROVIDER],
})
export class HealthUseCasesModule {}
