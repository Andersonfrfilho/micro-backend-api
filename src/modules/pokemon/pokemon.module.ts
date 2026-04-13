import { HttpModule } from '@adatechnology/http-client';
import { Module } from '@nestjs/common';

import { PokemonController } from './pokemon.controller';
import { HTTP_POKEMON } from './pokemon.token';

@Module({
  imports: [
    HttpModule.forRoot(
      { baseURL: 'https://pokeapi.co/api/v2', timeout: 10_000 },
      {
        provide: HTTP_POKEMON,
        logging: {
          enabled: true,
          environments: ['development', 'test', 'production'],
          types: ['request', 'response', 'error'],
          includeHeaders: false,
          includeBody: false,
          context: 'PokemonHttpClient',
        },
      },
    ),
  ],
  controllers: [PokemonController],
})
export class PokemonModule {}
