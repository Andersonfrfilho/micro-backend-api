import { DataSource } from 'typeorm';

import { Address } from '../../../modules/shared/entities/address.entity';

interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

const ADDRESSES_DATA: AddressData[] = [
  {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310100',
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    street: 'Avenida Paulista',
    number: '1578',
    complement: 'Conjunto 12',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310200',
    latitude: -23.5631,
    longitude: -46.6544,
  },
  {
    street: 'Rua Barata Ribeiro',
    number: '302',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22011010',
    latitude: -22.9711,
    longitude: -43.1858,
  },
  {
    street: 'Avenida Atlântica',
    number: '1702',
    complement: 'Cobertura',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22021001',
    latitude: -22.9669,
    longitude: -43.1773,
  },
  {
    street: 'Rua dos Pinheiros',
    number: '56',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '05422010',
    latitude: -23.5652,
    longitude: -46.6844,
  },
  {
    street: 'Rua XV de Novembro',
    number: '980',
    complement: 'Sala 3',
    neighborhood: 'Centro',
    city: 'Curitiba',
    state: 'PR',
    zipCode: '80020310',
    latitude: -25.4296,
    longitude: -49.2711,
  },
  {
    street: 'Avenida Beira Mar',
    number: '3300',
    neighborhood: 'Agronômica',
    city: 'Florianópolis',
    state: 'SC',
    zipCode: '88025301',
    latitude: -27.5945,
    longitude: -48.5477,
  },
  {
    street: 'Rua da Consolação',
    number: '2100',
    complement: 'Bloco B, Apto 12',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01302000',
    latitude: -23.5509,
    longitude: -46.6635,
  },
];

export async function seedAddresses(dataSource: DataSource): Promise<Address[]> {
  const repository = dataSource.getRepository(Address);

  const results: Address[] = [];

  for (const data of ADDRESSES_DATA) {
    const existing = await repository.findOne({
      where: { street: data.street, number: data.number, zipCode: data.zipCode },
    });

    if (existing) {
      console.log(`  [skip] Address already exists: ${data.street}, ${data.number} - ${data.city}`);
      results.push(existing);
      continue;
    }

    const address = repository.create({
      street: data.street,
      number: data.number,
      complement: data.complement ?? '',
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country ?? 'BR',
      latitude: data.latitude,
      longitude: data.longitude,
      active: true,
    });

    const saved = await repository.save(address);
    console.log(`  [ok]   Address created: ${saved.street}, ${saved.number} - ${saved.city}/${saved.state} (id: ${saved.id})`);
    results.push(saved);
  }

  return results;
}
