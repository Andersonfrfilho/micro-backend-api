import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { LOG_PROVIDER } from '@modules/shared/providers/log/log.token';
import { AppModule } from '../../../src/app.module';

describe('Health Module - Performance E2E Tests', () => {
  let app: NestFastifyApplication;

  const mockLogProvider = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LOG_PROVIDER)
      .useValue(mockLogProvider)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (error) {
      // Silently ignore DataSource not found errors (TypeORM cleanup issue with MONGO_URI)
      if ((error as Error).message?.includes('DataSource')) {
        console.warn('⚠️  DataSource cleanup error (expected with MONGO_URI)');
      } else {
        throw error;
      }
    }
  });

  describe('Response Time Metrics', () => {
    /**
     * ⏱️ Mede o tempo de resposta dos endpoints
     * - Garante que o servidor responde em tempo aceitável
     * - Ideal: < 150ms para endpoint /health
     */
    it('should respond to GET /health within 150ms', async () => {
      const startTime = Date.now();

      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const responseTime = Date.now() - startTime;
      expect(response.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(150);
    });

    /**
     * 📊 Testa múltiplas requisições sequenciais
     * - Garante que performance não degrada com chamadas repetidas
     */
    it('should maintain consistent response times across multiple calls', async () => {
      const responseTimes: number[] = [];
      const calls = 5;

      for (let i = 0; i < calls; i++) {
        const startTime = Date.now();
        const response = await app.inject({
          method: 'GET',
          url: '/health',
        });
        expect(response.statusCode).toBe(200);
        responseTimes.push(Date.now() - startTime);
      }

      // Verifica que todas as respostas estão dentro do limite
      for (const time of responseTimes) {
        expect(time).toBeLessThan(200);
      }

      // Calcula média
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / calls;

      // Verifica variação (não deve variar muito)
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      const variation = maxTime - minTime;
      expect(variation).toBeLessThan(100); // Variação máxima de 100ms
      expect(avgTime).toBeLessThan(150); // Média deve ser menor que 150ms
      expect(maxTime).toBeLessThan(200); // Tempo máximo deve ser menor que 200ms
      expect(minTime).toBeGreaterThanOrEqual(0); // Tempo mínimo deve ser >= 0
    });
  });

  describe('Payload Size Metrics', () => {
    /**
     * 📦 Mede o tamanho da resposta
     * - Garante que a resposta não está muito grande
     * - Ideal: < 2KB para resposta simples de saúde
     */
    it('should return small payload for GET /health', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const payloadSize = response.body.length;
      expect(payloadSize).toBeLessThan(2048); // < 2KB
    });
  });

  describe('HTTP Header Metrics', () => {
    /**
     * 🔍 Verifica headers de segurança e performance
     */
    it('should include performance-related headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      // Verifica headers básicos
      expect(response.headers['content-type']).toBeDefined();

      // Verifica se há headers de cache-control quando disponível
      if (response.headers['cache-control']) {
        expect(response.headers['cache-control']).toMatch(/^(public|private|no-cache|no-store)/);
      }
    });

    it('should have Content-Type header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Concurrent Request Metrics', () => {
    /**
     * 🔄 Testa como o servidor se comporta com requisições paralelas
     * - Garante que o servidor pode lidar com múltiplas requisições simultâneas
     */
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();

      // Executa 10 requisições em paralelo
      const promises = new Array(concurrentRequests).fill(null).map(() =>
        app.inject({
          method: 'GET',
          url: '/health',
        }),
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      for (const response of responses) {
        expect(response.statusCode).toBe(200);
      }

      expect(totalTime).toBeLessThan(2000); // Todas em menos de 2 segundos
    });

    it('should calculate average response time for concurrent requests', async () => {
      const concurrentRequests = 5;
      const responseTimes: number[] = [];

      const createConcurrentRequest = async (): Promise<number> => {
        const startTime = Date.now();
        const response = await app.inject({
          method: 'GET',
          url: '/health',
        });
        expect(response.statusCode).toBe(200);
        return Date.now() - startTime;
      };

      const promises = new Array(concurrentRequests)
        .fill(null)
        .map(() => createConcurrentRequest());

      const times = await Promise.all(promises);
      responseTimes.push(...times);

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / concurrentRequests;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      const variation = maxTime - minTime;

      expect(variation).toBeLessThan(100);
      expect(avgTime).toBeLessThan(200);
      expect(maxTime).toBeLessThan(250);
      expect(minTime).toBeGreaterThan(0);
    });
  });

  describe('Memory Metrics', () => {
    /**
     * 💾 Monitora uso de memória durante testes
     */
    it('should not have memory leaks during requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const requests = 20;

      // Executa múltiplas requisições
      for (let i = 0; i < requests; i++) {
        const response = await app.inject({
          method: 'GET',
          url: '/health',
        });
        expect(response.statusCode).toBe(200);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB

      expect(memoryIncrease).toBeLessThan(50); // Menos de 50MB de aumento
    });
  });

  describe('Error Handling Performance', () => {
    /**
     * ⚡ Verifica que erros são tratados rapidamente
     */
    it('should handle 404 errors quickly', async () => {
      const startTime = Date.now();

      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent',
      });

      const responseTime = Date.now() - startTime;
      expect(response.statusCode).toBe(404);
      expect(responseTime).toBeLessThan(100);
    });
  });
});
