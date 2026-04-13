import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { CacheProviderInterface } from '@adatechnology/cache';
import type { LoggerProviderInterface } from '@adatechnology/logger';

import type { HealthCheckServiceInterface } from '@modules/health/health.get.interface';
import { HealthCheckResponseDto } from './health.dto';
import { HealthController } from './health.controller';
import type { QueueProducerMessageProviderInterface } from '@modules/shared/providers/queue/producer/producer.interface';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: jest.Mocked<HealthCheckServiceInterface>;
  let mockCacheProvider: jest.Mocked<CacheProviderInterface>;
  let mockQueueProducer: jest.Mocked<QueueProducerMessageProviderInterface>;
  let mockLogger: jest.Mocked<LoggerProviderInterface>;

  beforeEach(() => {
    mockHealthCheckService = {
      execute: jest.fn(),
    } as any;

    mockCacheProvider = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;

    mockQueueProducer = {
      isHealthy: jest.fn(),
      send: jest.fn(),
      sendBatch: jest.fn(),
      sendDelayed: jest.fn(),
      sendWithTTL: jest.fn(),
      getMetrics: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    controller = new HealthController(
      mockHealthCheckService,
      mockCacheProvider,
      mockQueueProducer,
      mockLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('check', () => {
    it('should return health check response', () => {
      const mockResponse: HealthCheckResponseDto = {
        status: 'ok',
        timestamp: new Date(),
      };

      mockHealthCheckService.execute.mockReturnValue(mockResponse);

      const result = controller.check();

      expect(result).toEqual(mockResponse);
      expect(mockHealthCheckService.execute).toHaveBeenCalled();
    });
  });

  describe('testCache', () => {
    it('should return success when cache operations succeed', async () => {
      const testValue = { message: 'Hello from Redis cache!', timestamp: new Date().toISOString() };
      const encodedValue = Buffer.from(JSON.stringify(testValue)).toString('base64');

      mockCacheProvider.get
        .mockResolvedValueOnce('retrieved-value') // First call
        .mockResolvedValueOnce(encodedValue); // Second call (encrypted)

      mockCacheProvider.set.mockResolvedValue(undefined);
      mockCacheProvider.del.mockResolvedValue(undefined);

      const result = await controller.testCache();

      expect(result.success).toBe(true);
      expect(mockCacheProvider.set).toHaveBeenCalledTimes(2);
      expect(mockCacheProvider.get).toHaveBeenCalledTimes(2);
      expect(mockCacheProvider.del).toHaveBeenCalledTimes(2);
    });

    it('should return failure when cache operation fails', async () => {
      mockCacheProvider.set.mockRejectedValue(new Error('Cache error'));

      const result = await controller.testCache();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Redis cache test failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('testQueue', () => {
    it('should return success when queue operations succeed', async () => {
      mockQueueProducer.isHealthy.mockResolvedValue(true);
      mockQueueProducer.send.mockResolvedValue({ messageId: '123' } as any);
      mockQueueProducer.sendBatch.mockResolvedValue({ messageIds: ['1', '2'] } as any);
      mockQueueProducer.sendDelayed.mockResolvedValue({ messageId: '456' } as any);
      mockQueueProducer.sendWithTTL.mockResolvedValue({ messageId: '789' } as any);
      mockQueueProducer.getMetrics.mockReturnValue({} as any);

      await controller.testQueue();

      expect(mockQueueProducer.isHealthy).toHaveBeenCalled();
      expect(mockQueueProducer.send).toHaveBeenCalled();
      expect(mockQueueProducer.sendBatch).toHaveBeenCalled();
      expect(mockQueueProducer.getMetrics).toHaveBeenCalled();
    });

    it('should handle errors in queue operations', async () => {
      mockQueueProducer.isHealthy.mockRejectedValue(new Error('Queue error'));

      const result = await controller.testQueue();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Message queue test failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
