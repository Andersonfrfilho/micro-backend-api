import { DataSource } from 'typeorm';

import { Address } from '../../../modules/shared/entities/address.entity';
import { UserAddress } from '../../../modules/shared/entities/user-address.entity';
import { AddressTypeEnum } from '../../../modules/shared/enums/address-type.enum';

interface UserAddressLink {
  userIndex: number;
  addressIndex: number;
  type: AddressTypeEnum;
  isPrimary: boolean;
}

const LINKS: UserAddressLink[] = [
  // Anderson Silva — endereço residencial principal + comercial
  { userIndex: 0, addressIndex: 0, type: AddressTypeEnum.RESIDENTIAL, isPrimary: true },
  { userIndex: 0, addressIndex: 1, type: AddressTypeEnum.COMMERCIAL, isPrimary: false },
  // Mariana Oliveira — residencial + entrega
  { userIndex: 1, addressIndex: 2, type: AddressTypeEnum.RESIDENTIAL, isPrimary: true },
  { userIndex: 1, addressIndex: 3, type: AddressTypeEnum.DELIVERY, isPrimary: false },
  // Carlos Souza — apenas residencial
  { userIndex: 2, addressIndex: 4, type: AddressTypeEnum.RESIDENTIAL, isPrimary: true },
  // Fernanda Costa — residencial + cobrança
  { userIndex: 3, addressIndex: 5, type: AddressTypeEnum.RESIDENTIAL, isPrimary: true },
  { userIndex: 3, addressIndex: 6, type: AddressTypeEnum.BILLING, isPrimary: false },
  // Roberto Pereira — residencial + entrega
  { userIndex: 4, addressIndex: 7, type: AddressTypeEnum.RESIDENTIAL, isPrimary: true },
  { userIndex: 4, addressIndex: 0, type: AddressTypeEnum.DELIVERY, isPrimary: false },
];

export async function seedUserAddresses(
  dataSource: DataSource,
  userIds: string[],
  addresses: Address[],
): Promise<UserAddress[]> {
  const repository = dataSource.getRepository(UserAddress);

  const results: UserAddress[] = [];

  for (const link of LINKS) {
    const userId = userIds[link.userIndex];
    const address = addresses[link.addressIndex];

    if (!userId || !address) {
      console.log(`  [warn] Skipping user-address link: userIndex=${link.userIndex}, addressIndex=${link.addressIndex} — missing data`);
      continue;
    }

    const existing = await repository.findOne({
      where: { userId, addressId: address.id, type: link.type },
    });

    if (existing) {
      console.log(`  [skip] UserAddress already exists: user ${userId} ↔ address ${address.id} (${link.type})`);
      results.push(existing);
      continue;
    }

    const userAddress = repository.create({
      userId,
      addressId: address.id,
      type: link.type,
      isPrimary: link.isPrimary,
    });

    const saved = await repository.save(userAddress);
    console.log(`  [ok]   UserAddress linked: user[${link.userIndex}] ↔ ${address.city}/${address.state} (${link.type}, primary=${link.isPrimary})`);
    results.push(saved);
  }

  return results;
}
