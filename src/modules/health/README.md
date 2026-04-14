# 💚 Health Module

## 📋 Overview

Módulo responsável por verificar a saúde e disponibilidade do serviço. Fornece um endpoint de health check que pode ser utilizado por orquestradores (Docker, Kubernetes), load balancers e monitoramento.

---

## 🏗️ Arquitetura

O módulo segue a **Clean Architecture** com 4 camadas bem definidas:

### 🎯 Domain Layer (`domain/`)

Define as interfaces puras do domínio, sem dependências de framework.

```
domain/
├── health.get.interface.ts  ← Interfaces de UseCase e Service
```

**Responsabilidade:**

- `HealthCheckUseCaseInterface` - Contrato do UseCase
- `HealthCheckServiceInterface` - Contrato do Service
- Tipos: `HealthCheckServiceResponse`

### 🔧 Application Layer (`application/`)

Contém a lógica pura de negócio, isolada de detalhes técnicos.

```
application/
├── application.module.ts
└── use-cases/
    ├── health.get.use-case.ts  ← Lógica de health check
    └── use-cases.module.ts
```

**Responsabilidade:**

- `HealthCheckUseCase` - Executa a lógica de verificação
- Retorna status e mensagem
- **Sem dependências externas**

**Código:**

```typescript
@Injectable()
export class HealthCheckUseCase implements HealthCheckUseCaseInterface {
  execute(): HealthCheckServiceResponse {
    return {
      status: true,
      message: 'Health check passed',
    };
  }
}
```

### 🛠️ Infrastructure Layer (`infrastructure/`)

Implementa os detalhes técnicos, como orquestração e chamadas externas.

```
infrastructure/
├── health-check.service.ts     ← Orquestra o UseCase
├── health.provider.ts          ← Define tokens de injeção
├── health.infrastructure.module.ts
└── services/
    ├── health.service.module.ts
    └── health-check.service.spec.ts
```

**Responsabilidade:**

- `HealthCheckService` - Orquestra UseCase com logging e tratamento
- `health.provider.ts` - Define tokens de injeção de dependência
- Pode adicionar checks de database, cache, etc.

**Código:**

```typescript
@Injectable()
export class HealthCheckService implements HealthCheckServiceInterface {
  constructor(
    @Inject(HEALTH_CHECK_USE_CASE_PROVIDER)
    private readonly healthCheckUseCase: HealthCheckUseCaseInterface,
  ) {}

  execute(): HealthCheckServiceResponse {
    return this.healthCheckUseCase.execute();
  }
}
```

### 📦 Shared Layer (`shared/`)

Contém DTOs com validação e tipos compartilhados.

```
shared/
└── health.dto.ts  ← DTOs com validação
```

**Responsabilidade:**

- `HealthCheckResponseDto` - DTO de response com decoradores de validação
- `@ApiProperty()` - Documentação Swagger
- `@IsBoolean()` - Validação

**Código:**

```typescript
export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Indica se o serviço está saudável',
    example: true,
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Mensagem de status',
    example: 'Health check passed',
  })
  message: string;
}
```

---

## 🔄 Fluxo de Execução

```
┌─────────────────────────────────────────────────────────────┐
│                   GET /v1/health                            │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│        HealthController (@Inject SERVICE_PROVIDER)           │
│        Recebe requisição HTTP                                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│   HealthCheckService (@Injectable, )           │
│   Orquestra chamada do UseCase                               │
│   Pode adicionar logging, tratamento de erro, etc            │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│    HealthCheckUseCase (@Injectable, APPLICATION)             │
│    Executa lógica pura de health check                       │
│    Sem conhecimento de HTTP, banco de dados, etc             │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│          Return: HealthCheckServiceResponse                  │
│          { status: boolean, message: string }                │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│        ValidationPipe (validação com DTO)                    │
│        Garante que response atende contrato                  │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│             Return: JSON Response                            │
│    { "status": true, "message": "..." }                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📡 Endpoints

### Health Check Simples

```http
GET /v1/health HTTP/1.1
Host: localhost:3333
```

**Response (200 OK):**

```json
{
  "status": true,
  "message": "Health check passed"
}
```

**Response (503 Service Unavailable - Quando implementar checks):**

```json
{
  "status": false,
  "message": "Database connection failed"
}
```

---

## 🚀 Como Usar

### 1. Fazer requisição HTTP

**cURL:**

```bash
curl -X GET http://localhost:3333/v1/health
```

**JavaScript/TypeScript:**

```typescript
const response = await fetch('http://localhost:3333/v1/health');
const data = await response.json();
console.log(data); // { status: true, message: '...' }
```

### 2. Em Docker/Kubernetes

**Dockerfile:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3333/v1/health || exit 1
```

**Kubernetes:**

