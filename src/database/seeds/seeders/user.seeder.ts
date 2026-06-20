import { createHash } from 'crypto';

import { fakerPT_BR as faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { User } from '../../../modules/shared/entities/user.entity';

export interface SeededUser {
  id: string;
  name: string;
  email: string;
  plainPassword: string;
}

function hashPassword(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

function generateCpf(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  const calc = (arr: number[], length: number) => {
    const sum = arr.slice(0, length).reduce((acc, val, i) => acc + val * (length + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest >= 10 ? 0 : rest;
  };

  digits.push(calc(digits, 9));
  digits.push(calc(digits, 10));

  return digits.join('');
}

function generateRg(): string {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
}

const USERS_DATA = [
  {
    name: 'Anderson',
    lastName: 'Silva',
    email: 'anderson.silva@example.com',
    cpf: generateCpf(),
    rg: generateRg(),
    gender: 'M',
    plainPassword: 'Test@1234',
    birthDate: new Date('1990-03-15'),
    active: true,
    details: { role: 'admin', department: 'TI' },
  },
  {
    name: 'Mariana',
    lastName: 'Oliveira',
    email: 'mariana.oliveira@example.com',
    cpf: generateCpf(),
    rg: generateRg(),
    gender: 'F',
    plainPassword: 'Test@1234',
    birthDate: new Date('1992-07-22'),
    active: true,
    details: { role: 'user', plan: 'premium' },
  },
  {
    name: 'Carlos',
    lastName: 'Souza',
    email: 'carlos.souza@example.com',
    cpf: generateCpf(),
    rg: generateRg(),
    gender: 'M',
    plainPassword: 'Test@1234',
    birthDate: new Date('1985-11-08'),
    active: true,
    details: { role: 'user', plan: 'basic' },
  },
  {
    name: 'Fernanda',
    lastName: 'Costa',
    email: 'fernanda.costa@example.com',
    cpf: generateCpf(),
    rg: generateRg(),
    gender: 'F',
    plainPassword: 'Test@1234',
    birthDate: new Date('1998-01-30'),
    active: false,
    details: { role: 'user', plan: 'basic', inactivationReason: 'solicitação do usuário' },
  },
  {
    name: 'Roberto',
    lastName: 'Pereira',
    email: 'roberto.pereira@example.com',
    cpf: generateCpf(),
    rg: generateRg(),
    gender: 'M',
    plainPassword: 'Test@1234',
    birthDate: new Date('1978-05-19'),
    active: true,
    details: { role: 'user', plan: 'premium', vip: true },
  },
];

export async function seedUsers(dataSource: DataSource): Promise<SeededUser[]> {
  const repository = dataSource.getRepository(User);

  const results: SeededUser[] = [];

  for (const data of USERS_DATA) {
    const existing = await repository.findOne({ where: { email: data.email } });

    if (existing) {
      console.log(`  [skip] User already exists: ${data.email}`);
      results.push({ id: existing.id, name: existing.name, email: existing.email, plainPassword: data.plainPassword });
      continue;
    }

    const user = repository.create({
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      cpf: data.cpf,
      rg: data.rg,
      gender: data.gender,
      passwordHash: hashPassword(data.plainPassword),
      birthDate: data.birthDate,
      active: data.active,
      details: data.details,
    });

    const saved = await repository.save(user);
    console.log(`  [ok]   User created: ${saved.email} (id: ${saved.id})`);
    results.push({ id: saved.id, name: saved.name, email: saved.email, plainPassword: data.plainPassword });
  }

  return results;
}
