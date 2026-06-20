import { DataSource } from 'typeorm';

import { Phone } from '../../../modules/shared/entities/phone.entity';

interface PhoneData {
  country: string;
  area: string;
  number: string;
  userId: string;
}

export async function seedPhones(
  dataSource: DataSource,
  userIds: string[],
): Promise<Phone[]> {
  const repository = dataSource.getRepository(Phone);

  // 2 phones per user: 1 mobile + 1 landline
  const phonesData: PhoneData[] = [
    // User 0 — Anderson Silva
    { country: '55', area: '11', number: '991234001', userId: userIds[0] },
    { country: '55', area: '11', number: '32341001', userId: userIds[0] },
    // User 1 — Mariana Oliveira
    { country: '55', area: '21', number: '992340002', userId: userIds[1] },
    { country: '55', area: '21', number: '33452002', userId: userIds[1] },
    // User 2 — Carlos Souza
    { country: '55', area: '31', number: '993450003', userId: userIds[2] },
    // User 3 — Fernanda Costa
    { country: '55', area: '41', number: '994560004', userId: userIds[3] },
    { country: '55', area: '41', number: '34563004', userId: userIds[3] },
    // User 4 — Roberto Pereira
    { country: '55', area: '51', number: '995670005', userId: userIds[4] },
  ];

  const results: Phone[] = [];

  for (const data of phonesData) {
    const existing = await repository.findOne({
      where: { country: data.country, area: data.area, number: data.number },
    });

    if (existing) {
      console.log(`  [skip] Phone already exists: +${data.country} (${data.area}) ${data.number}`);
      results.push(existing);
      continue;
    }

    const phone = repository.create({
      country: data.country,
      area: data.area,
      number: data.number,
      userId: data.userId,
    });

    const saved = await repository.save(phone);
    console.log(`  [ok]   Phone created: +${saved.country} (${saved.area}) ${saved.number} (id: ${saved.id})`);
    results.push(saved);
  }

  return results;
}
