import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { Account } from '../../domain/entities/Account';
import { mockApi } from '../api/mockApi';
import { AccountMapper } from '../mappers/AccountMapper';

export class MockAccountRepository implements IAccountRepository {
  async findById(id: string): Promise<Account | null> {
    const accountData = await mockApi.getAccount(id);
    return accountData ? AccountMapper.toDomain(accountData) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accountsData = await mockApi.getAccounts(userId);
    return accountsData.map(AccountMapper.toDomain);
  }

  async save(account: Account): Promise<void> {
    const accountData = AccountMapper.toPersistence(account);
    await mockApi.createAccount(accountData);
  }

  async update(account: Account): Promise<void> {
    const accountData = AccountMapper.toPersistence(account);
    await mockApi.updateAccount(accountData);
  }

  async delete(id: string): Promise<void> {
    await mockApi.deleteAccount(id);
  }
}