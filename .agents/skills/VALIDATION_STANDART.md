# Padrão de Mensagens de Validação

Este documento descreve como padronizar as mensagens de erro de validação (DTOs) na aplicação, utilizando a biblioteca `class-validator` e as funções do arquivo `ErrorMessages`.

## Localização das Constantes de Erro

Todas as funções geradoras de mensagens de erro ficarão centralizadas no arquivo: `src\modules\shared\domain\constants\error-messages.constant.ts`

```typescript
export const ErrorMessages = {
  empty: (param: string) => `O campo ${param} não pode estar vazio.`,
  'string.base': (param: string) => `O campo ${param} deve ser uma string.`,
  'boolean.base': (param: string) => `O campo ${param} deve ser do tipo booleano.`,
  // ... e outras validações.
};
```

## Como utilizar nos DTOs

Ao criar DTOs em Request/Payloads, sempre importe a constante `ErrorMessages` e passe a respectiva chave de validação como o atributo `message` nas anotações do `class-validator`. É necessário injetar o nome de apresentação do respectivo campo como parâmetro na função.

### Exemplo Base

```typescript
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorMessages } from '@modules/shared/constants/error-messages.constant';

export class DateStartAndEnd {
  @ApiProperty()
  @IsNotEmpty({ message: ErrorMessages['empty']('Data') })
  @IsString({ message: ErrorMessages['string.base']('Data') })
  dateTime: string;

  @ApiProperty({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString({ message: ErrorMessages['string.base']('Timezone') })
  timezone: string;
}
```

Isso garante consistência e padronização para o front-end ao consumir os erros `400 Bad Request` da nossa API.