```yaml
livenessProbe:
  httpGet:
    path: /v1/health
    port: 3333
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /v1/health
    port: 3333
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## 📚 Estrutura de Arquivos

```
src/modules/health/
├── domain/
│   └── health.get.interface.ts         # Interfaces puras
├── application/
│   ├── application.module.ts           # Módulo da camada
│   └── use-cases/
│       ├── health.get.use-case.ts      # UseCase
│       └── use-cases.module.ts         # Módulo de use-cases
├── infrastructure/
│   ├── health-check.service.ts         # Service (orquestra)
│   ├── health.provider.ts              # Tokens de injeção
│   ├── health.infrastructure.module.ts # Módulo da camada
│   └── services/
│       ├── health.service.module.ts    # Módulo de services
│       └── health-check.service.spec.ts # Testes
├── shared/
│   └── health.dto.ts                   # DTOs e tipos
├── health.controller.ts                # Controller HTTP
├── health.module.ts                    # Módulo principal
└── README.md                           # Este arquivo
```

---

## 🧪 Testes

### Executar testes do módulo

```bash
# Todos os testes
npm test

# Apenas health
npm test -- health

# Com coverage
npm test -- health --coverage

# Watch mode
npm test -- health --watch
```

**Cobertura esperada:** 100%

---

## 🔄 Próximas Melhorias

### Curto Prazo (Próximos Sprints)

- [ ] Adicionar health check de **Database** (verificar conexão)
- [ ] Adicionar health check de **Cache** (Redis)
- [ ] Adicionar health check de **Serviços Externos** (APIs)
- [ ] Implementar **response time** no health check

### Médio Prazo

- [ ] Criar `/health/deep` para checks mais detalhados
- [ ] Implementar **Prometheus metrics** no health endpoint
- [ ] Adicionar **liveness probe** (`/ready`)
- [ ] Adicionar **readiness probe** (`/alive`)

### Exemplo Futuro: Health com Database

```typescript
// application/use-cases/health.get.use-case.ts
@Injectable()
export class HealthCheckUseCase implements HealthCheckUseCaseInterface {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async execute(): Promise<HealthCheckServiceResponse> {
    try {
      // Verificar database
      await this.databaseProvider.query('SELECT 1');

      return {
        status: true,
        message: 'Health check passed',
        checks: {
          database: 'ok',
          uptime: process.uptime(),
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'Database connection failed',
        checks: {
          database: 'error',
        },
      };
    }
  }
}
```

---

## 📖 Padrões Clean Architecture

Este módulo implementa os seguintes princípios:

### ✅ Separação de Responsabilidades

- **Domain** → Define contratos (interfaces)
- **Application** → Lógica de negócio pura
- **Infrastructure** → Detalhes técnicos
- **Shared** → DTOs e tipos compartilhados

### ✅ Dependência Unidirecional

```
Controller → Service → UseCase → Domain
    ↓
Sempre de fora para dentro, nunca de dentro para fora
```

### ✅ Independência de Framework

- UseCase não conhece NestJS
- UseCase não conhece HTTP
- UseCase não conhece banco de dados
- UseCase é apenas lógica de negócio

### ✅ Facilidade de Teste

```typescript
// Testar UseCase sem framework
describe('HealthCheckUseCase', () => {
  it('should return status true', () => {
    const useCase = new HealthCheckUseCase();
    const result = useCase.execute();
    expect(result.status).toBe(true);
  });
});
```

### ✅ Injeção de Dependência

Todas as dependências são injetadas, facilitando mocks em testes:

```typescript
@Injectable()
export class HealthCheckService implements HealthCheckServiceInterface {
  constructor(
    @Inject(HEALTH_CHECK_USE_CASE_PROVIDER)
    private readonly useCase: HealthCheckUseCaseInterface,
  ) {}
}
```

---

## 🐛 Troubleshooting

### Problema: Health check retorna erro 500

**Solução:**

1. Verifique se `HealthInfrastructureModule` está importado em `health.module.ts`
2. Verifique se providers estão definidos em `health.provider.ts`
3. Verifique logs: `docker logs <container>`

### Problema: Provider not found

**Solução:**

```typescript
// Adicione em health.provider.ts
export const HEALTH_CHECK_SERVICE_PROVIDER = 'HEALTH_CHECK_SERVICE';
export const HEALTH_CHECK_USE_CASE_PROVIDER = 'HEALTH_CHECK_USE_CASE';
```

### Problema: Endpoint não encontrado (404)

**Solução:**

1. Verifique se `HealthController` está registrado em `health.module.ts`
2. Verifique se `HealthModule` está importado em `app.module.ts`
3. Verifique a rota: deve estar em `/v1/health` ou conforme configurado

---

## 📞 Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Clean Architecture in Node.js](https://github.com/jbuican/nodejs-clean-architecture)
- [Health Checks Pattern](https://microservices.io/patterns/observability/health-check-api.html)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

---

## 👥 Contribuições

Se você quer estender este módulo com novos health checks:

1. Adicione o UseCase em `application/use-cases/`
2. Adicione o Service em `infrastructure/services/`
3. Adicione o DTO em `shared/`
4. Registre os providers em `health.provider.ts`
5. Importe no `health.module.ts`
6. Adicione testes

---

**Última atualização:** 01 de Novembro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Produção
